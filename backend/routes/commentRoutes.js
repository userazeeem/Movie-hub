const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// ==========================================
// ADD COMMENT
// ==========================================

router.post("/add/:recommendation_id", authMiddleware, (req, res) => {

    const userId = req.user.id;
    const recommendationId = req.params.recommendation_id;
    const { comment_text } = req.body;

    if (!comment_text || !comment_text.trim()) {
        return res.status(400).json({
            message: "Comment text is required"
        });
    }

    const sql = `
        INSERT INTO comments
        (user_id, recommendation_id, comment_text)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [userId, recommendationId, comment_text],
        (err, result) => {

            if (err) {
                console.error("Add comment error:", err);

                return res.status(500).json({
                    message: "Failed to add comment"
                });
            }

            res.status(201).json({
                message: "Comment added successfully!",
                comment_id: result.insertId
            });
        }
    );
});


// ==========================================
// GET COMMENTS
// ==========================================

router.get("/:recommendation_id", (req, res) => {

    const recommendationId = req.params.recommendation_id;

    const sql = `
        SELECT
            comments.id,
            comments.user_id,
            users.username,
            comments.recommendation_id,
            comments.comment_text,
            comments.created_at
        FROM comments

        JOIN users
            ON comments.user_id = users.id

        WHERE comments.recommendation_id = ?

        ORDER BY comments.created_at ASC
    `;

    db.query(
        sql,
        [recommendationId],
        (err, results) => {

            if (err) {
                console.error("Get comments error:", err);

                return res.status(500).json({
                    message: "Failed to fetch comments"
                });
            }

            res.json({
                message: "Comments retrieved successfully!",
                comment_count: results.length,
                comments: results
            });
        }
    );
});


// ==========================================
// DELETE COMMENT
// ==========================================

router.delete("/:id", authMiddleware, (req, res) => {

    const commentId = req.params.id;
    const userId = req.user.id;

    const sql = `
        DELETE FROM comments
        WHERE id = ?
        AND user_id = ?
    `;

    db.query(
        sql,
        [commentId, userId],
        (err, result) => {

            if (err) {
                console.error("Delete comment error:", err);

                return res.status(500).json({
                    message: "Failed to delete comment"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Comment not found or you do not have permission to delete it"
                });
            }

            res.json({
                message: "Comment deleted successfully!"
            });
        }
    );
});


module.exports = router;