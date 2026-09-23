const API_URL = "http://localhost:5000/api";

const token = localStorage.getItem("token");


/* =====================================================
   AUTHENTICATION
===================================================== */

if (!token) {

    window.location.href = "login.html";

}


/* =====================================================
   ELEMENTS
===================================================== */

const watchlistContainer =
    document.getElementById("watchlistContainer");

const logoutButton =
    document.getElementById("logoutButton");


/* =====================================================
   LOAD WATCHLIST
===================================================== */

async function loadWatchlist() {

    try {

        const response = await fetch(
            `${API_URL}/watchlist`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        const data = await response.json();

        console.log("Watchlist response:", data);


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load watchlist."
            );

        }


        const watchlist =
            Array.isArray(data)
                ? data
                : data.watchlist || [];


        displayWatchlist(watchlist);


    } catch (error) {

        console.error(
            "Watchlist loading error:",
            error
        );


        watchlistContainer.innerHTML = `

            <div class="watchlist-message">

                <h2>
                    Could not load watchlist
                </h2>

                <p>
                    ${escapeHTML(error.message)}
                </p>

            </div>

        `;

    }

}


/* =====================================================
   DISPLAY WATCHLIST
===================================================== */

function displayWatchlist(watchlist) {

    if (!watchlist.length) {

        watchlistContainer.innerHTML = `

            <div class="watchlist-message">

                <div class="empty-icon">
                    🎬
                </div>

                <h2>
                    Your watchlist is empty
                </h2>

                <p>
                    Find something you want to watch
                    and add it here.
                </p>

                <button
                    class="browse-button"
                    onclick="goToMovies()"
                >
                    BROWSE MOVIES
                </button>

            </div>

        `;

        return;
    }


    watchlistContainer.innerHTML = "";


    watchlist.forEach((item) => {

        const movie =
            item.movie || item;


   const movieId = item.movie_id ?? item.movie?.id ?? movie.id;


        const title =
            movie.title ||
            item.movie_title ||
            "Unknown Movie";


        const description =
            movie.description ||
            item.description ||
            "No description available.";


        const card =
            document.createElement("div");

        card.className = "movie-card";


        card.innerHTML = `

            <div class="movie-poster">
                🎬
            </div>

            <div class="movie-info">

                <h3 class="movie-title">
                    ${escapeHTML(title)}
                </h3>

                <p class="movie-description">
                    ${escapeHTML(description)}
                </p>

                <div class="watchlist-actions">

                    <button
                        class="watch-button"
                        data-movie-id="${movieId}"
                    >
                        VIEW MOVIE
                    </button>

                    <button
                        class="remove-button"
                        data-movie-id="${movieId}"
                    >
                        REMOVE
                    </button>

                </div>

            </div>

        `;


        /*
         * VIEW MOVIE
         */

        const viewButton =
            card.querySelector(".watch-button");


        viewButton.addEventListener(
            "click",
            () => {

                openMovie(movieId);

            }
        );


        /*
         * REMOVE MOVIE
         */

        const removeButton =
            card.querySelector(".remove-button");


        removeButton.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                event.stopPropagation();

                removeFromWatchlist(
                    movieId
                );

            }
        );


        watchlistContainer.appendChild(
            card
        );

    });

}


/* =====================================================
   REMOVE MOVIE
===================================================== */

async function removeFromWatchlist(movieId) {

    console.log(
        "Removing movie:",
        movieId
    );


    try {

        const response =
            await fetch(
                `${API_URL}/watchlist/remove/${movieId}`,
                {

                    method: "DELETE",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        const data =
            await response.json();


        console.log(
            "Remove response:",
            data
        );


        if (!response.ok) {

            alert(
                data.message ||
                "Could not remove movie."
            );

            return;
        }


        /*
         * Reload watchlist
         */

        await loadWatchlist();


    } catch (error) {

        console.error(
            "Remove watchlist error:",
            error
        );


        alert(
            "Cannot connect to Movie-Hub server."
        );

    }

}


/* =====================================================
   OPEN MOVIE
===================================================== */

function openMovie(movieId) {

    window.location.href =
        `movie.html?id=${movieId}`;

}


/* =====================================================
   BROWSE MOVIES
===================================================== */

function goToMovies() {

    window.location.href =
        "index.html";

}


/* =====================================================
   LOGOUT
===================================================== */

logoutButton.addEventListener(
    "click",
    () => {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        window.location.href =
            "login.html";

    }
);


/* =====================================================
   HTML SAFETY
===================================================== */

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}


/* =====================================================
   START
===================================================== */

loadWatchlist();