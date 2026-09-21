const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// ==========================================
// ADD RECOMMENDATION
// ==========================================

router.post("/add", authMiddleware, (req, res) => {

    const userId = req.user.id;
    const { movie_id, recommendation_text } = req.body;

    if (!movie_id) {
        return res.status(400).json({
            message: "movie_id is required"
        });
    }

    const sql = `
        INSERT INTO recommendations
        (user_id, movie_id, recommendation_text)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [userId, movie_id, recommendation_text],
        (err, result) => {

            if (err) {
                console.error("Add recommendation error:", err);

                return res.status(500).json({
                    message: "Failed to add recommendation"
                });
            }

            res.status(201).json({
                message: "Recommendation added successfully!",
                recommendation_id: result.insertId
            });
        }
    );
});


// ==========================================
// GET ALL RECOMMENDATIONS
// ==========================================

router.get("/", authMiddleware, (req, res) => {

    const sql = `
        SELECT
            recommendations.id,
            recommendations.user_id,
            users.username,
            recommendations.movie_id,
            movies.title,
            movies.poster_url,
            movies.rating,
            recommendations.recommendation_text,
            recommendations.created_at
        FROM recommendations

        JOIN users
            ON recommendations.user_id = users.id

        JOIN movies
            ON recommendations.movie_id = movies.id

        ORDER BY recommendations.created_at DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error("Get recommendations error:", err);

            return res.status(500).json({
                message: "Failed to fetch recommendations"
            });
        }

        res.json({
            message: "Recommendations retrieved successfully!",
            recommendations: results
        });
    });
});


// ==========================================
// GET MY RECOMMENDATIONS
// ==========================================

router.get("/my", authMiddleware, (req, res) => {

    const userId = req.user.id;

    const sql = `
        SELECT
            recommendations.id,
            recommendations.movie_id,
            movies.title,
            movies.poster_url,
            movies.rating,
            recommendations.recommendation_text,
            recommendations.created_at
        FROM recommendations

        JOIN movies
            ON recommendations.movie_id = movies.id

        WHERE recommendations.user_id = ?

        ORDER BY recommendations.created_at DESC
    `;

    db.query(sql, [userId], (err, results) => {

        if (err) {
            console.error("Get my recommendations error:", err);

            return res.status(500).json({
                message: "Failed to fetch your recommendations"
            });
        }

        res.json({
            message: "Your recommendations retrieved successfully!",
            recommendations: results
        });
    });
});


// ==========================================
// DELETE RECOMMENDATION
// ==========================================

router.delete("/:id", authMiddleware, (req, res) => {

    const recommendationId = req.params.id;
    const userId = req.user.id;

    const sql = `
        DELETE FROM recommendations
        WHERE id = ? AND user_id = ?
    `;

    db.query(
        sql,
        [recommendationId, userId],
        (err, result) => {

            if (err) {
                console.error("Delete recommendation error:", err);

                return res.status(500).json({
                    message: "Failed to delete recommendation"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Recommendation not found"
                });
            }

            res.json({
                message: "Recommendation deleted successfully!"
            });
        }
    );
});


module.exports = router;