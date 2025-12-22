const API_URL = "http://localhost:3000/api";
const userId = localStorage.getItem("studentUserId");
const userName = localStorage.getItem("studentName");

// Global State
let allCoursesData = [];
let enrolledIds = [];
let currentCategory = "All";

if (!userId) window.location.href = "index.html";

document.getElementById("user-display").innerText = userName;

async function init() {
  await fetchData();
  setupCategories();
  renderAll();

  // Live Search Event
  document.getElementById("course-search").addEventListener("input", renderAll);
}

async function fetchData() {
  try {
    const [userRes, courseRes] = await Promise.all([
      fetch(`${API_URL}/user/${userId}`),
      fetch(`${API_URL}/courses`),
    ]);
    const user = await userRes.json();
    allCoursesData = await courseRes.json();
    enrolledIds = user.enrolledCourses.map((c) => c._id);

    // Update Enrolled Section
    const enrollCount = document.getElementById("enroll-count");
    const enrollContainer = document.getElementById("enrolled-container");
    enrollCount.innerText = user.enrolledCourses.length;

    enrollContainer.innerHTML = user.enrolledCourses.length
      ? user.enrolledCourses.map((c) => createCourseCard(c, true)).join("")
      : `<div class="col-span-full p-8 border-2 border-dashed rounded-xl text-center text-gray-400">No courses enrolled yet.</div>`;
  } catch (err) {
    console.error("Data load failed", err);
  }
}

function setupCategories() {
  const filterContainer = document.getElementById("category-filters");
  const categories = ["All", ...new Set(allCoursesData.map((c) => c.category))];

  filterContainer.innerHTML = categories
    .map(
      (cat) => `
        <button class="category-pill border px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition 
            ${
              cat === "All" ? "active" : ""
            }" onclick="filterByCategory('${cat}', this)">${cat}</button>
    `
    )
    .join("");
}

function filterByCategory(cat, btn) {
  currentCategory = cat;
  document
    .querySelectorAll(".category-pill")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  renderAll();
}

function renderAll() {
  const searchTerm = document
    .getElementById("course-search")
    .value.toLowerCase();
  const container = document.getElementById("courses-container");

  // Logic: Filter out enrolled -> Filter by Category -> Filter by Search
  const filtered = allCoursesData
    .filter((c) => !enrolledIds.includes(c._id))
    .filter((c) => currentCategory === "All" || c.category === currentCategory)
    .filter(
      (c) =>
        c.title.toLowerCase().includes(searchTerm) ||
        c.description.toLowerCase().includes(searchTerm)
    );

  container.innerHTML = filtered.length
    ? filtered.map((c) => createCourseCard(c, false)).join("")
    : `<div class="col-span-full text-center py-12"><i class="fa-solid fa-magnifying-glass text-3xl text-gray-300 mb-2"></i><p class="text-gray-500">No courses found matching your criteria.</p></div>`;
}

function createCourseCard(course, isEnrolled) {
  return `
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300">
            <div class="relative">
                <img src="${
                  course.imageUrl
                }" class="h-44 w-full object-cover group-hover:scale-105 transition-transform duration-500" alt="${
    course.title
  }">
                <div class="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[10px] font-bold text-gray-800 shadow-sm">${
                  course.category
                }</div>
            </div>
            <div class="p-5 flex-grow">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-xs text-blue-600 font-bold"><i class="fa-solid fa-star mr-1"></i>4.8</span>
                    <span class="text-xs text-gray-400 font-medium">${
                      course.creditHours
                    } Credit Hours</span>
                </div>
                <h4 class="font-bold text-gray-900 leading-tight mb-2">${
                  course.title
                }</h4>
                <p class="text-gray-500 text-xs line-clamp-2">${
                  course.description
                }</p>
            </div>
            <div class="p-5 pt-0">
                <button onclick="${isEnrolled ? "unenroll" : "enroll"}('${
    course._id
  }')" 
                    class="w-full py-2.5 rounded-xl font-bold text-sm transition-all 
                    ${
                      isEnrolled
                        ? "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600"
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 shadow-lg"
                    }">
                    ${isEnrolled ? "Drop Course" : "Enroll Now"}
                </button>
            </div>
        </div>
    `;
}

async function enroll(courseId) {
  await fetch(`${API_URL}/enroll`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, courseId }),
  });
  init(); // Refresh data and UI
}

async function unenroll(courseId) {
  if (confirm("Confirm dropping this course?")) {
    await fetch(`${API_URL}/unenroll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, courseId }),
    });
    init();
  }
}

function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

init();
