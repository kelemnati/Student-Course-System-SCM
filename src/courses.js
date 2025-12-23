const API_URL = "http://localhost:3000/api";
const userId = localStorage.getItem("studentUserId");
const userName = localStorage.getItem("studentName");

let allCoursesData = [];
let enrolledIds = [];
let favoriteIds = [];
let currentCategory = "All";

if (!userId) window.location.href = "login.html";
document.getElementById("user-display").innerText = "Hi, " + userName;

async function fetchData() {
  const resUser = await fetch(`${API_URL}/user/${userId}`);
  const resCourses = await fetch(`${API_URL}/courses`);
  const user = await resUser.json();
  allCoursesData = await resCourses.json();

  enrolledIds = user.enrolledCourses.map((c) => c._id);
  favoriteIds = user.favorites.map((c) => c._id);

  document.getElementById("enroll-count").innerText =
    user.enrolledCourses.length;
  document.getElementById("enrolled-container").innerHTML = user.enrolledCourses
    .length
    ? user.enrolledCourses.map((c) => createCard(c, true)).join("")
    : "<p class='text-gray-400 col-span-full'>No enrollments yet.</p>";
}

function setupCategories() {
  const cats = [
    "All",
    "Favorites",
    ...new Set(allCoursesData.map((c) => c.category)),
  ];
  document.getElementById("category-filters").innerHTML = cats
    .map(
      (cat) => `
        <button class="category-pill bg-white px-6 py-2.5 rounded-full text-sm font-medium text-gray-600 ${
          cat === currentCategory ? "active" : ""
        }" 
            onclick="filterByCategory('${cat}', this)">
            ${cat === "Favorites" ? "❤️ Favorites" : cat}
        </button>
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
  render();
}

function render() {
  const search = document.getElementById("course-search").value.toLowerCase();
  const filtered = allCoursesData
    .filter((c) => !enrolledIds.includes(c._id))
    .filter((c) => {
      const matchesSearch = c.title.toLowerCase().includes(search);
      const matchesCat =
        currentCategory === "All"
          ? true
          : currentCategory === "Favorites"
          ? favoriteIds.includes(c._id)
          : c.category === currentCategory;
      return matchesSearch && matchesCat;
    });

  document.getElementById("courses-container").innerHTML = filtered.length
    ? filtered.map((c) => createCard(c, false)).join("")
    : `<div class="col-span-full text-center py-10 text-gray-400">No results found.</div>`;
}

function createCard(c, isEnrolled) {
  const isLiked = favoriteIds.includes(c._id);
  return `
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-all relative">
        ${
          !isEnrolled
            ? `
        <button onclick="toggleFavorite('${
          c._id
        }')" class="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:scale-110 transition-transform">
            <i class="${isLiked ? "fa-solid" : "fa-regular"} fa-heart ${
                isLiked ? "text-red-500" : "text-gray-400"
              }"></i>
        </button>`
            : ""
        }
        
        <img src="${c.imageUrl}" class="h-44 w-full object-cover">
        <div class="p-5 flex-grow">
            <span class="text-blue-600 text-[11px] font-bold uppercase">${
              c.category
            }</span>
            <h4 class="font-bold text-gray-800 mt-1">${c.title}</h4>
            <p class="text-gray-500 text-xs line-clamp-2 mt-2">${
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

async function toggleFavorite(courseId) {
  await fetch(`${API_URL}/toggle-favorite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, courseId }),
  });
  await fetchData();
  render();
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
  if (confirm("Drop course?")) {
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
