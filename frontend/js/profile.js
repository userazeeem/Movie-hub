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

let followersList = [];
let followingList = [];


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

        followersList = followers;

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

        followingList = following;

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
   USER SEARCH
===================================================== */

const userSearchInput = document.getElementById("userSearchInput");
const userSearchResults = document.getElementById("userSearchResults");
let userSearchTimer;

if (userSearchInput && userSearchResults) {

    userSearchInput.addEventListener("input", () => {

        clearTimeout(userSearchTimer);

        const q = userSearchInput.value.trim();

        if (!q) {
            userSearchResults.innerHTML = "";
            return;
        }

        userSearchTimer = setTimeout(() => searchUsers(q), 300);
    });
}

async function searchUsers(q) {

    try {

        const response = await fetch(
            `${API_URL}/users/search?q=${encodeURIComponent(q)}`,
            { headers: { "Authorization": `Bearer ${token}` } }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Search failed.");
        }

        renderUserResults(data.users || []);

    } catch (error) {

        console.error("User search error:", error);

        userSearchResults.innerHTML =
            `<p class="user-search-empty">${escapeHTML(error.message)}</p>`;
    }
}

function renderUserResults(users) {

    if (!users.length) {
        userSearchResults.innerHTML =
            `<p class="user-search-empty">No users found.</p>`;
        return;
    }

    userSearchResults.innerHTML = "";

    users.forEach((user) => {

        let isFollowing = Number(user.is_following) === 1;

        const row = document.createElement("div");

        row.className = "user-result";

        row.innerHTML = `
            <span class="user-result-name">${escapeHTML(user.username)}</span>
            <button class="user-follow-button ${isFollowing ? "following" : ""}">
                ${isFollowing ? "UNFOLLOW" : "FOLLOW"}
            </button>
        `;

        const button = row.querySelector(".user-follow-button");

        button.addEventListener("click", async () => {

            button.disabled = true;

            try {

                const action = isFollowing ? "remove" : "add";

                const response = await fetch(
                    `${API_URL}/follows/${action}/${user.id}`,
                    {
                        method: isFollowing ? "DELETE" : "POST",
                        headers: { "Authorization": `Bearer ${token}` }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Action failed.");
                }

                isFollowing = !isFollowing;

                button.textContent = isFollowing ? "UNFOLLOW" : "FOLLOW";

                button.classList.toggle("following", isFollowing);

                loadFollowing();   // refresh the FOLLOWING count and list

            } catch (error) {

                alert(error.message);

            } finally {

                button.disabled = false;
            }
        });

        userSearchResults.appendChild(row);
    });
}


/* =====================================================
   FOLLOWERS / FOLLOWING POPUP
===================================================== */

function closeUserListModal() {

    const modal = document.querySelector(".user-list-modal");

    if (modal) modal.remove();

    document.body.style.overflow = "";
}


async function removeRelation(mode, user, button) {

    const isFollowing = mode === "following";

    if (!isFollowing) {
        const ok = confirm(
            "Remove " + (user.username || "this user") + " from your followers?"
        );
        if (!ok) return;
    }

    const otherId = isFollowing ? user.following_id : user.follower_id;

    const url = isFollowing
        ? `${API_URL}/follows/remove/${otherId}`
        : `${API_URL}/follows/remove-follower/${otherId}`;

    button.disabled = true;

    try {

        const response = await fetch(url, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Action failed.");
        }

        if (isFollowing) {
            followingList = followingList.filter(
                (u) => u.following_id !== user.following_id
            );
            followingCount.textContent = followingList.length;
        } else {
            followersList = followersList.filter(
                (u) => u.follower_id !== user.follower_id
            );
            followersCount.textContent = followersList.length;
        }

        /* redraw the popup with the updated list */
        openUserListModal(mode);

    } catch (error) {

        alert(error.message);

        button.disabled = false;
    }
}


function openUserListModal(mode) {

    closeUserListModal();

    const isFollowing = mode === "following";

    const users = isFollowing ? followingList : followersList;

    const title = isFollowing ? "Following" : "Followers";

    const modal = document.createElement("div");
    modal.className = "user-list-modal";

    const box = document.createElement("div");
    box.className = "user-list-box";

    const header = document.createElement("div");
    header.className = "user-list-header";

    const heading = document.createElement("h3");
    heading.textContent = title + " (" + users.length + ")";

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "user-list-close";
    closeButton.textContent = "×";
    closeButton.addEventListener("click", closeUserListModal);

    header.appendChild(heading);
    header.appendChild(closeButton);

    const body = document.createElement("div");
    body.className = "user-list-body";

    if (!users.length) {

        const empty = document.createElement("p");
        empty.className = "user-list-empty";
        empty.textContent = isFollowing
            ? "You are not following anyone yet."
            : "No followers yet.";
        body.appendChild(empty);

    } else {

        users.forEach((user) => {

            const name = user.username || "User";

            const item = document.createElement("div");
            item.className = "user-list-item";

            const avatar = document.createElement("div");
            avatar.className = "user-list-avatar";
            avatar.textContent = name.charAt(0).toUpperCase();

            const label = document.createElement("span");
            label.className = "user-list-name";
            label.textContent = name;

            const actionButton = document.createElement("button");
            actionButton.type = "button";
            actionButton.className = "user-list-action";
            actionButton.textContent = isFollowing ? "UNFOLLOW" : "REMOVE";
            actionButton.addEventListener("click", () => {
                removeRelation(mode, user, actionButton);
            });

            item.appendChild(avatar);
            item.appendChild(label);
            item.appendChild(actionButton);
            body.appendChild(item);
        });
    }

    box.appendChild(header);
    box.appendChild(body);
    modal.appendChild(box);

    /* click the dark background to close */
    modal.addEventListener("click", (event) => {
        if (event.target === modal) closeUserListModal();
    });

    document.body.appendChild(modal);
    document.body.style.overflow = "hidden";
}


document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeUserListModal();
});


const followersCard = document.getElementById("followersCard");
const followingCard = document.getElementById("followingCard");

if (followersCard) {
    followersCard.addEventListener("click", () => {
        openUserListModal("followers");
    });
}

if (followingCard) {
    followingCard.addEventListener("click", () => {
        openUserListModal("following");
    });
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