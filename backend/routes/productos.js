// =========================================================================
// BLOQUE 1: CONFIGURACIÓN E IMPORTACIONES
// =========================================================================

const express = require("express");
const router = express.Router();
const pool = require("../db");
const upload = require("../config/multer");


// =========================================================================
// GET TODOS LOS PRODUCTOS (CATÁLOGO)
// =========================================================================

router.get("/", async (req, res) => {
    try {

        const result = await pool.query(`
            SELECT 
                p.*,

                (
                    SELECT i.url_imagen
                    FROM imagenes_producto i
                    WHERE i.producto_id = p.id
                    ORDER BY i.id
                    LIMIT 1
                ) AS imagen_principal,

                (
                    SELECT i.url_imagen
                    FROM imagenes_producto i
                    WHERE i.producto_id = p.id
                    ORDER BY i.id
                    OFFSET 1
                    LIMIT 1
                ) AS imagen_secundaria,

                COALESCE(
                    json_agg(DISTINCT t.nombre)
                    FILTER (WHERE t.nombre IS NOT NULL),
                    '[]'
                ) AS talles

            FROM productos p

            LEFT JOIN producto_talles pt
                ON pt.producto_id = p.id
                AND pt.stock > 0

            LEFT JOIN talles t
                ON t.id = pt.talle_id

            GROUP BY p.id
            ORDER BY p.id;
        `);

        const productos = result.rows.map(p => ({
            ...p,
            imagenes: [
                p.imagen_principal,
                p.imagen_secundaria
            ].filter(Boolean)
        }));

        res.json(productos);

    } catch (error) {
        console.error("Error GET productos:", error);
        res.status(500).json({ error: error.message });
    }
});


// =========================================================================
// GET PRODUCTO POR ID (DETALLE)
// =========================================================================

router.get("/:id", async (req, res) => {
    try {

        const { id } = req.params;

        const result = await pool.query(`
            SELECT 
                p.*,

                COALESCE(
                    json_agg(DISTINCT i.url_imagen)
                    FILTER (WHERE i.url_imagen IS NOT NULL),
                    '[]'
                ) AS imagenes,

                COALESCE(
                    json_agg(
                        DISTINCT jsonb_build_object(
                            'id', t.id,
                            'nombre', t.nombre,
                            'stock', pt.stock
                        )
                    )
                    FILTER (WHERE t.id IS NOT NULL),
                    '[]'
                ) AS talles,

                COALESCE(
                    json_agg(DISTINCT d.descripcion)
                    FILTER (WHERE d.descripcion IS NOT NULL),
                    '[]'
                ) AS detalles

            FROM productos p

            LEFT JOIN imagenes_producto i ON i.producto_id = p.id
            LEFT JOIN producto_talles pt ON pt.producto_id = p.id
            LEFT JOIN talles t ON t.id = pt.talle_id
            LEFT JOIN detalles_producto d ON d.producto_id = p.id

            WHERE p.id = $1
            GROUP BY p.id;
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Error GET producto:", error);
        res.status(500).json({ error: error.message });
    }
});


// =========================================================================
// POST PRODUCTO (CREAR)
// =========================================================================

router.post("/", upload.array("imagenes", 4), async (req, res) => {

    let client;

    try {

        client = await pool.connect();
        await client.query("BEGIN");

        const { nombre, precio, detalle, tallesYStock, tipologia, color } = req.body;

        const listaTalles = JSON.parse(tallesYStock);

        const resProducto = await client.query(`
            INSERT INTO productos (nombre, precio, tipologia, color)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        `, [nombre, precio, tipologia, color]);

        const idProducto = resProducto.rows[0].id;

        const prefijo = tipologia.substring(0, 3).toUpperCase();
        const codigo = `${prefijo}-${idProducto}`;

        await client.query(`
            UPDATE productos SET codigo = $1 WHERE id = $2
        `, [codigo, idProducto]);

        await client.query(`
            INSERT INTO detalles_producto (producto_id, descripcion)
            VALUES ($1, $2)
        `, [idProducto, detalle]);

        if (req.files?.length > 0) {
            for (const file of req.files) {
                await client.query(`
                    INSERT INTO imagenes_producto (producto_id, url_imagen)
                    VALUES ($1, $2)
                `, [idProducto, `/uploads/${file.filename}`]);
            }
        }

        for (const item of listaTalles) {

            const talleFind = await client.query(`
                SELECT id FROM talles WHERE nombre = $1
            `, [item.talle]);

            if (talleFind.rows.length > 0) {

                await client.query(`
                    INSERT INTO producto_talles (producto_id, talle_id, stock)
                    VALUES ($1, $2, $3)
                `, [
                    idProducto,
                    talleFind.rows[0].id,
                    item.stock
                ]);
            }
        }

        await client.query("COMMIT");

        res.status(201).json({
            mensaje: "Producto creado"
        });

    } catch (error) {

        if (client) await client.query("ROLLBACK");

        console.error(error);

        res.status(500).json({
            error: error.message
        });

    } finally {
        if (client) client.release();
    }
});

module.exports = router;