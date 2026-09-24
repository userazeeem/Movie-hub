const API_URL = "http://localhost:5000/api";

const token =
    localStorage.getItem("token");


/* =====================================================
   LOGIN CHECK
===================================================== */

if (!token) {

    window.location.href =
        "login.html";

}


/* =====================================================
   GET MOVIE ID
===================================================== */

const urlParams =
    new URLSearchParams(
        window.location.search
    );


const movieId =
    urlParams.get("id");


const movieContainer =
    document.getElementById(
        "movieContainer"
    );


/* =====================================================
   CHECK MOVIE ID
===================================================== */

if (!movieId) {

    showError(
        "No movie selected."
    );

} else {

    loadMovie();

}


/* =====================================================
   LOAD MOVIE
===================================================== */

async function loadMovie() {

    try {

        const response =
            await fetch(
                `${API_URL}/movies/${movieId}`
            );


        const data =
            await response.json();


        console.log(
            "Movie response:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Movie not found."
            );

        }


        /*
         * Backend may return the movie
         * directly or inside a movie property.
         */

        const movie =
            data.movie || data;


        displayMovie(movie);


    } catch (error) {

        console.error(
            "Movie loading error:",
            error
        );


        showError(
            error.message ||
            "Failed to load movie."
        );

    }

}


/* =====================================================
   DISPLAY MOVIE
===================================================== */

function displayMovie(movie) {

    document.title =
        `${movie.title} | Movie-Hub`;


    movieContainer.innerHTML = `

        <div class="movie-content">

            <p class="movie-label">
                MOVIE-HUB / MOVIE
            </p>


            <h1 class="movie-title">
                ${escapeHTML(movie.title)}
            </h1>


            <p class="movie-description">
                ${escapeHTML(
                    movie.description ||
                    "No description available."
                )}
            </p>


            <div class="movie-meta">

                ${
                    movie.genre
                    ?
                    `
                    <span class="meta-item">
                        ${escapeHTML(movie.genre)}
                    </span>
                    `
                    :
                    ""
                }


                ${
                    movie.release_year
                    ?
                    `
                    <span class="meta-item">
                        ${movie.release_year}
                    </span>
                    `
                    :
                    ""
                }


                ${
                    movie.duration
                    ?
                    `
                    <span class="meta-item">
                        ${movie.duration} min
                    </span>
                    `
                    :
                    ""
                }

            </div>


            <div class="movie-actions">

                <button
                    class="primary-button"
                    onclick="addToWatchlist()"
                >
                    + Add to Watchlist
                </button>


                <button
                    class="secondary-button"
                    onclick="goBack()"
                >
                    ← Back to Movies
                </button>

            </div>

        </div>

    `;

}


/* =====================================================
   ADD TO WATCHLIST
===================================================== */

async function addToWatchlist() {

    try {

        const response =
            await fetch(
                `${API_URL}/watchlist/add`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body: JSON.stringify({

                        movie_id:
                            Number(movieId)

                    })

                }
            );


        const data =
            await response.json();


        console.log(
            "Watchlist response:",
            data
        );


        if (!response.ok) {

            alert(
                data.message ||
                "Could not add movie."
            );

            return;
        }


        alert(
            "Movie added to watchlist! 🎬"
        );


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
   BACK BUTTON
===================================================== */

function goBack() {

    window.location.href =
        "index.html";

}


/* =====================================================
   ERROR
===================================================== */

function showError(message) {

    movieContainer.innerHTML = `

        <div class="error-message">

            <h2>
                Movie Not Found
            </h2>

            <p>
                ${escapeHTML(message)}
            </p>

            <button
                class="primary-button"
                onclick="goBack()"
            >
                ← Back to Movies
            </button>

        </div>

    `;

}


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
   LOGOUT
===================================================== */

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


logoutButton.addEventListener(
    "click",
    () => {

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "user"
        );

        window.location.href =
            "login.html";

    }
);
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