const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");


// =========================
// REGISTER
// =========================
router.post("/register", async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        // validar si existe email
        const existe = await pool.query(
            "SELECT id FROM usuarios WHERE email = $1",
            [email]
        );

        if (existe.rows.length > 0) {
            return res.status(400).json({ error: "El email ya está registrado" });
        }

        // hash password
        const hash = await bcrypt.hash(password, 10);

        await pool.query(
            `INSERT INTO usuarios (nombre, email, password, rol)
             VALUES ($1, $2, $3, 'cliente')`,
            [nombre, email, hash]
        );

        res.json({ mensaje: "Usuario creado correctamente" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error en register" });
    }
});


// =========================
// LOGIN
// =========================
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await pool.query(
            "SELECT * FROM usuarios WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: "Credenciales inválidas" });
        }

        const user = result.rows[0];

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            return res.status(400).json({ error: "Credenciales inválidas" });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                rol: user.rol
            },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.json({
            token,
            usuario: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error en login" });
    }
});

module.exports = router;