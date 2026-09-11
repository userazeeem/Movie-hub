const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================
// ADD MOVIE TO WATCHLIST
// =====================================
router.post("/add", authMiddleware, (req, res) => {

    const userId = req.user.id;
    const { movie_id } = req.body;

    if (!movie_id) {
        return res.status(400).json({
            message: "movie_id is required"
        });
    }

    const sql = `
        INSERT INTO watchlist (user_id, movie_id)
        VALUES (?, ?)
    `;

    db.query(sql, [userId, movie_id], (err, result) => {

        if (err) {
            console.error("Watchlist error:", err);

            return res.status(500).json({
                message: "Failed to add movie to watchlist"
            });
        }

        res.status(201).json({
            message: "Movie added to watchlist!",
            watchlist_id: result.insertId
        });
    });
});


// =====================================
// GET MY WATCHLIST
// =====================================
router.get("/", authMiddleware, (req, res) => {

    const userId = req.user.id;

    const sql = `
        SELECT 
            watchlist.id,
            watchlist.movie_id,
            movies.title,
            movies.description,
            movies.release_year,
            movies.genre,
            movies.poster_url,
            movies.trailer_url,
            movies.rating,
            watchlist.added_at
        FROM watchlist
        JOIN movies
            ON watchlist.movie_id = movies.id
        WHERE watchlist.user_id = ?
        ORDER BY watchlist.added_at DESC
    `;

    db.query(sql, [userId], (err, results) => {

        if (err) {
            console.error("Watchlist error:", err);

            return res.status(500).json({
                message: "Failed to fetch watchlist"
            });
        }

        res.json({
            message: "Watchlist retrieved successfully!",
            watchlist: results
        });
    });
});


// =====================================
// REMOVE MOVIE FROM WATCHLIST
// =====================================
router.delete("/remove/:movie_id", authMiddleware, (req, res) => {

    const userId = req.user.id;
    const movieId = req.params.movie_id;

    const sql = `
        DELETE FROM watchlist
        WHERE user_id = ? AND movie_id = ?
    `;

    db.query(sql, [userId, movieId], (err, result) => {

        if (err) {
            console.error("Watchlist error:", err);

            return res.status(500).json({
                message: "Failed to remove movie"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Movie not found in your watchlist"
            });
        }

        res.json({
            message: "Movie removed from watchlist!"
        });
    });
});


module.exports = router;