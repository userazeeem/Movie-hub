const API_URL = "http://localhost:5000/api";

/* =====================================================
   LOGIN
===================================================== */

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    const loginButton = document.getElementById("loginButton");
    const message = document.getElementById("message");

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        if (!email || !password) {
            showMessage(message, "Please enter email and password.", "error");
            return;
        }

        loginButton.disabled = true;
        loginButton.textContent = "LOGGING IN...";

        try {

            const response = await fetch(`${API_URL}/auth/login`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })

            });

            const data = await response.json();

            console.log("Login response:", data);

            if (!response.ok) {

                showMessage(
                    message,
                    data.message || "Login failed.",
                    "error"
                );

                return;
            }

            /* Store JWT */

            localStorage.setItem("token", data.token);

            /* Store user information */

            if (data.user) {
                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );
            }

            showMessage(
                message,
                "Login successful! Redirecting...",
                "success"
            );

            setTimeout(() => {
                window.location.href = "index.html";
            }, 1000);

        } catch (error) {

            console.error("Login error:", error);

            showMessage(
                message,
                "Cannot connect to Movie-Hub server.",
                "error"
            );

        } finally {

            loginButton.disabled = false;
            loginButton.textContent = "LOGIN";

        }

    });
}


/* =====================================================
   SIGNUP
===================================================== */

const signupForm = document.getElementById("signupForm");

if (signupForm) {

    const signupButton = document.getElementById("signupButton");
    const signupMessage = document.getElementById("signupMessage");

    signupForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const username =
            document.getElementById("username").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        if (!username || !email || !password) {

            showMessage(
                signupMessage,
                "Please fill in all fields.",
                "error"
            );

            return;
        }

        signupButton.disabled = true;
        signupButton.textContent = "CREATING ACCOUNT...";

        try {

            const response = await fetch(
                `${API_URL}/auth/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        username: username,
                        email: email,
                        password: password
                    })
                }
            );

            const data = await response.json();

            console.log("Signup response:", data);

            if (!response.ok) {

                showMessage(
                    signupMessage,
                    data.message || "Registration failed.",
                    "error"
                );

                return;
            }

            showMessage(
                signupMessage,
                "Account created successfully! Redirecting...",
                "success"
            );

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);

        } catch (error) {

            console.error("Signup error:", error);

            showMessage(
                signupMessage,
                "Cannot connect to Movie-Hub server.",
                "error"
            );

        } finally {

            signupButton.disabled = false;
            signupButton.textContent = "CREATE ACCOUNT";

        }

    });
}


/* =====================================================
   MESSAGE FUNCTION
===================================================== */

function showMessage(element, text, type) {

    element.textContent = text;

    if (type === "success") {
        element.style.color = "#7cff7c";
    } else {
        element.style.color = "#ff7070";
    }

}