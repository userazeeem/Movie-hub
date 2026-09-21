require("dotenv").config();

const express = require("express");
const cors = require("cors");

const db = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Comment routes
const commentRoutes = require("./routes/commentRoutes");
app.use("/api/comments", commentRoutes);

// Recommendation routes
const recommendationRoutes = require("./routes/recommendationRoutes");
app.use("/api/recommendations", recommendationRoutes);

// ===============================
// MOVIE ROUTES
// ===============================

const movieRoutes = require("./routes/movieRoutes");
app.use("/api/movies", movieRoutes);
// ===============================
// AUTH ROUTES
// ===============================

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);


// ===============================
// WATCHLIST ROUTES
// ===============================
const watchlistRoutes = require("./routes/watchlistRoutes");
app.use("/api/watchlist", watchlistRoutes);


// ===============================
// HOME ROUTE
// ===============================
app.get("/", (req, res) => {
    res.send("Movie-Hub API is running!");
});


// ===============================
// MYSQL TEST ROUTE
// ===============================
app.get("/test-db", (req, res) => {

    db.query("SELECT 1 + 1 AS result", (err, results) => {

        if (err) {
            console.error("❌ Database error:", err.message);

            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.json({
            success: true,
            message: "MySQL is connected!",
            result: results[0].result
        });
    });
});


// ===============================
// START SERVER
// ===============================
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});