const API_URL = "http://localhost:5000/api";

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}


/* =====================================================
   DOM ELEMENTS
===================================================== */

const profileUsername =
    document.getElementById("profileUsername");

const profileEmail =
    document.getElementById("profileEmail");

const avatarLetter =
    document.getElementById("avatarLetter");

const watchlistCount =
    document.getElementById("watchlistCount");

const recommendationCount =
    document.getElementById("recommendationCount");

const followersCount =
    document.getElementById("followersCount");

const followingCount =
    document.getElementById("followingCount");

const myRecommendationsContainer =
    document.getElementById(
        "myRecommendationsContainer"
    );

const logoutButton =
    document.getElementById("logoutButton");


/* =====================================================
   LOAD PROFILE
===================================================== */

async function loadProfile() {

    try {

        /*
         * Get logged-in user's profile
         */

        const response =
            await fetch(
                `${API_URL}/users/profile`,
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
            "Profile response:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load profile."
            );
        }


        const user =
            data.user ||
            data;


        /*
         * Display username
         */

        const username =
            user.username ||
            "User";


        profileUsername.textContent =
            username;


        /*
         * Display email
         */

        profileEmail.textContent =
            user.email ||
            "No email available";


        /*
         * Avatar letter
         */

        avatarLetter.textContent =
            username
                .charAt(0)
                .toUpperCase();


        /*
         * Save updated user
         */

        localStorage.setItem(
            "user",
            JSON.stringify(user)
        );


    }

    catch (error) {

        console.error(
            "Profile loading error:",
            error
        );


        profileUsername.textContent =
            "User";


        profileEmail.textContent =
            "Unable to load profile";

    }
}


/* =====================================================
   LOAD WATCHLIST COUNT
===================================================== */

async function loadWatchlistCount() {

    try {

        const response =
            await fetch(
                `${API_URL}/watchlist`,
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
            return;
        }


        const watchlist =
            Array.isArray(data)
                ? data
                : data.watchlist || [];


        watchlistCount.textContent =
            watchlist.length;

    }

    catch (error) {

        console.error(
            "Watchlist count error:",
            error
        );

    }
}


/* =====================================================
   LOAD RECOMMENDATIONS
===================================================== */

async function loadMyRecommendations() {

    try {

        const response =
            await fetch(
                `${API_URL}/recommendations/my`,
                {
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        console.log(
            "My recommendations response:",
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


        recommendationCount.textContent =
            recommendations.length;


        displayMyRecommendations(
            recommendations
        );

    }

    catch (error) {

        console.error(
            "Recommendations error:",
            error
        );


        recommendationCount.textContent =
            "0";


        myRecommendationsContainer.innerHTML = `
            <div class="profile-message">

                <h3>
                    Could not load recommendations
                </h3>

                <p>
                    ${escapeHTML(error.message)}
                </p>

            </div>
        `;

    }
}


/* =====================================================
   DISPLAY MY RECOMMENDATIONS
===================================================== */

function displayMyRecommendations(
    recommendations
) {

    if (!recommendations.length) {

        myRecommendationsContainer.innerHTML = `
            <div class="profile-message">

                <div style="font-size: 35px;">
                    🎬
                </div>

                <h3>
                    No recommendations yet
                </h3>

                <p>
                    Recommend a movie to the
                    Movie-Hub community.
                </p>

            </div>
        `;

        return;
    }


    myRecommendationsContainer.innerHTML =
        "";


    recommendations.forEach(
        function (recommendation) {

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


            const text =
                recommendation.recommendation_text ||
                recommendation.text ||
                "No recommendation text.";


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
                            YOUR RECOMMENDATION
                        </p>

                    </div>

                </div>


                <p class="recommendation-text">
                    "${escapeHTML(text)}"
                </p>


                <div class="recommendation-actions">

                    <button
                        class="view-button"
                        data-movie-id="${movieId}">

                        VIEW MOVIE

                    </button>


                    <button
                        class="delete-button"
                        data-id="${recommendationId}">

                        DELETE

                    </button>

                </div>

            `;


            /*
             * View movie
             */

            const viewButton =
                card.querySelector(
                    ".view-button"
                );


            viewButton.addEventListener(
                "click",
                function () {

                    window.location.href =
                        `movie.html?id=${movieId}`;

                }
            );


            /*
             * Delete recommendation
             */

            const deleteButton =
                card.querySelector(
                    ".delete-button"
                );


            deleteButton.addEventListener(
                "click",
                function () {

                    deleteRecommendation(
                        recommendationId
                    );

                }
            );


            myRecommendationsContainer.appendChild(
                card
            );

        }
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


        await loadMyRecommendations();

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
   LOAD FOLLOWERS
===================================================== */

async function loadFollowers() {

    try {

        const response =
            await fetch(
                `${API_URL}/follows/followers`,
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
            return;
        }


        const followers =
            Array.isArray(data)
                ? data
                : data.followers || [];


        followersCount.textContent =
            followers.length;

    }

    catch (error) {

        console.error(
            "Followers error:",
            error
        );

    }
}


/* =====================================================
   LOAD FOLLOWING
===================================================== */

async function loadFollowing() {

    try {

        const response =
            await fetch(
                `${API_URL}/follows/following`,
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
            return;
        }


        const following =
            Array.isArray(data)
                ? data
                : data.following || [];


        followingCount.textContent =
            following.length;

    }

    catch (error) {

        console.error(
            "Following error:",
            error
        );

    }
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

async function initializeProfile() {

    await loadProfile();

    await Promise.all([
        loadWatchlistCount(),
        loadMyRecommendations(),
        loadFollowers(),
        loadFollowing()
    ]);

}


initializeProfile();