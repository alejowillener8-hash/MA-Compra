require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const pool = require("./db");
const app = express();


// =========================
// MIDDLEWARE GLOBAL
// =========================
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// =========================
// CONEXIÓN DB DEBUG
// =========================
pool.on("error", (err) => {
    console.error("❌ Error inesperado del Pool:", err);
});

async function verificarConexion() {
    try {
        const conexion = await pool.query(`
            SELECT current_database() AS db,
                   current_schema() AS schema
        `);

        console.log("🔎 CONECTADO A:", conexion.rows[0]);

        const tablas = await pool.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
        `);

        console.log("📦 TABLAS:");

        tablas.rows.forEach(t => console.log("-", t.table_name));

    } catch (error) {
        console.error("❌ ERROR DE CONEXIÓN:", error);
    }
}


// =========================
// RUTAS
// =========================

// 📦 PRODUCTOS (CATÁLOGO)
const productosRoutes = require("./routes/productos");
app.use("/api/productos", productosRoutes);

// 🔐 AUTH (LOGIN / REGISTER)  <-- lo vas a crear después
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// 🛒 CARRITO (lo vamos a crear después)
const carritoRoutes = require("./routes/carrito");
app.use("/api/carrito", carritoRoutes);


// =========================
// RUTA BASE
// =========================
app.get("/", (req, res) => {
    res.send("Servidor funcionando 🚀");
});


// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    console.log(`🚀 Servidor iniciado en puerto ${PORT}`);
    await verificarConexion();
});