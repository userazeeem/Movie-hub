const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// ===============================
// REGISTER
// ===============================
router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({
            message: "Username, email and password are required"
        });
    }

    try {
        // Check if username or email already exists
        const checkSql = `
            SELECT * FROM users
            WHERE username = ? OR email = ?
        `;

        db.query(checkSql, [username, email], async (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({
                    message: "Database error"
                });
            }

            if (results.length > 0) {
                return res.status(409).json({
                    message: "Username or email already exists"
                });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            const insertSql = `
                INSERT INTO users
                (username, email, password_hash)
                VALUES (?, ?, ?)
            `;

            db.query(
                insertSql,
                [username, email, hashedPassword],
                (err, result) => {
                    if (err) {
                        console.error("Registration error:", err);
                        return res.status(500).json({
                            message: "Registration failed"
                        });
                    }

                    res.status(201).json({
                        message: "Registration successful!",
                        user: {
                            id: result.insertId,
                            username: username,
                            email: email
                        }
                    });
                }
            );
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});


// ===============================
// LOGIN
// ===============================
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    console.log("1. Login request received");

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], async (err, results) => {

        console.log("2. Database query completed");

        if (err) {
            console.error("Database error:", err);

            return res.status(500).json({
                message: "Database error"
            });
        }

        if (results.length === 0) {
            console.log("3. User not found");

            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = results[0];

        console.log("3. User found:", user.username);

        // Compare entered password with hashed password
        const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        console.log("4. Password checked:", passwordMatch);

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        console.log("5. Creating JWT...");

        // Create JWT token
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        console.log("6. JWT created");

        // Send response
        res.json({
            message: "Login successful!",
            token: token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    });
});


// ===============================
// AUTH TEST
// ===============================
router.get("/test", (req, res) => {
    res.send("Auth route is working!");
});

router.get("/protected", authMiddleware, (req, res) => {
    res.json({
        message: "You accessed a protected route!",
        user: req.user
    });
});
// Export router
module.exports = router;