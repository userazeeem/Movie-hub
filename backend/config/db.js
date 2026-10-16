const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");

function getCA() {
    if (process.env.DB_CA) {
        return process.env.DB_CA.replace(/\\n/g, "\n");
    }

    const file = path.join(__dirname, "..", "ca.pem");

    if (fs.existsSync(file)) {
        return fs.readFileSync(file);
    }

    return undefined;
}

const ca = getCA();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: ca ? { ca } : undefined,
    waitForConnections: true,
    connectionLimit: 2
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