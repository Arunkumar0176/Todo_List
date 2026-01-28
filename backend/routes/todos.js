const express = require("express");
const mongoose = require("mongoose");
const Todo = require("../models/Todo");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Inline DB check for all todo routes
router.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: "Database not connected" });
  }
  next();
});

// Get all todos for the logged-in user
router.get("/", async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log(`\n Fetching todos for user: ${userId}`); //using userID find user Todo
    // Sort by createdAt ascending (oldest first, newest at bottom)
    const todos = await Todo.find({ user: userId }).sort({ createdAt: 1 });
    console.log(` Found ${todos.length} todos for user ${userId}`);
    if (todos.length > 0) {
      console.log(
        ` Todo IDs:`,
        todos.map((t) => t._id.toString()),
      );
    }
    res.json(todos);
  } catch (error) {
    console.error(" Get todos error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Create a new todo for new users
router.post("/", async (req, res) => {
  try {
    console.log("\n ========== CREATING TODO ==========");
    console.log(" Request received");
    console.log(" Request body:", JSON.stringify(req.body));
    console.log(" Request user:", req.user);

    // Check if user is authenticated
    if (!req.user) {
      console.error(" No user object in request");
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!req.user.userId) {
      console.error(" No userId in user object:", req.user);
      return res.status(401).json({ message: "User ID not found in token" });
    }

    const { title, description, completed } = req.body;
    const userId = req.user.userId;

    console.log(" User ID from token:", userId);
    console.log(" Title:", title);

    if (!title || !title.trim()) {
      console.error(" Title is missing or empty");
      return res.status(400).json({ message: "Title is required" });
    }

    // Check if userId is valid ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error(" Invalid user ID format:", userId, typeof userId);
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    console.log(" Creating todo document...");
    const todo = new Todo({
      title: title.trim(),
      description: (description || "").trim(),
      completed: completed || false,
      user: userId,
    });

    console.log(" Saving todo to MongoDB...");
    console.log(
      " MongoDB connection state:",
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    );

    const savedTodo = await todo.save();

    console.log(` Todo saved successfully! ID: ${savedTodo._id}`);
    console.log(` Todo: ${savedTodo.title}`);
    console.log("========== TODO CREATED ==========\n");

    res.status(201).json(savedTodo);
  } catch (error) {
    console.error("\n ========== CREATE TODO ERROR ==========");
    console.error(" Error message:", error.message);
    console.error(" Error name:", error.name);
    console.error("Error stack:", error.stack);

    if (error.errors) {
      console.error(" Validation errors:", error.errors);
    }

    console.error(" Request user:", req.user);
    console.error(" Request body:", req.body);
    console.error("==========================================\n");

    // Handle specific Mongoose errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res
        .status(400)
        .json({ message: "Validation error: " + messages.join(", ") });
    }

    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ message: "Invalid data format: " + error.message });
    }

    // Return the actual error message
    const errorMessage = error.message || "Unknown server error";
    console.error(" Sending error response:", errorMessage);
    res.status(500).json({ message: errorMessage });
  }
});

// Get completed todos for the logged-in user
router.get("/completed", async (req, res) => {
  try {
    const {userId, role} = req.user;

   const query = {
      completed: false
    };

    if (role !== "admin") {
      query.user = userId;
    }

    const todos = await Todo.find(query).populate("user", "name email") 
    .sort({ createdAt: 1 });
    
    res.json(todos);
  } catch (error) {
    console.error(" Get completed todos error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Get incomplete todos for the logged-in user
router.get("/incomplete", async (req, res) => {
  try {
    const { userId, role } = req.user;

    const query = {
      completed: false
    };

    // normal user → only own todos
    if (role !== "admin") {
      query.user = userId;
    }

    const todos = await Todo.find(query)
      .populate("user", "name email") 
      .sort({ createdAt: 1 });

    res.json(todos);
  } catch (error) {
    console.error("Get incomplete todos error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});


// Fetch todos by specific date for the logged-in user
router.get("/by-date", async (req, res) => {
  try {
    const userId = req.user.userId;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const start = new Date(date);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const todos = await Todo.find({
      user: userId,
      createdAt: { $gte: start, $lte: end },
    }).sort({ createdAt: 1 });

    res.json(todos);
  } catch (error) {
    console.error(" Get todos by date error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

//find the todo using range wise date
router.get("/by-range", async (req, res) => {
  try {
    const { userId, role } = req.user;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "startDate and endDate are required",
      });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // 🔥 base query
    const query = {
      createdAt: {
        $gte: start,
        $lte: end,
      },
    };

    // 👤 if normal user → restrict to own todos
    if (role !== "admin") {
      query.user = userId;
    }

    const todos = await Todo.find(query).populate("user", "name email").sort({ createdAt: 1 });

    res.json(todos);
  } catch (error) {
    console.error("Get todos by range error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Mark todo complete/incomplete for the logged-in user
router.patch("/:id", async (req, res) => {
  try {
    const userId = req.user.userId;
    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      { completed: req.body.completed, updatedAt: Date.now() },
      { new: true },
    );

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json(todo);
  } catch (error) {
    console.error(" Update todo status error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Get a single todo by ID (keep this AFTER fixed routes like /completed, /incomplete, /by-date)
router.get("/:id", async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });
    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }
    res.json(todo);
  } catch (error) {
    console.error(" Get todo error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Update a todo (keep this AFTER fixed routes like /completed, /incomplete, /by-date)
router.put("/:id", async (req, res) => {
  try {
    const { title, description, completed } = req.body;

    const todo = await Todo.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });
    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    if (title !== undefined) todo.title = title;
    if (description !== undefined) todo.description = description;
    if (completed !== undefined) todo.completed = completed;
    todo.updatedAt = new Date();

    await todo.save();
    console.log(` Todo updated: ${todo._id}`);
    res.json(todo);
  } catch (error) {
    console.error(" Update todo error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a todo (keep this AFTER fixed routes like /completed, /incomplete, /by-date)
router.delete("/:id", async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });
    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }
    console.log(` Todo deleted: ${todo._id}`);
    res.json({ message: "Todo deleted successfully" });
  } catch (error) {
    console.error(" Delete todo error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
