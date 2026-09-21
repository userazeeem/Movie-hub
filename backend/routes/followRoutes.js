const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// FOLLOW USER
router.post("/add/:following_id", authMiddleware, (req, res) => {
    const followerId = req.user.id;
    const followingId = req.params.following_id;

    // Prevent following yourself
    if (String(followerId) === String(followingId)) {
        return res.status(400).json({
            message: "You cannot follow yourself"
        });
    }

    // Check if user exists
    const checkUserSql = `
        SELECT id, username
        FROM users
        WHERE id = ?
    `;

    db.query(checkUserSql, [followingId], (err, users) => {
        if (err) {
            console.error("Check user error:", err);
            return res.status(500).json({
                message: "Failed to check user"
            });
        }

        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Check if already following
        const checkFollowSql = `
            SELECT id
            FROM follows
            WHERE follower_id = ?
            AND following_id = ?
        `;

        db.query(
            checkFollowSql,
            [followerId, followingId],
            (err, follows) => {
                if (err) {
                    console.error("Check follow error:", err);
                    return res.status(500).json({
                        message: "Failed to check follow status"
                    });
                }

                if (follows.length > 0) {
                    return res.status(400).json({
                        message: "You are already following this user"
                    });
                }

                // Add follow
                const insertSql = `
                    INSERT INTO follows
                    (follower_id, following_id)
                    VALUES (?, ?)
                `;

                db.query(
                    insertSql,
                    [followerId, followingId],
                    (err, result) => {
                        if (err) {
                            console.error("Follow error:", err);
                            return res.status(500).json({
                                message: "Failed to follow user"
                            });
                        }

                        res.status(201).json({
                            message: "User followed successfully!",
                            follow_id: result.insertId
                        });
                    }
                );
            }
        );
    });
});

// GET USERS I AM FOLLOWING
router.get("/following", authMiddleware, (req, res) => {
    const userId = req.user.id;

    const sql = `
        SELECT
            follows.id,
            follows.following_id,
            users.username,
            follows.created_at
        FROM follows
        JOIN users
            ON follows.following_id = users.id
        WHERE follows.follower_id = ?
        ORDER BY follows.created_at DESC
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Get following error:", err);
            return res.status(500).json({
                message: "Failed to fetch following list"
            });
        }

        res.json({
            message: "Following list retrieved successfully!",
            following_count: results.length,
            following: results
        });
    });
});

// GET MY FOLLOWERS
router.get("/followers", authMiddleware, (req, res) => {
    const userId = req.user.id;

    const sql = `
        SELECT
            follows.id,
            follows.follower_id,
            users.username,
            follows.created_at
        FROM follows
        JOIN users
            ON follows.follower_id = users.id
        WHERE follows.following_id = ?
        ORDER BY follows.created_at DESC
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Get followers error:", err);
            return res.status(500).json({
                message: "Failed to fetch followers"
            });
        }

        res.json({
            message: "Followers list retrieved successfully!",
            follower_count: results.length,
            followers: results
        });
    });
});

// UNFOLLOW USER
router.delete("/remove/:following_id", authMiddleware, (req, res) => {
    const followerId = req.user.id;
    const followingId = req.params.following_id;

    const sql = `
        DELETE FROM follows
        WHERE follower_id = ?
        AND following_id = ?
    `;

    db.query(
        sql,
        [followerId, followingId],
        (err, result) => {
            if (err) {
                console.error("Unfollow error:", err);
                return res.status(500).json({
                    message: "Failed to unfollow user"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "You are not following this user"
                });
            }

            res.json({
                message: "User unfollowed successfully!"
            });
        }
    );
});

module.exports = router;