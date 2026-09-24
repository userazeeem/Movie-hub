/* =====================================================
   MOVIE-HUB
   RECOMMENDATIONS JAVASCRIPT
===================================================== */

const API_URL = "http://localhost:5000/api";

const token = localStorage.getItem("token");

const storedUser =
    JSON.parse(localStorage.getItem("user")) || {};

const currentUserId =
    storedUser.id ||
    storedUser.user_id ||
    null;


/* =====================================================
   LOGIN CHECK
===================================================== */

if (!token) {
    window.location.href = "login.html";
}


/* =====================================================
   DOM ELEMENTS
===================================================== */

const recommendationsContainer =
    document.getElementById(
        "recommendationsContainer"
    );

const recommendationFormSection =
    document.getElementById(
        "recommendationFormSection"
    );

const showAddFormButton =
    document.getElementById(
        "showAddFormButton"
    );

const closeFormButton =
    document.getElementById(
        "closeFormButton"
    );

const cancelRecommendationButton =
    document.getElementById(
        "cancelRecommendationButton"
    );

const recommendationForm =
    document.getElementById(
        "recommendationForm"
    );

const movieSelect =
    document.getElementById(
        "movieSelect"
    );

const recommendationText =
    document.getElementById(
        "recommendationText"
    );

const submitRecommendationButton =
    document.getElementById(
        "submitRecommendationButton"
    );

const formMessage =
    document.getElementById(
        "formMessage"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


/* =====================================================
   SHOW FORM
===================================================== */

showAddFormButton.addEventListener(
    "click",
    async () => {

        recommendationFormSection.classList.remove(
            "hidden"
        );

        showAddFormButton.style.display = "none";

        await loadMovies();

        recommendationFormSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
);


/* =====================================================
   CLOSE FORM
===================================================== */

function closeRecommendationForm() {

    recommendationFormSection.classList.add(
        "hidden"
    );

    showAddFormButton.style.display =
        "inline-flex";

    recommendationForm.reset();

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
            await fetch(
                `${API_URL}/movies`
            );

        const data =
            await response.json();

        console.log(
            "Movies response:",
            data
        );

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load movies."
            );
        }


        const movies =
            Array.isArray(data)
                ? data
                : data.movies || [];


        movieSelect.innerHTML = `
            <option value="">
                Choose a movie...
            </option>
        `;


        movies.forEach(movie => {

            const option =
                document.createElement("option");

            option.value = movie.id;

            option.textContent =
                movie.title;

            movieSelect.appendChild(
                option
            );
        });


    } catch (error) {

        console.error(
            "Movie loading error:",
            error
        );

        movieSelect.innerHTML = `
            <option value="">
                Could not load movies
            </option>
        `;
    }
}


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


        const recommendations =
            Array.isArray(data)
                ? data
                : data.recommendations || [];


        displayRecommendations(
            recommendations
        );


    } catch (error) {

        console.error(
            "Recommendation loading error:",
            error
        );

        recommendationsContainer.innerHTML = `
            <div class="recommendations-message">

                <div class="empty-icon">
                    🎬
                </div>

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
                    Be the first to recommend a movie
                    to the Movie-Hub community.
                </p>

            </div>

        `;

        return;
    }


    recommendationsContainer.innerHTML = "";


    recommendations.forEach(
        recommendation => {

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

    const card =
        document.createElement("article");

    card.className =
        "recommendation-card";


    /*
       Support different possible
       backend response structures.
    */

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
        "Movie-Hub User";


    const text =
        recommendation.recommendation_text ||
        recommendation.text ||
        "No recommendation text available.";


    const userId =
        recommendation.user_id ||
        recommendation.user?.id;


    card.innerHTML = `

        <div class="recommendation-movie">

            <h3>
                ${escapeHTML(movieTitle)}
            </h3>

        </div>


        <div class="recommendation-content">

            <p class="recommended-by">

                RECOMMENDED BY

                <strong>
                    ${escapeHTML(username)}
                </strong>

            </p>


            <p class="recommendation-text">

                ${escapeHTML(text)}

            </p>


            <div class="recommendation-actions">

                <button
                    class="view-movie-button"
                    data-movie-id="${movieId || ""}"
                >
                    VIEW MOVIE
                </button>


                <button
                    class="comment-button"
                    data-recommendation-id="${recommendationId}"
                >
                    COMMENTS
                </button>

                ${
                    Number(userId) === Number(currentUserId)
                    ?
                    `
                    <button
                        class="delete-recommendation-button"
                        data-recommendation-id="${recommendationId}"
                    >
                        DELETE
                    </button>
                    `
                    :
                    ""
                }

            </div>


            <div
                class="comments-section"
                id="comments-${recommendationId}"
                style="display: none;"
            >

                <h4>
                    COMMENTS
                </h4>

                <div class="comments-list">
                    Loading comments...
                </div>


                <form
                    class="comment-form"
                    data-recommendation-id="${recommendationId}"
                >

                    <input
                        type="text"
                        class="comment-input"
                        placeholder="Write a comment..."
                        maxlength="300"
                        required
                    >

                    <button
                        type="submit"
                        class="comment-submit-button"
                    >
                        POST
                    </button>

                </form>

            </div>

        </div>

    `;


    /* =================================================
       VIEW MOVIE
    ================================================= */

    const viewButton =
        card.querySelector(
            ".view-movie-button"
        );


    viewButton.addEventListener(
        "click",
        () => {

            if (!movieId) {

                alert(
                    "Movie information is unavailable."
                );

                return;
            }


            window.location.href =
                `movie.html?id=${movieId}`;
        }
    );


    /* =================================================
       COMMENTS BUTTON
    ================================================= */

    const commentButton =
        card.querySelector(
            ".comment-button"
        );


    commentButton.addEventListener(
        "click",
        async () => {

            const commentsSection =
                card.querySelector(
                    ".comments-section"
                );


            const isHidden =
                commentsSection.style.display ===
                "none";


            if (isHidden) {

                commentsSection.style.display =
                    "block";

                await loadComments(
                    recommendationId,
                    commentsSection
                );

            } else {

                commentsSection.style.display =
                    "none";
            }
        }
    );


    /* =================================================
       DELETE RECOMMENDATION
    ================================================= */

    const deleteButton =
        card.querySelector(
            ".delete-recommendation-button"
        );


    if (deleteButton) {

        deleteButton.addEventListener(
            "click",
            async () => {

                await deleteRecommendation(
                    recommendationId
                );
            }
        );
    }


    /* =================================================
       COMMENT FORM
    ================================================= */

    const commentForm =
        card.querySelector(
            ".comment-form"
        );


    commentForm.addEventListener(
        "submit",
        async event => {

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


            await addComment(
                recommendationId,
                commentText,
                input,
                card
            );
        }
    );


    return card;
}


/* =====================================================
   ADD RECOMMENDATION
===================================================== */

recommendationForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const movieId =
            Number(movieSelect.value);


        const text =
            recommendationText.value.trim();


        if (!movieId) {

            showFormMessage(
                "Please select a movie.",
                "error"
            );

            return;
        }


        if (!text) {

            showFormMessage(
                "Please write a recommendation.",
                "error"
            );

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
                                movieId,

                            recommendation_text:
                                text
                        })
                    }
                );


            const data =
                await response.json();


            console.log(
                "Add recommendation response:",
                data
            );


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Could not add recommendation."
                );
            }


            showFormMessage(
                "Recommendation posted successfully!",
                "success"
            );


            recommendationForm.reset();


            await loadRecommendations();


            setTimeout(
                closeRecommendationForm,
                800
            );


        } catch (error) {

            console.error(
                "Add recommendation error:",
                error
            );


            showFormMessage(
                error.message ||
                "Could not post recommendation.",
                "error"
            );


        } finally {

            submitRecommendationButton.disabled =
                false;

            submitRecommendationButton.textContent =
                "POST RECOMMENDATION";
        }
    }
);


/* =====================================================
   DELETE RECOMMENDATION
===================================================== */

async function deleteRecommendation(
    recommendationId
) {

    if (!recommendationId) {

        return;
    }


    const confirmed =
        confirm(
            "Delete this recommendation?"
        );


    if (!confirmed) {

        return;
    }


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


        console.log(
            "Delete recommendation response:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Could not delete recommendation."
            );
        }


        await loadRecommendations();


    } catch (error) {

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
   LOAD COMMENTS
===================================================== */

async function loadComments(
    recommendationId,
    commentsSection
) {

    const commentsList =
        commentsSection.querySelector(
            ".comments-list"
        );


    commentsList.innerHTML =
        "Loading comments...";


    try {

        const response =
            await fetch(
                `${API_URL}/comments/${recommendationId}`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        console.log(
            "Comments response:",
            data
        );


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
            comments,
            commentsList
        );


    } catch (error) {

        console.error(
            "Comments loading error:",
            error
        );


        commentsList.innerHTML = `
            <p class="comment-text">
                ${escapeHTML(error.message)}
            </p>
        `;
    }
}


/* =====================================================
   DISPLAY COMMENTS
===================================================== */

function displayComments(
    comments,
    container
) {

    if (!comments.length) {

        container.innerHTML = `
            <p class="comment-text">
                No comments yet. Be the first!
            </p>
        `;

        return;
    }


    container.innerHTML = "";


    comments.forEach(comment => {

        const commentId =
            comment.id ||
            comment.comment_id;


        const userId =
            comment.user_id ||
            comment.user?.id;


        const username =
            comment.username ||
            comment.user?.username ||
            "User";


        const text =
            comment.comment_text ||
            comment.text ||
            "";


        const item =
            document.createElement("div");


        item.className =
            "comment-item";


        item.innerHTML = `

            <div class="comment-user">

                @${escapeHTML(username)}

            </div>


            <p class="comment-text">

                ${escapeHTML(text)}

            </p>

            ${
                Number(userId) === Number(currentUserId)
                ?
                `
                <button
                    class="delete-comment-button"
                    data-comment-id="${commentId}"
                >
                    Delete
                </button>
                `
                :
                ""
            }

        `;


        const deleteButton =
            item.querySelector(
                ".delete-comment-button"
            );


        if (deleteButton) {

            deleteButton.addEventListener(
                "click",
                async () => {

                    await deleteComment(
                        commentId,
                        container
                    );
                }
            );
        }


        container.appendChild(item);
    });
}


/* =====================================================
   ADD COMMENT
===================================================== */

async function addComment(
    recommendationId,
    commentText,
    input,
    card
) {

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


        console.log(
            "Add comment response:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Could not add comment."
            );
        }


        input.value = "";


        const commentsSection =
            card.querySelector(
                ".comments-section"
            );


        await loadComments(
            recommendationId,
            commentsSection
        );


    } catch (error) {

        console.error(
            "Add comment error:",
            error
        );


        alert(
            error.message ||
            "Could not add comment."
        );
    }
}


/* =====================================================
   DELETE COMMENT
===================================================== */

async function deleteComment(
    commentId,
    commentsContainer
) {

    const confirmed =
        confirm(
            "Delete this comment?"
        );


    if (!confirmed) {

        return;
    }


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


        console.log(
            "Delete comment response:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Could not delete comment."
            );
        }


        /*
           Reload comments after deletion.
           Find the recommendation ID from
           the surrounding section.
        */

        const commentsSection =
            commentsContainer.closest(
                ".comments-section"
            );


        if (commentsSection) {

            const recommendationId =
                commentsSection.id.replace(
                    "comments-",
                    ""
                );


            await loadComments(
                recommendationId,
                commentsSection
            );
        }


    } catch (error) {

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


    if (type === "success") {

        formMessage.style.color =
            "#65e56b";

    } else {

        formMessage.style.color =
            "#ff5964";
    }
}


/* =====================================================
   LOGOUT
===================================================== */

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


/* =====================================================
   HTML ESCAPE
===================================================== */

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;
}


/* =====================================================
   INITIAL LOAD
===================================================== */

loadRecommendations();