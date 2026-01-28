# Complete File-by-File Data Flow Explanation

## 📁 Project Structure

```
Todo_list/
├── backend/
│   ├── server.js                    # Entry point
│   ├── models/
│   │   ├── User.js                  # User schema & methods
│   │   └── Todo.js                  # Todo schema
│   ├── middleware/
│   │   ├── auth.js                  # JWT authentication
│   │   └── rbac.js                  # Role-based access control
│   └── routes/
│       ├── auth.js                  # Signup & Login routes
│       ├── todos.js                 # Todo CRUD routes
│       └── admin.js                 # Admin routes
└── frontend/
    ├── src/
    │   ├── App.js                   # Main app component
    │   ├── Api.js                   # Axios configuration
    │   └── pages/
    │       ├── Auth.jsx             # Login/Signup page
    │       └── Home.jsx             # Todo list page
```

---

## 🔵 USER SIGNUP FLOW - File by File

### Step 1: User Clicks Signup Button

**File**: `frontend/src/pages/Auth.jsx`

```javascript
// Line 39: User submits signup form
const res = await API.post("/auth/signup", form);
// form = { name: "...", email: "...", password: "..." }
```

**What happens**:
- User fills form (name, email, password)
- Form submitted via `submit()` function
- `API.post()` is called with signup data

---

### Step 2: API Request Interceptor

**File**: `frontend/src/Api.js`

```javascript
// Line 1-5: Axios instance created
export const API = axios.create({
  baseURL: "http://localhost:3001/api"
});

// Line 8-19: Request interceptor
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**What happens**:
- Request goes through interceptor
- Base URL added: `http://localhost:3001/api`
- Full URL becomes: `http://localhost:3001/api/auth/signup`
- Request sent to backend

---

### Step 3: Backend Server Receives Request

**File**: `backend/server.js`

```javascript
// Line 1-14: Server setup
const express = require('express');
const app = express();
app.use(cors());
app.use(express.json());

// Line 39: Auth routes mounted
app.use('/api/auth', authRoutes);
```

**What happens**:
- Express server receives POST request at `/api/auth/signup`
- CORS middleware allows cross-origin request
- `express.json()` parses JSON body
- Request routed to `authRoutes` (from `routes/auth.js`)

---

### Step 4: Signup Route Handler

**File**: `backend/routes/auth.js`

```javascript
// Line 15-83: Signup route
router.post('/signup', async (req, res) => {
  // Line 25: Extract data from request body
  const { name, email, password, employeeId } = req.body;
  
  // Line 28-34: Validate input
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Required fields missing' });
  }
  
  // Line 37-40: Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'User exists' });
  }
  
  // Line 43: Determine role
  const userRole = (employeeId === 'ARUN12345') ? 'admin' : 'user';
  
  // Line 46-51: Create user instance
  const user = new User({ 
    name, 
    email, 
    password, 
    role: userRole 
  });
```

**What happens**:
- Route handler receives request
- Validates required fields
- Checks if user already exists (queries MongoDB)
- Determines role (admin if employeeId matches, else user)
- Creates new User instance

---

### Step 5: User Model - Pre-Save Hook

**File**: `backend/models/User.js`

```javascript
// Line 4-9: User schema definition
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
});

// Line 12-23: Pre-save hook (AUTOMATICALLY CALLED BEFORE SAVE)
userSchema.pre('save', async function () {
  const user = this;  // 'this' refers to the user document being saved
  
  // Only hash if password is new or modified
  if (!user.isModified('password')) return;
  
  // Prevent double hashing
  if (user.password.startsWith('$2')) return;
  
  // Hash password with bcrypt (10 rounds)
  const hash = await bcrypt.hash(user.password, 10);
  user.password = hash;  // Replace plain password with hash
});
```

**What happens**:
- When `user.save()` is called, Mongoose automatically triggers pre-save hook
- Password is hashed using bcrypt (10 salt rounds)
- Plain password replaced with hash
- This happens AUTOMATICALLY - no manual call needed

---

### Step 6: Save User to MongoDB

**File**: `backend/routes/auth.js`

```javascript
// Line 54: Save user to database
await user.save();
```

**What happens**:
- `user.save()` is called
- Pre-save hook executes (password hashed)
- User document saved to MongoDB `users` collection
- MongoDB stores:
  ```javascript
  {
    _id: ObjectId("..."),
    name: "John Doe",
    email: "john@example.com",
    password: "$2b$10$hashed_password_here...",  // Hashed!
    role: "user",
    __v: 0
  }
  ```

---

### Step 7: Generate JWT Token

**File**: `backend/routes/auth.js`

```javascript
// Line 1: Import JWT
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

// Line 58-62: Generate token
const token = jwt.sign(
  { 
    userId: user._id.toString(), 
    email: user.email, 
    role: user.role 
  },
  JWT_SECRET,
  { expiresIn: '7d' }
);
```

**What happens**:
- JWT token created with user info (userId, email, role)
- Signed with JWT_SECRET
- Expires in 7 days
- Token is a string like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

### Step 8: Return Response

**File**: `backend/routes/auth.js`

```javascript
// Line 65-69: Send response
res.status(201).json({ 
  message: 'User created successfully', 
  token,
  user: { 
    id: user._id.toString(), 
    name: user.name, 
    email: user.email, 
    role: user.role 
  }
});
```

**What happens**:
- Response sent back to frontend
- Contains: token, user info (without password)
- Status: 201 Created

---

### Step 9: Frontend Receives Response

**File**: `frontend/src/pages/Auth.jsx`

```javascript
// Line 39-43: Handle signup response
const res = await API.post("/auth/signup", form);

// Line 40-41: Store token and user in localStorage
localStorage.setItem("token", res.data.token);
localStorage.setItem("user", JSON.stringify(res.data.user));

// Line 42-43: Show success and redirect
alert("Signup successful!");
window.location.href = "/home";
```

**What happens**:
- Response received
- Token stored in `localStorage.setItem("token", ...)`
- User info stored in `localStorage.setItem("user", ...)`
- User redirected to `/home`

---

## 🔐 USER LOGIN FLOW - File by File

### Step 1: User Clicks Login Button

**File**: `frontend/src/pages/Auth.jsx`

```javascript
// Line 14-17: User submits login form
const res = await API.post("/auth/login", { 
  email: form.email, 
  password: form.password 
});
```

**What happens**:
- User enters email and password
- Form submitted
- `API.post()` called with login credentials

---

### Step 2: API Request Interceptor

**File**: `frontend/src/Api.js`

```javascript
// Same as signup - request goes through interceptor
// URL: http://localhost:3001/api/auth/login
```

---

### Step 3: Backend Server Routes Request

**File**: `backend/server.js`

```javascript
// Request routed to authRoutes
app.use('/api/auth', authRoutes);
```

---

### Step 4: Login Route Handler

**File**: `backend/routes/auth.js`

```javascript
// Line 86-127: Login route
router.post('/login', async (req, res) => {
  // Line 94: Extract credentials
  const { email, password } = req.body;
  
  // Line 96-98: Validate input
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }
  
  // Line 100: Find user by email
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }
```

**What happens**:
- Route handler receives login request
- Validates email and password provided
- Queries MongoDB to find user by email
- If user not found, returns error

---

### Step 5: Compare Password

**File**: `backend/models/User.js`

```javascript
// Line 26-28: Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
```

**File**: `backend/routes/auth.js`

```javascript
// Line 105: Call comparePassword method
const isMatch = await user.comparePassword(password);
if (!isMatch) {
  return res.status(400).json({ message: 'Invalid credentials' });
}
```

**What happens**:
- `user.comparePassword(password)` is called
- Method in User model compares:
  - Input password (plain text)
  - Stored password (hashed)
- `bcrypt.compare()` handles the comparison
- Returns `true` if match, `false` otherwise

---

### Step 6: Generate JWT Token

**File**: `backend/routes/auth.js`

```javascript
// Line 110-114: Generate token (same as signup)
const token = jwt.sign(
  { 
    userId: user._id.toString(), 
    email: user.email, 
    role: user.role 
  },
  JWT_SECRET,
  { expiresIn: '7d' }
);
```

---

### Step 7: Return Response

**File**: `backend/routes/auth.js`

```javascript
// Line 117-121: Send response
res.json({ 
  message: 'Login successful', 
  token,
  user: { 
    id: user._id.toString(), 
    name: user.name, 
    email: user.email, 
    role: user.role 
  }
});
```

---

### Step 8: Frontend Receives Response

**File**: `frontend/src/pages/Auth.jsx`

```javascript
// Line 27-28: Store token and user
localStorage.setItem("token", res.data.token);
localStorage.setItem("user", JSON.stringify(res.data.user));

// Line 31-37: Role-based redirect
if (res.data.user.role === 'admin') {
  window.location.replace("/admin");
} else {
  window.location.replace("/home");
}
```

**What happens**:
- Token stored in localStorage
- User info stored in localStorage
- Redirect based on role (admin → /admin, user → /home)

---

## 📝 TODO OPERATIONS FLOW - File by File

### Creating a Todo

### Step 1: User Enters Todo

**File**: `frontend/src/pages/Home.jsx`

```javascript
// Line 51-75: Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Line 72-75: Create todo
  const res = await API.post("/todos", {
    title,
    description: form.description.trim() || ""
  });
```

---

### Step 2: API Request with Token

**File**: `frontend/src/Api.js`

```javascript
// Line 8-14: Interceptor adds token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");  // Get token from localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;  // Add to header
  }
  return config;
});
```

**What happens**:
- Token retrieved from localStorage
- Added to request header: `Authorization: Bearer TOKEN`
- Request sent to backend

---

### Step 3: Backend Routes Request

**File**: `backend/server.js`

```javascript
// Line 40: Todo routes mounted
app.use('/api/todos', todoRoutes);
```

---

### Step 4: Authentication Middleware

**File**: `backend/routes/todos.js`

```javascript
// Line 4: Import auth middleware
const { authenticateToken } = require('../middleware/auth');

// Line 9: Apply to all routes
router.use(authenticateToken);
```

**File**: `backend/middleware/auth.js`

```javascript
// Line 5-20: Authentication middleware
const authenticateToken = (req, res, next) => {
  // Line 6: Extract token from header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];  // "Bearer TOKEN" → "TOKEN"
  
  // Line 9-11: Check if token exists
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }
  
  // Line 13-19: Verify token
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    // Line 17: Attach user info to request
    req.user = user;  // { userId, email, role }
    next();  // Continue to route handler
  });
};
```

**What happens**:
- Token extracted from `Authorization` header
- Token verified using JWT_SECRET
- If valid, user info (userId, email, role) attached to `req.user`
- Request continues to route handler

---

### Step 5: Create Todo Route Handler

**File**: `backend/routes/todos.js`

```javascript
// Line 50-126: Create todo route
router.post('/', async (req, res) => {
  // Line 60-65: Get userId from authenticated user
  const userId = req.user.userId;  // From JWT token (set by authenticateToken)
  
  const { title, description, completed } = req.body;
  
  // Line 67-70: Validate title
  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Title is required' });
  }
  
  // Line 85-91: Create todo instance
  const todo = new Todo({
    title: title.trim(),
    description: description || '',
    completed: completed || false,
    user: userId  // Link to current user
  });
  
  // Line 94: Save to database
  await todo.save();
```

**What happens**:
- `req.user.userId` comes from JWT token (set by middleware)
- Todo created with `user` field set to current user's ID
- Todo saved to MongoDB

---

### Step 6: Todo Model

**File**: `backend/models/Todo.js`

```javascript
// Line 3-10: Todo schema
const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  completed: { type: Boolean, default: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

**What happens**:
- Todo document saved to MongoDB `todos` collection:
  ```javascript
  {
    _id: ObjectId("..."),
    title: "My Todo",
    description: "Description",
    completed: false,
    user: ObjectId("user_id"),  // References User
    createdAt: Date,
    updatedAt: Date
  }
  ```

---

### Step 7: Return Response

**File**: `backend/routes/todos.js`

```javascript
// Line 126: Send created todo
res.status(201).json(savedTodo);
```

---

### Step 8: Frontend Receives Response

**File**: `frontend/src/pages/Home.jsx`

```javascript
// Line 77: Add todo to state
setTodos([...todos, res.data]);
```

**What happens**:
- Todo added to React state
- UI updates to show new todo

---

## 📖 FETCHING TODOS FLOW - File by File

### Step 1: Component Mounts

**File**: `frontend/src/pages/Home.jsx`

```javascript
// Line 12-15: useEffect runs on mount
useEffect(() => {
  loadTodos();
  loadUser();
}, []);

// Line 29-49: Load todos function
const loadTodos = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/";
    return;
  }
  
  // Line 37: Fetch todos
  const res = await API.get("/todos");
  setTodos(res.data);
};
```

---

### Step 2: API Request with Token

**File**: `frontend/src/Api.js`

```javascript
// Interceptor adds token to request
// GET http://localhost:3001/api/todos
// Headers: Authorization: Bearer TOKEN
```

---

### Step 3: Authentication Middleware

**File**: `backend/middleware/auth.js`

```javascript
// Same as before - verifies token
// Sets req.user = { userId, email, role }
```

---

### Step 4: Get Todos Route Handler

**File**: `backend/routes/todos.js`

```javascript
// Line 20-35: Get all todos route
router.get('/', async (req, res) => {
  // Line 22: Get userId from JWT token
  const userId = req.user.userId;
  
  // Line 25: Query only current user's todos
  const todos = await Todo.find({ user: userId }).sort({ createdAt: 1 });
  
  // Line 30: Return todos
  res.json(todos);
});
```

**What happens**:
- `req.user.userId` from JWT token
- MongoDB query: `Todo.find({ user: userId })`
- Only returns todos where `user` field matches current user's ID
- Other users' todos are NOT returned (privacy)

---

### Step 5: Frontend Receives Todos

**File**: `frontend/src/pages/Home.jsx`

```javascript
// Line 38: Update state with todos
setTodos(res.data);
```

**What happens**:
- Todos array stored in React state
- UI renders todos list

---

## 👑 ADMIN ACCESS FLOW - File by File

### Step 1: Admin Requests All Users

**File**: `frontend/src/pages/Admin.jsx` (or Postman)

```javascript
// GET /api/admin/users
// Headers: Authorization: Bearer ADMIN_TOKEN
```

---

### Step 2: Authentication Middleware

**File**: `backend/middleware/auth.js`

```javascript
// Verifies token
// Sets req.user = { userId, email, role: "admin" }
```

---

### Step 3: Role Check Middleware

**File**: `backend/routes/admin.js`

```javascript
// Line 29-30: Apply middleware
router.use(authenticateToken);  // Must be authenticated
router.use(checkRole('admin')); // Must be admin
```

**File**: `backend/middleware/rbac.js`

```javascript
// Line 1-15: Role check middleware
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Line 3-5: Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Line 7-11: Check if user has required role
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.' 
      });
    }
    
    // Line 13: Continue if role matches
    next();
  };
};
```

**What happens**:
- Checks if `req.user.role === 'admin'`
- If not admin, returns 403 Forbidden
- If admin, continues to route handler

---

### Step 4: Admin Route Handler

**File**: `backend/routes/admin.js`

```javascript
// Line 33-40: Get all users route
router.get('/users', async (req, res) => {
  // Line 35: Get all users (admin only)
  const users = await User.find({}).select('-password');
  // .select('-password') excludes password field
  
  // Line 36: Return all users
  res.json(users);
});
```

**What happens**:
- Query: `User.find({})` - gets ALL users
- `.select('-password')` excludes password field
- Returns all users (not just current user)

---

## 📊 Complete Data Flow Summary

### Signup Flow:
```
Auth.jsx (submit)
  → Api.js (interceptor)
  → server.js (route)
  → routes/auth.js (signup handler)
  → models/User.js (pre-save hook - hash password)
  → MongoDB (save user)
  → routes/auth.js (generate token)
  → Auth.jsx (store token, redirect)
```

### Login Flow:
```
Auth.jsx (submit)
  → Api.js (interceptor)
  → server.js (route)
  → routes/auth.js (login handler)
  → models/User.js (comparePassword method)
  → routes/auth.js (generate token)
  → Auth.jsx (store token, redirect)
```

### Create Todo Flow:
```
Home.jsx (handleSubmit)
  → Api.js (interceptor - add token)
  → server.js (route)
  → routes/todos.js (authenticateToken middleware)
  → middleware/auth.js (verify token, set req.user)
  → routes/todos.js (create handler)
  → models/Todo.js (schema)
  → MongoDB (save todo)
  → Home.jsx (update state)
```

### Fetch Todos Flow:
```
Home.jsx (loadTodos)
  → Api.js (interceptor - add token)
  → server.js (route)
  → routes/todos.js (authenticateToken middleware)
  → middleware/auth.js (verify token, set req.user)
  → routes/todos.js (get handler - filter by userId)
  → MongoDB (query: Todo.find({ user: userId }))
  → Home.jsx (display todos)
```

### Admin Access Flow:
```
Admin.jsx (request)
  → Api.js (interceptor - add admin token)
  → server.js (route)
  → routes/admin.js (authenticateToken)
  → middleware/auth.js (verify token)
  → routes/admin.js (checkRole('admin'))
  → middleware/rbac.js (check role)
  → routes/admin.js (admin handler)
  → MongoDB (query all data)
  → Admin.jsx (display all data)
```

---

## 🔑 Key Points

1. **Password Hashing**: Automatic in `User.js` pre-save hook
2. **Token Generation**: Happens in `routes/auth.js` after successful signup/login
3. **Token Storage**: Frontend stores in `localStorage` (Auth.jsx)
4. **Token Usage**: Automatically added by `Api.js` interceptor
5. **Authentication**: `middleware/auth.js` verifies token on every protected route
6. **Authorization**: `middleware/rbac.js` checks role for admin routes
7. **Data Privacy**: Todos filtered by `userId` from JWT token
8. **Database**: MongoDB stores users and todos with relationships

---

This file-by-file flow shows exactly how data moves through your application! 🚀
