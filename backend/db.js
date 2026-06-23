require('dotenv').config(); // Carga las variables del .env
const { Pool } = require('pg');

// Crea el pool usando la URL de conexión
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // En Supabase, a veces es necesario configurar el SSL
    ssl: {
        rejectUnauthorized: false 
    }
});

// Prueba de conexión rápida
pool.connect((err, client, done) => {
    if (err) {
        console.error('❌ Error conectando a la base de datos:', err.stack);
    } else {
        console.log('✅ Conectado a la base de datos correctamente');
        done();
    }
});

module.exports = pool;