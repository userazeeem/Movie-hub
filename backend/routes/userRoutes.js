const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/users/profile
router.get("/profile", authMiddleware, (req, res) => {
    db.query(
        "SELECT id, username, email, created_at FROM users WHERE id = ?",
        [req.user.id],
        (err, results) => {
            if (err) return res.status(500).json({ message: "Failed to load profile" });
            if (results.length === 0) return res.status(404).json({ message: "User not found" });
            res.json({ user: results[0] });
        }
    );
});

// GET /api/users/search?q=abc
router.get("/search", authMiddleware, (req, res) => {
    const q = (req.query.q || "").trim();
    if (!q) return res.json({ users: [] });

    const sql = `
        SELECT u.id, u.username,
               EXISTS(SELECT 1 FROM follows f
                      WHERE f.follower_id = ? AND f.following_id = u.id) AS is_following
        FROM users u
        WHERE u.username LIKE ? AND u.id != ?
        ORDER BY u.username ASC
        LIMIT 10
    `;
    db.query(sql, [req.user.id, `%${q}%`, req.user.id], (err, results) => {
        if (err) return res.status(500).json({ message: "Failed to search users" });
        res.json({ users: results });
    });
});

module.exports = router;