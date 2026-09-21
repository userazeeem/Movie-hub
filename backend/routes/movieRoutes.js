const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// ==========================================
// GET ALL MOVIES
// ==========================================

router.get("/", (req, res) => {
    const sql = `
        SELECT
            id,
            title,
            description,
            release_year,
            genre,
            poster_url,
            trailer_url,
            rating,
            created_at
        FROM movies
        ORDER BY created_at DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Get movies error:", err);

            return res.status(500).json({
                message: "Failed to fetch movies"
            });
        }

        res.json({
            message: "Movies retrieved successfully!",
            movies: results
        });
    });
});


// ==========================================
// GET MOVIE BY ID
// ==========================================

router.get("/:id", (req, res) => {
    const movieId = req.params.id;

    const sql = `
        SELECT
            id,
            title,
            description,
            release_year,
            genre,
            poster_url,
            trailer_url,
            rating,
            created_at
        FROM movies
        WHERE id = ?
    `;

    db.query(sql, [movieId], (err, results) => {
        if (err) {
            console.error("Get movie error:", err);

            return res.status(500).json({
                message: "Failed to fetch movie"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Movie not found"
            });
        }

        res.json({
            message: "Movie retrieved successfully!",
            movie: results[0]
        });
    });
});


// ==========================================
// ADD MOVIE
// ==========================================

router.post("/add", authMiddleware, (req, res) => {

    const {
        title,
        description,
        release_year,
        genre,
        poster_url,
        trailer_url,
        rating
    } = req.body;

    if (!title) {
        return res.status(400).json({
            message: "Movie title is required"
        });
    }

    const sql = `
        INSERT INTO movies
        (
            title,
            description,
            release_year,
            genre,
            poster_url,
            trailer_url,
            rating
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            title,
            description,
            release_year,
            genre,
            poster_url,
            trailer_url,
            rating
        ],
        (err, result) => {

            if (err) {
                console.error("Add movie error:", err);

                return res.status(500).json({
                    message: "Failed to add movie"
                });
            }

            res.status(201).json({
                message: "Movie added successfully!",
                movie_id: result.insertId
            });
        }
    );
});


// ==========================================
// UPDATE MOVIE
// ==========================================

router.put("/:id", authMiddleware, (req, res) => {

    const movieId = req.params.id;

    const {
        title,
        description,
        release_year,
        genre,
        poster_url,
        trailer_url,
        rating
    } = req.body;

    const sql = `
        UPDATE movies
        SET
            title = ?,
            description = ?,
            release_year = ?,
            genre = ?,
            poster_url = ?,
            trailer_url = ?,
            rating = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            title,
            description,
            release_year,
            genre,
            poster_url,
            trailer_url,
            rating,
            movieId
        ],
        (err, result) => {

            if (err) {
                console.error("Update movie error:", err);

                return res.status(500).json({
                    message: "Failed to update movie"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Movie not found"
                });
            }

            res.json({
                message: "Movie updated successfully!"
            });
        }
    );
});


// ==========================================
// DELETE MOVIE
// ==========================================

router.delete("/:id", authMiddleware, (req, res) => {

    const movieId = req.params.id;

    const sql = `
        DELETE FROM movies
        WHERE id = ?
    `;

    db.query(sql, [movieId], (err, result) => {

        if (err) {
            console.error("Delete movie error:", err);

            return res.status(500).json({
                message: "Failed to delete movie"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Movie not found"
            });
        }

        res.json({
            message: "Movie deleted successfully!"
        });
    });
});


module.exports = router;