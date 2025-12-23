const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Models
const User = require("./models/User");
const Course = require("./models/Course");

const app = express();
app.use(express.json());
app.use(cors());

const dbURI =
  "mongodb+srv://natikeleme1_db_user:B5ql6pj5G9EgGW27@student-db.vg4dlul.mongodb.net/studentEnrollment?retryWrites=true&w=majority&appName=student-db";

mongoose
  .connect(dbURI)
  .then(() => {
    console.log("Connected to MongoDB Atlas");
    seedCourses();
  })
  .catch((err) => console.error("Database connection error:", err));

// --- AUTH ROUTES ---

// SIGNUP
app.post("/api/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const newUser = new User({ firstName, lastName, email, password });
    await newUser.save();
    res.status(201).json({ message: "Account created!", userId: newUser._id });
  } catch (err) {
    res.status(400).json({ error: "Email already exists or data is missing." });
  }
});

// LOGIN
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (user) {
      res.json({
        message: "Login successful",
        userId: user._id,
        userName: user.firstName,
      });
    } else {
      res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// --- COURSE ROUTES ---

// Get all courses
app.get("/api/courses", async (req, res) => {
  const courses = await Course.find();
  res.json(courses);
});

// Get user profile (including their enrolled courses)
app.get("/api/user/:id", async (req, res) => {
  // Populate both enrolled and favorite courses
  const user = await User.findById(req.params.id)
    .populate("enrolledCourses")
    .populate("favorites");
  res.json(user);
});

app.post("/api/toggle-favorite", async (req, res) => {
  const { userId, courseId } = req.body;
  try {
    const user = await User.findById(userId);
    const isFavorited = user.favorites.includes(courseId);

    if (isFavorited) {
      user.favorites.pull(courseId); // Remove if exists
    } else {
      user.favorites.push(courseId); // Add if not exists
    }

    await user.save();
    res.json({ message: "Success", isFavorited: !isFavorited });
  } catch (err) {
    res.status(500).json({ error: "Failed to update favorites" });
  }
});

// Enroll
app.post("/api/enroll", async (req, res) => {
  const { userId, courseId } = req.body;
  await User.findByIdAndUpdate(userId, {
    $addToSet: { enrolledCourses: courseId },
  });
  res.json({ message: "Successfully enrolled!" });
});

// Unenroll
app.post("/api/unenroll", async (req, res) => {
  const { userId, courseId } = req.body;
  await User.findByIdAndUpdate(userId, {
    $pull: { enrolledCourses: courseId },
  });
  res.json({ message: "Successfully unenrolled!" });
});

// --- SEED FUNCTION ---
async function seedCourses() {
  const count = await Course.countDocuments();
  if (count === 0) {
    const sampleCourses = [
      {
        title: "Introduction to SCM",
        description: "Master Git, branching, and software baselines.",
        creditHours: 3,
        category: "Software Engineering",
        imageUrl:
          "https://images.unsplash.com/photo-1556075798-4825dfabb46e?w=400",
      },
      {
        title: "Full Stack Web Dev",
        description: "Build modern apps with MERN stack.",
        creditHours: 5,
        category: "Programming",
        imageUrl:
          "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400",
      },
      {
        title: "Database Architecture",
        description: "Design scalable NoSQL and SQL systems.",
        creditHours: 4,
        category: "Data Science",
        imageUrl:
          "https://images.unsplash.com/photo-1544383335-9235d69482c3?w=400",
      },
      {
        title: "UI/UX Design Basics",
        description: "Principles of user-centered interface design.",
        creditHours: 3,
        category: "Design",
        imageUrl:
          "https://images.unsplash.com/photo-1586717791821-3f44a563dc4c?w=400",
      },
      {
        title: "Cybersecurity 101",
        description: "Protecting systems from digital attacks.",
        creditHours: 4,
        category: "Security",
        imageUrl:
          "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400",
      },
      {
        title: "Machine Learning",
        description: "Introduction to Python-based AI models.",
        creditHours: 5,
        category: "Data Science",
        imageUrl:
          "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400",
      },
      {
        title: "Mobile App Dev",
        description: "Creating cross-platform apps with Flutter.",
        creditHours: 4,
        category: "Programming",
        imageUrl:
          "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400",
      },
      {
        title: "Cloud Computing",
        description: "Deploying applications to AWS and Azure.",
        creditHours: 3,
        category: "Infrastructure",
        imageUrl:
          "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400",
      },
      {
        title: "Project Management",
        description: "Agile, Scrum, and Kanban methodologies.",
        creditHours: 2,
        category: "Business",
        imageUrl:
          "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=400",
      },
      {
        title: "Digital Marketing",
        description: "SEO, SEM, and social media growth.",
        creditHours: 3,
        category: "Marketing",
        imageUrl:
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
      },
      {
        title: "Ethical Hacking",
        description: "Penetration testing and vulnerability assessment.",
        creditHours: 4,
        category: "Security",
        imageUrl:
          "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400",
      },
      {
        title: "Data Visualization",
        description: "Presenting data using D3.js and Tableau.",
        creditHours: 3,
        category: "Data Science",
        imageUrl:
          "https://images.unsplash.com/photo-1551288049-bbbda536ad0a?w=400",
      },
      {
        title: "Game Development",
        description: "Building 2D and 3D games in Unity.",
        creditHours: 5,
        category: "Programming",
        imageUrl:
          "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400",
      },
      {
        title: "Advanced Algorithms",
        description: "Solving complex computational problems.",
        creditHours: 4,
        category: "Computer Science",
        imageUrl:
          "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400",
      },
      {
        title: "Technical Writing",
        description: "Documenting APIs and complex software.",
        creditHours: 2,
        category: "Communication",
        imageUrl:
          "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400",
      },
    ];
    await Course.insertMany(sampleCourses);
    console.log("15 Courses successfully seeded!");
  }
}

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
