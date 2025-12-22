const API_URL = "http://localhost:3000/api";
const userId = localStorage.getItem("studentUserId");
const userName = localStorage.getItem("studentName");

let allCoursesData = [];
let enrolledIds = [];
let currentCategory = "All";

if (!userId) window.location.href = "login.html";
document.getElementById("user-display").innerText = "Hi, " + userName;

async function fetchData() {
  try {
    const [userRes, courseRes] = await Promise.all([
      fetch(`${API_URL}/user/${userId}`),
      fetch(`${API_URL}/courses`),
    ]);
    const user = await userRes.json();
    allCoursesData = await courseRes.json();
    enrolledIds = user.enrolledCourses.map((c) => c._id);

    document.getElementById("enroll-count").innerText =
      user.enrolledCourses.length;
    document.getElementById("enrolled-container").innerHTML = user
      .enrolledCourses.length
      ? user.enrolledCourses.map((c) => createCard(c, true)).join("")
      : "<p class='text-gray-400 col-span-full italic'>You haven't enrolled in any courses yet.</p>";
  } catch (e) {
    console.error("Data fetch error:", e);
  }
}

function setupCategories() {
  const cats = ["All", ...new Set(allCoursesData.map((c) => c.category))];
  const container = document.getElementById("category-filters");

  container.innerHTML = cats
    .map((cat) => {
      const isActive = cat === currentCategory;
      return `
      <button 
          class="category-pill bg-white px-6 py-2.5 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50 ${
            isActive ? "active" : ""
          }" 
          onclick="filterByCategory('${cat}', this)">
          ${cat}
      </button>`;
    })
    .join("");
}

function filterByCategory(cat, btn) {
  currentCategory = cat;
  document
    .querySelectorAll(".category-pill")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  render();
}

function render() {
  const search = document.getElementById("course-search").value.toLowerCase();

  const filtered = allCoursesData
    .filter((c) => !enrolledIds.includes(c._id))
    .filter((c) => currentCategory === "All" || c.category === currentCategory)
    .filter(
      (c) =>
        c.title.toLowerCase().includes(search) ||
        c.category.toLowerCase().includes(search)
    );

  const container = document.getElementById("courses-container");
  if (filtered.length === 0) {
    container.innerHTML = `<div class="col-span-full text-center py-12 text-gray-400">No results found for "${search}"</div>`;
    return;
  }
  container.innerHTML = filtered.map((c) => createCard(c, false)).join("");
}

function createCard(c, isEnrolled) {
  return `
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
        <img src="${c.imageUrl}" class="h-44 w-full object-cover" alt="${
    c.title
  }">
        <div class="p-5 flex-grow">
            <span class="text-blue-600 text-[11px] font-bold uppercase tracking-wider">${
              c.category
            }</span>
            <h4 class="font-bold text-gray-800 mt-1">${c.title}</h4>
            <p class="text-gray-500 text-xs line-clamp-2 mt-2 leading-relaxed">${
              c.description
            }</p>
        </div>
        <div class="p-5 pt-0">
            <button onclick="${isEnrolled ? "unenroll" : "enroll"}('${c._id}')" 
                class="w-full py-3 rounded-xl text-sm font-bold transition-all ${
                  isEnrolled
                    ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100"
                }">
                ${isEnrolled ? "Drop Course" : "Enroll Now"}
            </button>
        </div>
    </div>`;
}

async function enroll(courseId) {
  await fetch(`${API_URL}/enroll`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, courseId }),
  });
  init();
}

async function unenroll(courseId) {
  if (confirm("Are you sure you want to drop this course?")) {
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
  window.location.href = "login.html";
}

async function init() {
  await fetchData();
  setupCategories();
  render();
  document.getElementById("course-search").addEventListener("input", render);
}

init();
