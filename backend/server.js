require("dotenv").config();

const express = require("express");
const cors = require("cors");

const db = require("./config/db");

const app = express();

app.use(cors({
    origin: [
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "https://movie-neicug3p3-userazeeem.vercel.app"
    ]
}));
app.use(express.json());

const PORT = process.env.PORT || 5000;

// ===============================
// ROUTES
// ===============================
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/follows", require("./routes/followRoutes"));
app.use("/api/comments", require("./routes/commentRoutes"));
app.use("/api/recommendations", require("./routes/recommendationRoutes"));
app.use("/api/movies", require("./routes/movieRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/watchlist", require("./routes/watchlistRoutes"));

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
// START SERVER (not on Vercel)
// ===============================
if (process.env.VERCEL !== "1") {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}

module.exports = app;