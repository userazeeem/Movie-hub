const jwt = require("jsonwebtoken");
const express = require("express");
const bcrypt = require("bcryptjs");

const db = require("../config/db");

const router = express.Router();


// ===============================
// Test Route
// ===============================
router.get("/test", (req, res) => {
    res.json({
        message: "Auth route is working!"
    });
});


// ===============================
// Register User
// ===============================
router.post("/register", async (req, res) => {
    try {

        const { username, email, password } = req.body;

        // Check required fields
        if (!username || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }


        // Check if username or email already exists
        const checkSql = `
            SELECT id
            FROM users
            WHERE username = ? OR email = ?
        `;

        db.query(
            checkSql,
            [username, email],
            async (err, results) => {

                if (err) {
                    console.error("❌ Database error:", err);

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


                // Insert user
                const insertSql = `
                    INSERT INTO users (
                        username,
                        email,
                        password_hash
                    )
                    VALUES (?, ?, ?)
                `;


                db.query(
                    insertSql,
                    [username, email, hashedPassword],
                    (err, result) => {

                        if (err) {
                            console.error(
                                "❌ Registration error:",
                                err
                            );

                            return res.status(500).json({
                                message: "Failed to create account"
                            });
                        }


                        res.status(201).json({
                            message: "Account created successfully!",
                            userId: result.insertId
                        });

                    }
                );

            }
        );

    } catch (error) {

        console.error("❌ Server error:", error);

        res.status(500).json({
            message: "Server error"
        });

    }
});


// ===============================
// Login User
// ===============================
router.post("/login", (req, res) => {

    const { username, password } = req.body;


    // Check required fields
    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }


    // Find user
    const sql = `
        SELECT id, username, email, password_hash
        FROM users
        WHERE username = ? OR email = ?
    `;


    db.query(
        sql,
        [username, username],
        async (err, results) => {

            // Database error
            if (err) {
                console.error("❌ Login database error:", err);

                return res.status(500).json({
                    message: "Database error"
                });
            }


            // User not found
            if (results.length === 0) {
                return res.status(401).json({
                    message: "Invalid username/email or password"
                });
            }


            const user = results[0];


            // Compare password
            const passwordMatch = await bcrypt.compare(
                password,
                user.password_hash
            );


            // Wrong password
            if (!passwordMatch) {
                return res.status(401).json({
                    message: "Invalid username/email or password"
                });
            }


            // Login successful
            res.status(200).json({
                message: "Login successful!",
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            });

        }
    );

});


module.exports = router;