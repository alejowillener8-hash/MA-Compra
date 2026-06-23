const express = require("express");
const router = express.Router();
const pool = require("../db");
const auth = require("../middleware/authMiddleware");


router.get("/", auth, async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(`
        SELECT 
            c.id,
            c.producto_id,
            c.nombre,
            c.precio,
            c.imagen,
            c.cantidad,
            COALESCE(t.nombre, 'Sin talle') AS talle
        FROM carrito c
        LEFT JOIN talles t 
            ON t.id = CAST(c.talle AS INTEGER)
        WHERE c.usuario_id = $1
        ORDER BY c.id DESC
    `, [userId]);

        res.json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener carrito" });
    }
});


// =========================
// AGREGAR AL CARRITO
// =========================
// =========================
// AGREGAR AL CARRITO
// =========================
router.post("/", auth, async (req, res) => {
    try {

        const userId = req.user.id;

        const {
            producto_id,
            nombre,
            precio,
            imagen,
            talle,
            cantidad
        } = req.body;

        // Obtener el stock real del producto y talle
        const stockResult = await pool.query(
            `SELECT stock
             FROM producto_talles
             WHERE producto_id = $1
             AND talle_id = $2`,
            [producto_id, talle]
        );

        if (stockResult.rows.length === 0) {
            return res.status(404).json({
                error: "No existe ese talle."
            });
        }

        const stock = stockResult.rows[0].stock;

        // Buscar si ya existe en el carrito
        const existe = await pool.query(
            `SELECT id, cantidad
             FROM carrito
             WHERE usuario_id = $1
             AND producto_id = $2
             AND talle = $3`,
            [userId, producto_id, talle]
        );

        if (existe.rows.length > 0) {

            const item = existe.rows[0];

            // Verificar stock antes de aumentar
            if (item.cantidad + cantidad > stock) {
                return res.status(400).json({
                    error: `Solo hay ${stock} unidades disponibles`
                });
            }

            await pool.query(
                `UPDATE carrito
                 SET cantidad = $1
                 WHERE id = $2`,
                [item.cantidad + cantidad, item.id]
            );

            return res.json({
                mensaje: "Cantidad actualizada"
            });
        }

        // Si es un producto nuevo
        if (cantidad > stock) {
            return res.status(400).json({
                error: `Solo hay ${stock} unidades disponibles`
            });
        }

        await pool.query(
            `INSERT INTO carrito
            (usuario_id, producto_id, nombre, precio, imagen, talle, cantidad)
            VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [
                userId,
                producto_id,
                nombre,
                precio,
                imagen,
                talle,
                cantidad
            ]
        );

        res.json({
            mensaje: "Producto agregado"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Error al agregar al carrito"
        });

    }
});


// =========================
// ELIMINAR ITEM
// =========================
router.delete("/:id", auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const itemId = req.params.id;

        await pool.query(
            "DELETE FROM carrito WHERE id = $1 AND usuario_id = $2",
            [itemId, userId]
        );

        res.json({ mensaje: "Item eliminado" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al eliminar" });
    }
});


// =========================
// SUMAR ITEM
// =========================
// =========================
// SUMAR ITEM
// =========================
router.put("/:id/sumar", auth, async (req, res) => {
    try {

        const userId = req.user.id;
        const itemId = req.params.id;

        // Obtener información del item
        const itemResult = await pool.query(
            `SELECT producto_id, talle, cantidad
             FROM carrito
             WHERE id = $1
             AND usuario_id = $2`,
            [itemId, userId]
        );

        if (itemResult.rows.length === 0) {
            return res.status(404).json({
                error: "Producto no encontrado."
            });
        }

        const item = itemResult.rows[0];

        // Obtener stock real
        const stockResult = await pool.query(
            `SELECT stock
             FROM producto_talles
             WHERE producto_id = $1
             AND talle_id = $2`,
            [item.producto_id, item.talle]
        );

        const stock = stockResult.rows[0].stock;

        if (item.cantidad >= stock) {
            return res.status(400).json({
                error: `Solo hay ${stock} unidades disponibles`
            });
        }

        await pool.query(
            `UPDATE carrito
             SET cantidad = cantidad + 1
             WHERE id = $1
             AND usuario_id = $2`,
            [itemId, userId]
        );

        res.json({
            mensaje: "Cantidad aumentada"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Error al aumentar cantidad"
        });

    }
});


// =========================
// RESTAR ITEM
// =========================
router.put("/:id/restar", auth, async (req, res) => {
    try {

        const userId = req.user.id;
        const itemId = req.params.id;

        await pool.query(
            `UPDATE carrito
             SET cantidad = cantidad - 1
             WHERE id = $1
             AND usuario_id = $2
             AND cantidad > 1`,
            [itemId, userId]
        );

        res.json({
            mensaje: "Cantidad disminuida"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Error al disminuir cantidad"
        });

    }
});


module.exports = router;