const API_URL = "http://localhost:5000/api";

const token = localStorage.getItem("token");

const moviesContainer =
    document.getElementById("moviesContainer");

const searchInput =
    document.getElementById("searchInput");

const logoutButton =
    document.getElementById("logoutButton");


/* =====================================================
   CHECK LOGIN
===================================================== */

if (!token) {

    window.location.href = "login.html";

}


/* =====================================================
   LOAD MOVIES
===================================================== */

let movies = [];


async function loadMovies() {

    try {

        const response = await fetch(
            `${API_URL}/movies`
        );

        const data = await response.json();

        console.log("Movies response:", data);

        if (!response.ok) {

            throw new Error(
                data.message || "Failed to load movies"
            );

        }

        /*
         * Backend may return the movies directly
         * or inside a movies property.
         */

        movies = Array.isArray(data)
            ? data
            : data.movies || [];

        displayMovies(movies);

    } catch (error) {

        console.error("Movie loading error:", error);

        moviesContainer.innerHTML = `
            <p class="loading">
                Failed to load movies.
            </p>
        `;

    }

}


/* =====================================================
   DISPLAY MOVIES
===================================================== */

function displayMovies(movieList) {

    if (!movieList.length) {

        moviesContainer.innerHTML = `
            <p class="loading">
                No movies found.
            </p>
        `;

        return;
    }


    moviesContainer.innerHTML = "";


    movieList.forEach((movie) => {

        const card = document.createElement("div");

        card.className = "movie-card";


        card.innerHTML = `

            <div class="movie-poster">
                🎬
            </div>

            <div class="movie-info">

                <h3 class="movie-title">
                    ${escapeHTML(movie.title)}
                </h3>

                <p class="movie-description">
                    ${escapeHTML(
                        movie.description ||
                        "No description available."
                    )}
                </p>

                <button
                    class="watchlist-button"
                    onclick="addToWatchlist(${movie.id}, event)"
                >
                    + Add to Watchlist
                </button>

            </div>

        `;


        /*
         * Clicking the card opens movie details.
         */

        card.addEventListener("click", () => {

            window.location.href =
                `movie.html?id=${movie.id}`;

        });


        moviesContainer.appendChild(card);

    });

}


/* =====================================================
   SEARCH
===================================================== */

searchInput.addEventListener(
    "input",
    () => {

        const searchTerm =
            searchInput.value
                .toLowerCase()
                .trim();


        const filteredMovies =
            movies.filter((movie) => {

                const title =
                    (movie.title || "")
                        .toLowerCase();

                return title.includes(searchTerm);

            });


        displayMovies(filteredMovies);

    }
);


/* =====================================================
   ADD TO WATCHLIST
===================================================== */

async function addToWatchlist(movieId, event) {

    /*
     * Prevent movie card click.
     */

    event.stopPropagation();


    try {

        const response = await fetch(
            `${API_URL}/watchlist/add`,
            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json",

                    "Authorization":
                        `Bearer ${token}`

                },

                body: JSON.stringify({

                    movie_id: movieId

                })

            }
        );


        const data = await response.json();

        console.log("Watchlist response:", data);


        if (!response.ok) {

            alert(
                data.message ||
                "Could not add movie to watchlist."
            );

            return;
        }


        alert("Movie added to watchlist! 🎬");

    } catch (error) {

        console.error(
            "Watchlist error:",
            error
        );

        alert(
            "Cannot connect to Movie-Hub server."
        );

    }

}


/* =====================================================
   LOGOUT
===================================================== */

logoutButton.addEventListener(
    "click",
    () => {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        window.location.href = "login.html";

    }
);


/* =====================================================
   HERO BUTTON
===================================================== */

function scrollToMovies() {

    document
        .getElementById("moviesSection")
        .scrollIntoView({
            behavior: "smooth"
        });

}


/* =====================================================
   HTML SAFETY
===================================================== */

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent = value ?? "";

    return div.innerHTML;

}


/* =====================================================
   START
===================================================== */

loadMovies();
const navProfileLetter =
    document.getElementById("navProfileLetter");

if (navProfileLetter) {

    try {

        const user =
            JSON.parse(
                localStorage.getItem("user")
            );

        const username =
            user?.username || "U";

        navProfileLetter.textContent =
            username.charAt(0).toUpperCase();

    } catch (error) {

        navProfileLetter.textContent = "U";

    }

}