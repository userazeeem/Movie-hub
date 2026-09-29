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

    currentTrailerUrl = movie.trailer_url || null;

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
                
                                ${
                    getYouTubeEmbedUrl(movie.trailer_url)
                        ? `<button class="secondary-button" onclick="openTrailer()">
                               ▶ Watch Trailer
                           </button>`
                        : ""
                }

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
/* =====================================================
   TRAILER
===================================================== */

let currentTrailerUrl = null;

function getYouTubeEmbedUrl(url) {

    if (!url) return null;

    const match = String(url).match(
        /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/
    );

    return match
        ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`
        : null;
}

function openTrailer() {

    const embedUrl = getYouTubeEmbedUrl(currentTrailerUrl);

    if (!embedUrl) {
        alert("This trailer link is not valid.");
        return;
    }

    const modal = document.createElement("div");
    modal.className = "trailer-modal";

    modal.innerHTML = `
        <div class="trailer-box">
            <button type="button" class="trailer-close" aria-label="Close trailer">×</button>
            <iframe
                src="${embedUrl}"
                title="Movie trailer"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowfullscreen>
            </iframe>
        </div>
    `;

    modal.addEventListener("click", (event) => {
        if (event.target === modal) closeTrailer();
    });

    modal.querySelector(".trailer-close").addEventListener("click", closeTrailer);

    document.body.appendChild(modal);
    document.body.style.overflow = "hidden";
}

function closeTrailer() {

    const modal = document.querySelector(".trailer-modal");

    if (modal) modal.remove();   // removing the iframe stops the video

    document.body.style.overflow = "";
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeTrailer();
});