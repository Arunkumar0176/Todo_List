# Complete Project Flow Explanation - Interview Ready

## 📋 Project Overview

**Tech Stack**: MERN (MongoDB, Express.js, React, Node.js)  
**Type**: Role-Based Todo List Application  
**Security**: JWT Authentication, Role-Based Access Control (RBAC), Password Hashing

---

## 🏗️ Architecture Overview

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   React     │  HTTP   │   Express    │  Mongoose│   MongoDB   │
│  Frontend   │ ◄─────► │   Backend    │ ◄──────► │  Database   │
│  (Port 3000)│         │  (Port 3001) │         │  (Atlas)     │
└─────────────┘         └──────────────┘         └─────────────┘
```

---

## 🚀 Entry Point: Backend Server (server.js)

### Step 1: Server Initialization

**File**: `backend/server.js`

```javascript
1. Import dependencies (Express, Mongoose, CORS)
2. Import route files (auth, todos, users, admin)
3. Create Express app instance
4. Configure middleware:
   - CORS (Cross-Origin Resource Sharing)
   - express.json() (Parse JSON bodies)
5. Connect to MongoDB
6. Mount route handlers
7. Start server on port 3001
```

**Flow**:
```
server.js starts
  ↓
MongoDB connection established
  ↓
Routes registered:
  - /api/auth → Authentication routes
  - /api/todos → Todo CRUD routes
  - /api/users → User management routes
  - /api/admin → Admin-only routes
  ↓
Server listening on port 3001
```

---

## 👤 User Registration Flow (Signup)

### Complete Flow Diagram:

```
Frontend (React)          Backend (Express)          Database (MongoDB)
     │                           │                           │
     │ 1. User fills form        │                           │
     │    (name, email, pwd)     │                           │
     │                           │                           │
     │ 2. POST /api/auth/signup  │                           │
     ├──────────────────────────►│                           │
     │                           │                           │
     │                           │ 3. Validate input         │
     │                           │    - Check required fields│
     │                           │    - Validate email format│
     │                           │    - Check password length│
     │                           │                           │
     │                           │ 4. Check if user exists   │
     │                           ├──────────────────────────►│
     │                           │    User.findOne({email})  │
     │                           │◄──────────────────────────┤
     │                           │                           │
     │                           │ 5. Determine role:        │
     │                           │    - If employeeId =      │
     │                           │      'ARUN12345' → admin  │
     │                           │    - Otherwise → user     │
     │                           │                           │
     │                           │ 6. Create User document   │
     │                           │    new User({...})        │
     │                           │                           │
     │                           │ 7. Pre-save hook triggers │
     │                           │    - Password hashing     │
     │                           │    (bcrypt.hash)          │
     │                           │                           │
     │                           │ 8. Save to database        │
     │                           ├──────────────────────────►│
     │                           │    user.save()            │
     │                           │◄──────────────────────────┤
     │                           │    User saved with        │
     │                           │    hashed password        │
     │                           │                           │
     │                           │ 9. Generate JWT token     │
     │                           │    jwt.sign({             │
     │                           │      userId, email, role  │
     │                           │    })                     │
     │                           │                           │
     │ 10. Response with token   │                           │
     │◄──────────────────────────┤                           │
     │ {token, user, message}     │                           │
     │                           │                           │
     │ 11. Store token in        │                           │
     │     localStorage          │                           │
     │ 12. Redirect to /home     │                           │
```

### Detailed Code Flow:

**1. Frontend Request** (`frontend/src/pages/Auth.jsx`):
```javascript
const res = await API.post("/auth/signup", {
  name: form.name,
  email: form.email,
  password: form.password,
  employeeId: form.employeeId  // Optional, for admin
});
```

**2. Backend Route Handler** (`backend/routes/auth.js`):
```javascript
router.post('/signup', async (req, res) => {
  // Step 1: Validate input
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Required fields missing' });
  }
  
  // Step 2: Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'User exists' });
  }
  
  // Step 3: Determine role
  const userRole = (employeeId === 'ARUN12345') ? 'admin' : 'user';
  
  // Step 4: Create user
  const user = new User({ name, email, password, role: userRole });
  
  // Step 5: Save (password auto-hashed by pre-save hook)
  await user.save();
  
  // Step 6: Generate JWT token
  const token = jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  // Step 7: Return response
  res.status(201).json({ token, user });
});
```

**3. Password Hashing** (`backend/models/User.js`):
```javascript
userSchema.pre('save', async function() {
  // Automatically called before saving
  if (!this.isModified('password')) return;
  if (this.password.startsWith('$2')) return; // Already hashed
  
  // Hash password with bcrypt (10 rounds)
  this.password = await bcrypt.hash(this.password, 10);
});
```

**4. Database Storage**:
```javascript
// User document saved to MongoDB:
{
  _id: ObjectId("..."),
  name: "John Doe",
  email: "john@example.com",
  password: "$2b$10$hashed_password_here...",  // Hashed!
  role: "user" or "admin",
  __v: 0
}
```

---

## 🔐 User Login Flow

### Complete Flow Diagram:

```
Frontend                 Backend                  Database
    │                       │                         │
    │ 1. POST /auth/login   │                         │
    │    {email, password}  │                         │
    ├──────────────────────►│                         │
    │                       │                         │
    │                       │ 2. Find user by email   │
    │                       ├────────────────────────►│
    │                       │    User.findOne({email})│
    │                       │◄────────────────────────┤
    │                       │    User document        │
    │                       │                         │
    │                       │ 3. Compare password     │
    │                       │    bcrypt.compare(      │
    │                       │      input, stored      │
    │                       │    )                    │
    │                       │                         │
    │                       │ 4. If match:            │
    │                       │    Generate JWT token  │
    │                       │                         │
    │ 5. Response with token│                         │
    │◄──────────────────────┤                         │
    │ {token, user}         │                         │
    │                       │                         │
    │ 6. Store token         │                         │
    │ 7. Redirect to /home    │                         │
```

### Detailed Code Flow:

**1. Frontend Request**:
```javascript
const res = await API.post("/auth/login", {
  email: form.email,
  password: form.password
});
```

**2. Backend Route Handler**:
```javascript
router.post('/login', async (req, res) => {
  // Step 1: Find user
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }
  
  // Step 2: Compare password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }
  
  // Step 3: Generate JWT token
  const token = jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  // Step 4: Return token and user info
  res.json({ token, user });
});
```

**3. Password Comparison** (`backend/models/User.js`):
```javascript
userSchema.methods.comparePassword = async function(candidatePassword) {
  // Compare plain password with hashed password
  return await bcrypt.compare(candidatePassword, this.password);
};
```

---

## 🎭 Role-Based Access Control (RBAC)

### Role Assignment:

**During Signup**:
```javascript
// Regular User
{
  name: "User",
  email: "user@test.com",
  password: "password123",
  // No employeeId
}
→ Role: "user"

// Admin User
{
  name: "Admin",
  email: "admin@test.com",
  password: "admin123",
  employeeId: "ARUN12345"  // Special employee ID
}
→ Role: "admin"
```

### Role in JWT Token:

```javascript
// Token payload contains:
{
  userId: "user_id_here",
  email: "user@example.com",
  role: "user" or "admin"
}
```

### Role-Based Route Protection:

**1. Authentication Middleware** (`backend/middleware/auth.js`):
```javascript
const authenticateToken = (req, res, next) => {
  // Extract token from header
  const token = req.headers['authorization']?.split(' ')[1];
  
  // Verify token
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    
    // Attach user info to request
    req.user = user;  // Contains: {userId, email, role}
    next();
  });
};
```

**2. Role Check Middleware** (`backend/middleware/rbac.js`):
```javascript
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if user has required role
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.' 
      });
    }
    next();
  };
};
```

**3. Route Protection** (`backend/routes/admin.js`):
```javascript
// Admin routes require BOTH authentication AND admin role
router.use(authenticateToken);  // Must be logged in
router.use(checkRole('admin')); // Must be admin

router.get('/users', async (req, res) => {
  // Only admins can access this
  const users = await User.find({}).select('-password');
  res.json(users);
});
```

---

## 📝 Todo List Flow

### Creating a Todo:

```
Frontend                 Backend                  Database
    │                       │                         │
    │ 1. User enters todo   │                         │
    │    title & description│                         │
    │                       │                         │
    │ 2. POST /api/todos    │                         │
    │    Authorization:     │                         │
    │    Bearer TOKEN       │                         │
    ├──────────────────────►│                         │
    │                       │                         │
    │                       │ 3. authenticateToken     │
    │                       │    - Verify JWT         │
    │                       │    - Extract userId     │
    │                       │    - Attach to req.user │
    │                       │                         │
    │                       │ 4. Create Todo:        │
    │                       │    new Todo({          │
    │                       │      title,             │
    │                       │      description,       │
    │                       │      user: req.user.userId  │
    │                       │    })                   │
    │                       │                         │
    │                       │ 5. Save to database     │
    │                       ├────────────────────────►│
    │                       │    todo.save()          │
    │                       │◄────────────────────────┤
    │                       │                         │
    │ 6. Response with todo │                         │
    │◄──────────────────────┤                         │
    │ {_id, title, ...}     │                         │
    │                       │                         │
    │ 7. Display on page     │                         │
```

### Getting Todos (User-Specific):

```javascript
// Backend route
router.get('/', authenticateToken, async (req, res) => {
  // req.user.userId comes from JWT token
  const userId = req.user.userId;
  
  // Only get todos for this specific user
  const todos = await Todo.find({ user: userId });
  
  res.json(todos);
});
```

**Key Point**: Each user only sees their own todos because:
- JWT token contains `userId`
- Query filters: `Todo.find({ user: userId })`
- Users cannot access other users' todos

---

## 🔒 Security Flow

### 1. Password Security:

```
User Input: "password123"
    ↓
Pre-save Hook: bcrypt.hash(password, 10)
    ↓
Hashed: "$2b$10$hashed_string_60_chars..."
    ↓
Stored in MongoDB (NOT plain text!)
```

### 2. Token Security:

```
Login Success
    ↓
JWT Token Generated:
{
  userId: "user_id",
  email: "user@example.com",
  role: "user"
}
    ↓
Token sent to frontend
    ↓
Stored in localStorage
    ↓
Sent in every request:
Authorization: Bearer TOKEN
    ↓
Backend verifies token
    ↓
Extracts user info
    ↓
Attaches to req.user
```

### 3. Data Privacy:

```
User A requests todos
    ↓
Backend extracts userId from token
    ↓
Query: Todo.find({ user: "userA_id" })
    ↓
Returns only User A's todos
    ↓
User B cannot see User A's todos
```

---

## 🎯 Complete Request Flow Example

### Example: User Creates a Todo

**1. Frontend** (`frontend/src/pages/Home.jsx`):
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Get token from localStorage
  const token = localStorage.getItem("token");
  
  // Make API call
  const res = await API.post("/todos", {
    title: form.title,
    description: form.description
  });
  // API interceptor adds: Authorization: Bearer {token}
};
```

**2. API Interceptor** (`frontend/src/Api.js`):
```javascript
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**3. Backend Route** (`backend/routes/todos.js`):
```javascript
router.use(authenticateToken);  // All routes protected

router.post('/', async (req, res) => {
  // req.user.userId comes from JWT token (set by authenticateToken)
  const userId = req.user.userId;
  
  const todo = new Todo({
    title: req.body.title,
    description: req.body.description,
    user: userId  // Link to current user
  });
  
  await todo.save();
  res.json(todo);
});
```

**4. Authentication Middleware** (`backend/middleware/auth.js`):
```javascript
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    
    req.user = user;  // {userId, email, role}
    next();
  });
};
```

---

## 📊 Database Schema

### User Collection:
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String ("user" | "admin")
}
```

### Todo Collection:
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  completed: Boolean,
  user: ObjectId (references User._id),
  createdAt: Date,
  updatedAt: Date
}
```

**Relationship**: Todo.user → User._id (One-to-Many)

---

## 🔄 Complete User Journey

### Regular User Journey:

```
1. User visits website
   ↓
2. Sees Login/Signup page
   ↓
3. Clicks "Sign Up"
   ↓
4. Fills form (name, email, password)
   ↓
5. Submits → POST /api/auth/signup
   ↓
6. Backend:
   - Validates input
   - Checks if user exists
   - Hashes password
   - Saves to MongoDB
   - Generates JWT token
   ↓
7. Frontend receives token
   ↓
8. Stores token in localStorage
   ↓
9. Redirects to /home
   ↓
10. Home page loads
   ↓
11. GET /api/todos (with token)
   ↓
12. Backend:
    - Verifies token
    - Extracts userId
    - Queries: Todo.find({ user: userId })
    ↓
13. Returns user's todos
   ↓
14. Frontend displays todos
   ↓
15. User can create, update, delete todos
    (all linked to their userId)
```

### Admin User Journey:

```
1. Admin signs up with employeeId: "ARUN12345"
   ↓
2. Role set to "admin" during signup
   ↓
3. Admin logs in
   ↓
4. Gets JWT token with role: "admin"
   ↓
5. Can access:
   - /api/todos (own todos)
   - /api/admin/users (all users)
   - /api/admin/todos (all todos)
   - /api/admin/stats (statistics)
   ↓
6. Regular users CANNOT access admin routes
   (403 Forbidden)
```

---

## 🛡️ Security Features

### 1. Password Security:
- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ Passwords never stored in plain text
- ✅ Passwords never returned in API responses

### 2. Authentication:
- ✅ JWT tokens for stateless authentication
- ✅ Tokens expire after 7 days
- ✅ Tokens verified on every protected route

### 3. Authorization:
- ✅ Role-based access control (RBAC)
- ✅ Users can only access their own data
- ✅ Admins have special privileges

### 4. Data Privacy:
- ✅ User-specific data filtering
- ✅ Cross-user access prevention
- ✅ Input validation and sanitization

---

## 🎤 Interview Talking Points

### Architecture Decisions:

1. **Why JWT?**
   - Stateless authentication
   - Scalable (no server-side session storage)
   - Contains user info (userId, role)

2. **Why bcrypt for passwords?**
   - Industry standard
   - Slow hashing prevents brute force
   - Salt included automatically

3. **Why Role-Based Access Control?**
   - Flexible permission system
   - Easy to add new roles
   - Clear separation of concerns

4. **Why User-Specific Todo Filtering?**
   - Data privacy
   - Security (users can't access others' data)
   - Scalable (works with millions of users)

### Key Features:

- ✅ Secure authentication (JWT + bcrypt)
- ✅ Role-based authorization (user/admin)
- ✅ Data privacy (user-specific queries)
- ✅ RESTful API design
- ✅ Error handling and validation
- ✅ CORS enabled for frontend-backend communication

---

## 📈 Scalability Considerations

1. **Database Indexing**: Email field indexed (unique)
2. **Token Expiry**: 7-day expiry reduces security risk
3. **Stateless Auth**: JWT allows horizontal scaling
4. **Query Optimization**: User-specific queries are efficient
5. **Middleware Chain**: Reusable authentication/authorization

---

This flow ensures:
- ✅ Secure user registration and login
- ✅ Role-based access control
- ✅ Data privacy (users see only their data)
- ✅ Admin privileges for management
- ✅ Scalable architecture
