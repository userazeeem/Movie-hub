const API_URL = "http://localhost:5000/api";

const token = localStorage.getItem("token");

let storedUser = {};

try {
    storedUser = JSON.parse(localStorage.getItem("user")) || {};
} catch (error) {
    storedUser = {};
}

const currentUserId =
    storedUser.id ||
    storedUser.user_id ||
    null;

if (!token) {
    window.location.href = "login.html";
}


/* =====================================================
   DOM ELEMENTS
===================================================== */

const showAddFormButton =
    document.getElementById("showAddFormButton");

const closeFormButton =
    document.getElementById("closeFormButton");

const cancelRecommendationButton =
    document.getElementById("cancelRecommendationButton");

const recommendationFormSection =
    document.getElementById("recommendationFormSection");

const recommendationForm =
    document.getElementById("recommendationForm");

const movieSearch =
    document.getElementById("movieSearch");

const movieSearchResults =
    document.getElementById("movieSearchResults");

const movieSelect =
    document.getElementById("movieSelect");

const selectedMovie =
    document.getElementById("selectedMovie");

const selectedMovieTitle =
    document.getElementById("selectedMovieTitle");

const clearSelectedMovie =
    document.getElementById("clearSelectedMovie");

const recommendationText =
    document.getElementById("recommendationText");

const submitRecommendationButton =
    document.getElementById("submitRecommendationButton");

const formMessage =
    document.getElementById("formMessage");

const recommendationsContainer =
    document.getElementById("recommendationsContainer");

const logoutButton =
    document.getElementById("logoutButton");


/* =====================================================
   MOVIE DATA
===================================================== */

let movies = [];


/* =====================================================
   SHOW RECOMMENDATION FORM
===================================================== */

showAddFormButton.addEventListener("click", () => {

    recommendationFormSection.classList.remove("hidden");

    recommendationFormSection.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    setTimeout(() => {
        movieSearch.focus();
    }, 300);
});


/* =====================================================
   CLOSE FORM
===================================================== */

function closeRecommendationForm() {

    recommendationFormSection.classList.add("hidden");

    recommendationForm.reset();

    movieSelect.value = "";

    selectedMovieTitle.textContent = "";

    selectedMovie.classList.add("hidden");

    movieSearchResults.innerHTML = "";

    movieSearchResults.classList.remove("show");

    formMessage.textContent = "";
}


closeFormButton.addEventListener(
    "click",
    closeRecommendationForm
);


cancelRecommendationButton.addEventListener(
    "click",
    closeRecommendationForm
);


/* =====================================================
   LOAD MOVIES
===================================================== */

async function loadMovies() {

    try {

        const response =
            await fetch(`${API_URL}/movies`);

        const data =
            await response.json();

        console.log(
            "========== MOVIES DEBUG =========="
        );

        console.log(
            "API response:",
            data
        );

        console.log(
            "Is array:",
            Array.isArray(data)
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load movies."
            );
        }


        /*
         * Handle different API response formats
         */

        if (Array.isArray(data)) {

            movies = data;

        }

        else if (
            data &&
            Array.isArray(data.movies)
        ) {

            movies = data.movies;

        }

        else if (
            data &&
            Array.isArray(data.data)
        ) {

            movies = data.data;

        }

        else {

            movies = [];

        }


        console.log(
            "MOVIES ARRAY:",
            movies
        );

        console.log(
            "MOVIE COUNT:",
            movies.length
        );


        if (movies.length > 0) {

            console.log(
                "FIRST MOVIE:",
                movies[0]
            );

            console.log(
                "FIRST MOVIE TITLE:",
                movies[0].title
            );

        }


        console.log(
            "=================================="
        );

    }

    catch (error) {

        console.error(
            "Movie loading error:",
            error
        );

        showFormMessage(
            error.message ||
            "Could not load movies.",
            "error"
        );
    }
}


/* =====================================================
   SEARCH MOVIES
===================================================== */

movieSearch.addEventListener(
    "input",
    function () {

        const searchTerm =
            movieSearch.value
                .trim()
                .toLowerCase();


        console.log(
            "SEARCH TERM:",
            searchTerm
        );


        /*
         * Clear previously selected movie
         * when user starts searching again.
         */

        movieSelect.value = "";

        selectedMovie.classList.add(
            "hidden"
        );


        if (searchTerm === "") {

            movieSearchResults.innerHTML = "";

            movieSearchResults.classList.remove(
                "show"
            );

            return;
        }


        /*
         * Find matching movies
         */

        const filteredMovies =
            movies.filter(
                function (movie) {

                    if (!movie) {
                        return false;
                    }


                    const title =
                        String(
                            movie.title || ""
                        ).toLowerCase();


                    return title.includes(
                        searchTerm
                    );

                }
            );


        console.log(
            "FILTERED MOVIES:",
            filteredMovies
        );


        displayMovieSearchResults(
            filteredMovies
        );

    }
);


/* =====================================================
   DISPLAY SEARCH RESULTS
===================================================== */

function displayMovieSearchResults(
    movieList
) {

    movieSearchResults.innerHTML = "";


    /*
     * No matching movies
     */

    if (!movieList.length) {

        movieSearchResults.innerHTML = `
            <div class="no-movie-results">
                No movies found.
            </div>
        `;

        movieSearchResults.classList.add(
            "show"
        );

        return;
    }


    /*
     * Display matching movies
     */

    movieList.forEach(
        function (movie) {

            const result =
                document.createElement(
                    "div"
                );


            result.className =
                "movie-search-result";


            const genre =
                movie.genre ||
                "Movie";


            const year =
                movie.release_year ||
                "";


            result.innerHTML = `
                <div class="movie-search-result-title">
                    ${escapeHTML(movie.title)}
                </div>

                <div class="movie-search-result-info">
                    ${escapeHTML(genre)}
                    ${
                        year
                            ? ` • ${escapeHTML(year)}`
                            : ""
                    }
                </div>
            `;


            result.addEventListener(
                "click",
                function () {

                    selectMovie(movie);

                }
            );


            movieSearchResults.appendChild(
                result
            );

        }
    );


    movieSearchResults.classList.add(
        "show"
    );
}


/* =====================================================
   SELECT MOVIE
===================================================== */

function selectMovie(movie) {

    console.log(
        "SELECTED MOVIE:",
        movie
    );


    /*
     * Store movie ID in hidden input
     */

    movieSelect.value =
        movie.id;


    /*
     * Show movie title in search box
     */

    movieSearch.value =
        movie.title;


    /*
     * Show selected movie
     */

    selectedMovieTitle.textContent =
        movie.title;


    selectedMovie.classList.remove(
        "hidden"
    );


    /*
     * Hide search results
     */

    movieSearchResults.innerHTML = "";

    movieSearchResults.classList.remove(
        "show"
    );
}


/* =====================================================
   CLEAR SELECTED MOVIE
===================================================== */

clearSelectedMovie.addEventListener(
    "click",
    function () {

        movieSelect.value = "";

        movieSearch.value = "";

        selectedMovieTitle.textContent = "";

        selectedMovie.classList.add(
            "hidden"
        );

        movieSearchResults.innerHTML = "";

        movieSearchResults.classList.remove(
            "show"
        );

        movieSearch.focus();

    }
);


/* =====================================================
   ADD RECOMMENDATION
===================================================== */

recommendationForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const movieId =
            movieSelect.value;


        const text =
            recommendationText.value.trim();


        /*
         * Check movie
         */

        if (!movieId) {

            showFormMessage(
                "Please search and select a movie.",
                "error"
            );

            movieSearch.focus();

            return;
        }


        /*
         * Check recommendation text
         */

        if (!text) {

            showFormMessage(
                "Please write why you recommend this movie.",
                "error"
            );

            recommendationText.focus();

            return;
        }


        submitRecommendationButton.disabled =
            true;


        submitRecommendationButton.textContent =
            "POSTING...";


        try {

            const response =
                await fetch(
                    `${API_URL}/recommendations/add`,
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
                                Number(movieId),

                            recommendation_text:
                                text

                        })
                    }
                );


            const data =
                await response.json();


            console.log(
                "Recommendation response:",
                data
            );


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to post recommendation."
                );
            }


            showFormMessage(
                "Recommendation posted successfully!",
                "success"
            );


            /*
             * Reload recommendations
             */

            await loadRecommendations();


            /*
             * Reset form
             */

            recommendationForm.reset();

            movieSelect.value = "";

            selectedMovieTitle.textContent = "";

            selectedMovie.classList.add(
                "hidden"
            );

            movieSearchResults.innerHTML = "";

            movieSearchResults.classList.remove(
                "show"
            );


            /*
             * Close form after short delay
             */

            setTimeout(
                function () {

                    closeRecommendationForm();

                },
                800
            );

        }

        catch (error) {

            console.error(
                "Recommendation error:",
                error
            );

            showFormMessage(
                error.message ||
                "Could not post recommendation.",
                "error"
            );

        }

        finally {

            submitRecommendationButton.disabled =
                false;

            submitRecommendationButton.textContent =
                "POST RECOMMENDATION";

        }

    }
);


/* =====================================================
   LOAD RECOMMENDATIONS
===================================================== */

async function loadRecommendations() {

    try {

        const response =
            await fetch(
                `${API_URL}/recommendations`
            );


        const data =
            await response.json();


        console.log(
            "Recommendations response:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load recommendations."
            );
        }


        let recommendations = [];


        if (Array.isArray(data)) {

            recommendations = data;

        }

        else if (
            data &&
            Array.isArray(data.recommendations)
        ) {

            recommendations =
                data.recommendations;

        }

        else if (
            data &&
            Array.isArray(data.data)
        ) {

            recommendations =
                data.data;

        }


        displayRecommendations(
            recommendations
        );

    }

    catch (error) {

        console.error(
            "Recommendation loading error:",
            error
        );


        recommendationsContainer.innerHTML = `
            <div class="recommendations-message">

                <h2>
                    Could not load recommendations
                </h2>

                <p>
                    ${escapeHTML(error.message)}
                </p>

            </div>
        `;
    }
}


/* =====================================================
   DISPLAY RECOMMENDATIONS
===================================================== */

function displayRecommendations(
    recommendations
) {

    if (!recommendations.length) {

        recommendationsContainer.innerHTML = `
            <div class="recommendations-message">

                <div class="empty-icon">
                    🎬
                </div>

                <h2>
                    No recommendations yet
                </h2>

                <p>
                    Be the first to recommend
                    a movie to the community.
                </p>

            </div>
        `;

        return;
    }


    recommendationsContainer.innerHTML =
        "";


    recommendations.forEach(
        function (recommendation) {

            const card =
                createRecommendationCard(
                    recommendation
                );


            recommendationsContainer.appendChild(
                card
            );

        }
    );
}


/* =====================================================
   CREATE RECOMMENDATION CARD
===================================================== */

function createRecommendationCard(
    recommendation
) {

    const recommendationId =
        recommendation.id ||
        recommendation.recommendation_id;


    const movieId =
        recommendation.movie_id ||
        recommendation.movie?.id;


    const movieTitle =
        recommendation.movie?.title ||
        recommendation.movie_title ||
        recommendation.title ||
        "Unknown Movie";


    const username =
        recommendation.username ||
        recommendation.user?.username ||
        recommendation.recommended_by ||
        "Unknown User";


    const recommendationText =
        recommendation.recommendation_text ||
        recommendation.text ||
        "No recommendation text.";


    const userId =
        recommendation.user_id ||
        recommendation.user?.id;


    const card =
        document.createElement(
            "article"
        );


    card.className =
        "recommendation-card";


    card.innerHTML = `

        <div class="recommendation-movie">

            <span class="movie-icon">
                🎬
            </span>

            <div>

                <h3>
                    ${escapeHTML(movieTitle)}
                </h3>

                <p>
                    RECOMMENDED BY

                    <strong>
                        ${escapeHTML(username)}
                    </strong>
                </p>

            </div>

        </div>


        <div class="recommendation-content">

            <p class="recommendation-text">
                "${escapeHTML(recommendationText)}"
            </p>


            <div class="recommendation-actions">

                <button
                    class="view-movie-button"
                    data-movie-id="${movieId}">
                    VIEW MOVIE
                </button>


                <button
                    class="comment-button"
                    data-recommendation-id="${recommendationId}">
                    COMMENTS
                </button>


                ${
                    currentUserId &&
                    Number(currentUserId) ===
                    Number(userId)

                    ? `

                    <button
                        class="delete-recommendation-button"
                        data-recommendation-id="${recommendationId}">
                        DELETE
                    </button>

                    `

                    : ""
                }

            </div>


            <div
                class="comments-section"
                id="comments-${recommendationId}"
                style="display:none;">
            </div>

        </div>

    `;


    /* VIEW MOVIE */

    const viewButton =
        card.querySelector(
            ".view-movie-button"
        );


    if (viewButton) {

        viewButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    `movie.html?id=${movieId}`;

            }
        );

    }


    /* COMMENTS */

    const commentButton =
        card.querySelector(
            ".comment-button"
        );


    if (commentButton) {

        commentButton.addEventListener(
            "click",
            function () {

                toggleComments(
                    recommendationId
                );

            }
        );

    }


    /* DELETE */

    const deleteButton =
        card.querySelector(
            ".delete-recommendation-button"
        );


    if (deleteButton) {

        deleteButton.addEventListener(
            "click",
            function () {

                deleteRecommendation(
                    recommendationId
                );

            }
        );

    }


    return card;
}


/* =====================================================
   TOGGLE COMMENTS
===================================================== */

async function toggleComments(
    recommendationId
) {

    const commentsSection =
        document.getElementById(
            `comments-${recommendationId}`
        );


    if (!commentsSection) {
        return;
    }


    /*
     * Close if already open
     */

    if (
        commentsSection.style.display ===
        "block"
    ) {

        commentsSection.style.display =
            "none";

        return;
    }


    commentsSection.style.display =
        "block";


    commentsSection.innerHTML = `

        <div class="loading">

            <div class="loading-spinner"></div>

            <p>
                Loading comments...
            </p>

        </div>

    `;


    try {

        const response =
            await fetch(
                `${API_URL}/comments/${recommendationId}`,
                {
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load comments."
            );
        }


        const comments =
            Array.isArray(data)
                ? data
                : data.comments || [];


        displayComments(
            recommendationId,
            comments
        );

    }

    catch (error) {

        console.error(
            "Comment loading error:",
            error
        );


        commentsSection.innerHTML = `
            <p class="no-comments">
                Could not load comments.
            </p>
        `;
    }
}


/* =====================================================
   DISPLAY COMMENTS
===================================================== */

function displayComments(
    recommendationId,
    comments
) {

    const commentsSection =
        document.getElementById(
            `comments-${recommendationId}`
        );


    if (!commentsSection) {
        return;
    }


    commentsSection.innerHTML = "";


    /*
     * No comments
     */

    if (!comments.length) {

        commentsSection.innerHTML = `
            <p class="no-comments">
                No comments yet.
                Be the first to comment!
            </p>
        `;
    }


    /*
     * Display comments
     */

    comments.forEach(
        function (comment) {

            const commentId =
                comment.id ||
                comment.comment_id;


            const username =
                comment.username ||
                comment.user?.username ||
                "User";


            const commentText =
                comment.comment_text ||
                comment.text ||
                "";


            const commentUserId =
                comment.user_id ||
                comment.user?.id;


            const commentElement =
                document.createElement(
                    "div"
                );


            commentElement.className =
                "comment-item";


            commentElement.innerHTML = `

                <div class="comment-user">
                    ${escapeHTML(username)}
                </div>

                <div class="comment-text">
                    ${escapeHTML(commentText)}
                </div>

                ${
                    currentUserId &&
                    Number(currentUserId) ===
                    Number(commentUserId)

                    ? `

                    <button
                        class="delete-comment-button"
                        data-comment-id="${commentId}">
                        DELETE
                    </button>

                    `

                    : ""
                }

            `;


            const deleteCommentButton =
                commentElement.querySelector(
                    ".delete-comment-button"
                );


            if (deleteCommentButton) {

                deleteCommentButton.addEventListener(
                    "click",
                    function () {

                        deleteComment(
                            commentId,
                            recommendationId
                        );

                    }
                );

            }


            commentsSection.appendChild(
                commentElement
            );

        }
    );


    /*
     * Comment form
     */

    const commentForm =
        document.createElement(
            "form"
        );


    commentForm.className =
        "comment-form";


    commentForm.innerHTML = `

        <input
            type="text"
            class="comment-input"
            placeholder="Write a comment..."
            maxlength="300"
            required
        >

        <button
            type="submit"
            class="comment-submit-button">
            POST
        </button>

    `;


    commentForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const input =
                commentForm.querySelector(
                    ".comment-input"
                );


            const commentText =
                input.value.trim();


            if (!commentText) {
                return;
            }


            try {

                const response =
                    await fetch(
                        `${API_URL}/comments/add/${recommendationId}`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`
                            },

                            body: JSON.stringify({
                                comment_text:
                                    commentText
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Failed to add comment."
                    );
                }


                /*
                 * Reload comments
                 */

                commentsSection.style.display =
                    "none";


                await toggleComments(
                    recommendationId
                );

            }

            catch (error) {

                console.error(
                    "Comment error:",
                    error
                );

                alert(
                    error.message ||
                    "Could not add comment."
                );
            }

        }
    );


    commentsSection.appendChild(
        commentForm
    );
}


/* =====================================================
   DELETE RECOMMENDATION
===================================================== */

async function deleteRecommendation(
    recommendationId
) {

    try {

        const response =
            await fetch(
                `${API_URL}/recommendations/${recommendationId}`,
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


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Could not delete recommendation."
            );
        }


        await loadRecommendations();

    }

    catch (error) {

        console.error(
            "Delete recommendation error:",
            error
        );

        alert(
            error.message ||
            "Could not delete recommendation."
        );
    }
}


/* =====================================================
   DELETE COMMENT
===================================================== */

async function deleteComment(
    commentId,
    recommendationId
) {

    try {

        const response =
            await fetch(
                `${API_URL}/comments/${commentId}`,
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


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Could not delete comment."
            );
        }


        const commentsSection =
            document.getElementById(
                `comments-${recommendationId}`
            );


        if (commentsSection) {

            commentsSection.style.display =
                "none";

        }


        await toggleComments(
            recommendationId
        );

    }

    catch (error) {

        console.error(
            "Delete comment error:",
            error
        );

        alert(
            error.message ||
            "Could not delete comment."
        );
    }
}


/* =====================================================
   FORM MESSAGE
===================================================== */

function showFormMessage(
    message,
    type
) {

    formMessage.textContent =
        message;


    formMessage.style.color =
        type === "success"
            ? "#7cff7c"
            : "#ff7070";
}


/* =====================================================
   LOGOUT
===================================================== */

logoutButton.addEventListener(
    "click",
    function () {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        window.location.href =
            "login.html";

    }
);


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        value ?? "";

    return div.innerHTML;
}


/* =====================================================
   INITIALIZE
===================================================== */

async function initialize() {

    /*
     * Load movies FIRST.
     * This is important because the
     * movie search depends on this array.
     */

    await loadMovies();


    /*
     * Then load recommendations.
     */

    await loadRecommendations();

}


/* =====================================================
   START MOVIE-HUB
===================================================== */

initialize();