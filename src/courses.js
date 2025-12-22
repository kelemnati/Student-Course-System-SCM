const API_URL = "http://localhost:3000/api";
const userId = localStorage.getItem("studentUserId");
const userName = localStorage.getItem("studentName");

// Redirect if not logged in
if (!userId) {
  window.location.href = "index.html";
}

document.getElementById("user-display").innerText = `Hi, ${userName}`;
document.getElementById("welcome-name").innerText = userName;

// Initialize Page
async function init() {
  await renderDashboard();
}

async function renderDashboard() {
  try {
    // 1. Fetch User Data (to see what they are enrolled in)
    const userRes = await fetch(`${API_URL}/user/${userId}`);
    const user = await userRes.json();
    const enrolledIds = user.enrolledCourses.map((c) => c._id);

    // 2. Fetch All Courses
    const courseRes = await fetch(`${API_URL}/courses`);
    const allCourses = await courseRes.json();

    // 3. Render Enrolled Courses
    const enrolledContainer = document.getElementById("enrolled-container");
    document.getElementById("enroll-count").innerText =
      user.enrolledCourses.length;

    if (user.enrolledCourses.length === 0) {
      enrolledContainer.innerHTML = `<p class="text-gray-400 col-span-full italic">You haven't enrolled in any courses yet.</p>`;
    } else {
      enrolledContainer.innerHTML = user.enrolledCourses
        .map((course) => createCourseCard(course, true))
        .join("");
    }

    // 4. Render Available Courses (Filter out what's already enrolled)
    const coursesContainer = document.getElementById("courses-container");
    const available = allCourses.filter((c) => !enrolledIds.includes(c._id));
    coursesContainer.innerHTML = available
      .map((course) => createCourseCard(course, false))
      .join("");
  } catch (err) {
    console.error("Error loading dashboard:", err);
  }
}

function createCourseCard(course, isEnrolled) {
  return `
        <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden flex flex-col">
            <img src="${
              course.imageUrl
            }" class="h-40 w-full object-cover" alt="${course.title}">
            <div class="p-5 flex-grow">
                <div class="flex justify-between items-start mb-2">
                    <span class="text-xs font-bold text-blue-500 uppercase tracking-wider">${
                      course.category
                    }</span>
                    <span class="text-xs text-gray-400"><i class="fa-regular fa-clock mr-1"></i>${
                      course.creditHours
                    } hrs</span>
                </div>
                <h4 class="font-bold text-gray-800 text-lg mb-2">${
                  course.title
                }</h4>
                <p class="text-gray-600 text-sm line-clamp-2 mb-4">${
                  course.description
                }</p>
            </div>
            <div class="p-5 pt-0">
                <button onclick="${isEnrolled ? "unenroll" : "enroll"}('${
    course._id
  }')" 
                        class="w-full py-2 px-4 rounded-lg font-semibold transition ${
                          isEnrolled
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                        }">
                    ${isEnrolled ? "Drop Course" : "Enroll Now"}
                </button>
            </div>
        </div>
    `;
}

async function enroll(courseId) {
  const res = await fetch(`${API_URL}/enroll`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, courseId }),
  });
  if (res.ok) renderDashboard();
}

async function unenroll(courseId) {
  if (!confirm("Are you sure you want to drop this course?")) return;
  const res = await fetch(`${API_URL}/unenroll`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, courseId }),
  });
  if (res.ok) renderDashboard();
}

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

init();
