const form = document.getElementById("auth-form");
const toggleBtn = document.getElementById("toggle-btn");
const signupNames = document.getElementById("signup-names");
const formTitle = document.getElementById("form-title");
const formSubtitle = document.getElementById("form-subtitle");
const submitBtn = document.getElementById("submit-btn");
const messageDiv = document.getElementById("message");

let isLogin = true;

// 1. Handle Toggle between Login/Signup
toggleBtn.addEventListener("click", () => {
  isLogin = !isLogin;

  // UI Transitions
  signupNames.classList.toggle("hidden");
  formTitle.innerText = isLogin ? "Welcome Back" : "Create Account";
  formSubtitle.innerText = isLogin
    ? "Please enter your details to login"
    : "Join our learning community today";
  submitBtn.innerText = isLogin ? "Login" : "Register";
  toggleBtn.innerText = isLogin ? "Sign Up" : "Login";
  document.getElementById("toggle-text").innerText = isLogin
    ? "Don't have an account?"
    : "Already have an account?";
  messageDiv.classList.add("hidden");
});

// 2. Form Submission & Validation
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;

  const endpoint = isLogin ? "/api/login" : "/api/signup";
  const payload = isLogin
    ? { email, password }
    : { firstName, lastName, email, password };

  try {
    const response = await fetch(`http://localhost:3000${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      showMessage("Success! Redirecting...", "bg-green-100 text-green-700");

      // Store User ID in local storage for use in course.html
      localStorage.setItem("studentUserId", data.userId);
      localStorage.setItem("studentName", data.userName || firstName);

      // Redirect after 1.5 seconds
      setTimeout(() => {
        window.location.href = "course.html";
      }, 1500);
    } else {
      showMessage(
        data.error || "Something went wrong",
        "bg-red-100 text-red-700"
      );
    }
  } catch (err) {
    showMessage("Server is offline. Check backend.", "bg-red-100 text-red-700");
  }
});

function showMessage(text, classes) {
  messageDiv.innerText = text;
  messageDiv.className = `mb-4 p-3 rounded text-center ${classes}`;
  messageDiv.classList.remove("hidden");
}
