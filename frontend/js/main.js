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
        renderTopPosters();

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
                ${
                    movie.poster_url
                        ? `<img src="${escapeHTML(movie.poster_url)}"
                                alt="${escapeHTML(movie.title)} poster"
                                loading="lazy"
                                onerror="this.replaceWith('🎬')">`
                        : "🎬"
                }
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
/* =====================================================
   HERO: TOP 3 MOVIES (click a poster to bring it forward)
===================================================== */

let heroOrder = [];

function renderTopPosters() {

    const heroPosters = document.getElementById("heroPosters");

    if (!heroPosters) return;

    heroPosters.querySelectorAll(".poster").forEach((p) => p.remove());

    /* highest rating first; equal ratings keep newest-first order */
    const top3 = [...movies]
        .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
        .slice(0, 3);

    if (!top3.length) {
        heroOrder = [];
        return;
    }

    heroOrder = top3.map((movie, index) => {

        const poster = document.createElement("div");
        poster.className = "poster";
        poster.tabIndex = 0;
        poster.title = "Click to bring forward";

        const details = [movie.genre || "Movie", movie.release_year || ""]
            .filter(Boolean)
            .join(" • ");

                poster.innerHTML = `
            ${
                movie.poster_url
                    ? `<img class="poster-image"
                            src="${escapeHTML(movie.poster_url)}"
                            alt=""
                            onerror="this.remove()">`
                    : ""
            }

            <div class="poster-shape"></div>
            <div class="poster-gradient"></div>

            <div class="poster-rank">TOP ${index + 1} MOVIE</div>
            <div class="poster-shape"></div>
            <div class="poster-gradient"></div>

            <div class="poster-rank">TOP ${index + 1} MOVIE</div>

            <div class="poster-content">
                <span>${escapeHTML(details)}</span>
                <h2>${escapeHTML(movie.title)}</h2>
                <div class="poster-line"></div>
                <button type="button" class="poster-view">View movie →</button>
            </div>
        `;

        poster.addEventListener("click", () => bringPosterForward(poster));

        poster.addEventListener("keydown", (event) => {
            if (event.key === "Enter") bringPosterForward(poster);
        });

        poster.querySelector(".poster-view").addEventListener("click", (event) => {
            event.stopPropagation();
            window.location.href = `movie.html?id=${movie.id}`;
        });

        heroPosters.appendChild(poster);

        return poster;
    });

    updateHeroPositions();
}

function updateHeroPositions() {
    heroOrder.forEach((poster, position) => {
        poster.dataset.pos = position;
    });
}

function bringPosterForward(poster) {

    const index = heroOrder.indexOf(poster);

    if (index === -1) return;

    if (index === 0) {
        /* front card goes to the back, the next one comes forward */
        heroOrder.push(heroOrder.shift());
    } else {
        /* a back card comes to the front */
        heroOrder = [...heroOrder.slice(index), ...heroOrder.slice(0, index)];
    }

    updateHeroPositions();
}