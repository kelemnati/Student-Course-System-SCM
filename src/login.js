const form = document.getElementById("auth-form");
const toggleBtn = document.getElementById("toggle-btn");
const signupNames = document.getElementById("signup-names");
const messageDiv = document.getElementById("message");

let isLogin = true;

toggleBtn.addEventListener("click", () => {
  isLogin = !isLogin;
  signupNames.classList.toggle("hidden");
  document.getElementById("form-title").innerText = isLogin
    ? "Welcome Back"
    : "Create Account";
  document.getElementById("submit-btn").innerText = isLogin
    ? "Login"
    : "Register";
  toggleBtn.innerText = isLogin ? "Sign Up" : "Login";
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const firstName = document.getElementById("firstName")?.value;

  const endpoint = isLogin ? "/api/login" : "/api/signup";
  const payload = isLogin
    ? { email, password }
    : {
        firstName,
        lastName: document.getElementById("lastName").value,
        email,
        password,
      };

  try {
    const response = await fetch(`http://localhost:3000${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("studentUserId", data.userId);
      localStorage.setItem("studentName", data.userName || firstName);
      window.location.href = "course.html";
    } else {
      messageDiv.innerText = data.error;
      messageDiv.classList.remove("hidden");
    }
  } catch (err) {
    alert("Backend offline!");
  }
});
