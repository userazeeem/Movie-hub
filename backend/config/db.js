const mysql = require("mysql2");

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_CA
        ? { ca: process.env.DB_CA }
        : undefined,
    waitForConnections: true,
    connectionLimit: 5
});

pool.getConnection((err, conn) => {
    if (err) {
        console.error("❌ MySQL connection failed:", err.message);
        return;
    }

    console.log("✅ MySQL connected successfully!");
    conn.release();
});

module.exports = pool;