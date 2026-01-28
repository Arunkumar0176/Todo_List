# Project Flow - Interview Summary

## 🎯 Quick Overview

**Project**: Role-Based Todo List Application  
**Stack**: MERN (MongoDB, Express, React, Node.js)  
**Security**: JWT Authentication + Role-Based Access Control

---

## 📍 Entry Point to End Flow

### 1. SERVER STARTUP (Entry Point)

**File**: `backend/server.js`

```
1. Import Express, Mongoose, Routes
2. Create Express app
3. Configure middleware (CORS, JSON parser)
4. Connect to MongoDB
5. Register routes:
   - /api/auth → Authentication
   - /api/todos → Todo operations
   - /api/admin → Admin operations
6. Start server on port 3001
```

---

## 👤 USER REGISTRATION FLOW

### Step-by-Step:

```
1. Frontend: User fills signup form
   ↓
2. POST /api/auth/signup
   Body: {name, email, password, employeeId?}
   ↓
3. Backend validates:
   - Required fields present
   - Email format valid
   - Password length >= 6
   - User doesn't already exist
   ↓
4. Determine role:
   - If employeeId === "ARUN12345" → role = "admin"
   - Otherwise → role = "user"
   ↓
5. Create User document
   ↓
6. Pre-save hook triggers:
   - Password hashed with bcrypt (10 rounds)
   - Hash stored instead of plain password
   ↓
7. Save to MongoDB
   ↓
8. Generate JWT token:
   jwt.sign({
     userId: user._id,
     email: user.email,
     role: user.role
   })
   ↓
9. Return response:
   {token, user: {id, name, email, role}}
   ↓
10. Frontend stores token in localStorage
   ↓
11. Redirect to /home
```

**Key Points**:
- Password automatically hashed before saving
- Role determined during signup (cannot be changed later)
- JWT token contains user info (userId, email, role)

---

## 🔐 USER LOGIN FLOW

### Step-by-Step:

```
1. Frontend: User enters email & password
   ↓
2. POST /api/auth/login
   Body: {email, password}
   ↓
3. Backend finds user:
   User.findOne({ email })
   ↓
4. Compare passwords:
   bcrypt.compare(inputPassword, storedHash)
   ↓
5. If match:
   - Generate JWT token
   - Return {token, user}
   ↓
6. If no match:
   - Return 400 "Invalid credentials"
   ↓
7. Frontend stores token
   ↓
8. Redirect based on role:
   - Admin → /admin
   - User → /home
```

**Security**: 
- Passwords never compared in plain text
- bcrypt.compare() handles hashing comparison
- Failed attempts don't reveal if email exists

---

## 🎭 ROLE-BASED ACCESS CONTROL

### How Roles Work:

**1. Role Assignment (During Signup)**:
```javascript
// Regular User
{name, email, password} → role: "user"

// Admin User  
{name, email, password, employeeId: "ARUN12345"} → role: "admin"
```

**2. Role in JWT Token**:
```javascript
Token payload: {
  userId: "...",
  email: "...",
  role: "user" or "admin"
}
```

**3. Route Protection**:

**User Routes** (`/api/todos`):
```javascript
router.use(authenticateToken);  // Any authenticated user

router.get('/', async (req, res) => {
  // req.user.userId from JWT token
  const todos = await Todo.find({ user: req.user.userId });
  // Only returns current user's todos
});
```

**Admin Routes** (`/api/admin/*`):
```javascript
router.use(authenticateToken);  // Must be logged in
router.use(checkRole('admin')); // Must be admin

router.get('/users', async (req, res) => {
  // Only admins can access
  const users = await User.find({}).select('-password');
  res.json(users);
});
```

**4. Role Check Middleware**:
```javascript
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied' 
      });
    }
    next();
  };
};
```

---

## 📝 TODO LIST FLOW

### Creating a Todo:

```
1. User enters todo (title, description)
   ↓
2. POST /api/todos
   Headers: Authorization: Bearer TOKEN
   ↓
3. authenticateToken middleware:
   - Extracts token from header
   - Verifies JWT
   - Attaches user info to req.user
   ↓
4. Route handler:
   - Gets userId from req.user.userId
   - Creates Todo with user: userId
   - Saves to MongoDB
   ↓
5. Todo linked to user:
   {
     title: "...",
     user: ObjectId("user_id"),
     ...
   }
   ↓
6. Response with created todo
   ↓
7. Frontend displays on page
```

### Getting Todos:

```
1. GET /api/todos
   Headers: Authorization: Bearer TOKEN
   ↓
2. authenticateToken extracts userId
   ↓
3. Query: Todo.find({ user: userId })
   ↓
4. Returns ONLY current user's todos
   ↓
5. Other users' todos are NOT returned
```

**Privacy**: Each user only sees their own todos because:
- JWT token contains userId
- Query filters by userId
- Users cannot access other users' data

---

## 🔒 SECURITY FLOW

### Authentication Flow:

```
Request with Token
    ↓
authenticateToken middleware
    ↓
Extract: Authorization: Bearer TOKEN
    ↓
jwt.verify(token, JWT_SECRET)
    ↓
If valid:
  - Decode token
  - Extract {userId, email, role}
  - Attach to req.user
  - Continue to route handler
    ↓
If invalid:
  - Return 403 Forbidden
```

### Authorization Flow:

```
Request to Admin Route
    ↓
authenticateToken (must pass first)
    ↓
checkRole('admin')
    ↓
Check: req.user.role === 'admin'
    ↓
If admin:
  - Allow access
  - Continue to route handler
    ↓
If not admin:
  - Return 403 Forbidden
```

---

## 🗄️ DATABASE STRUCTURE

### Users Collection:
```javascript
{
  _id: ObjectId("..."),
  name: "John Doe",
  email: "john@example.com",
  password: "$2b$10$hashed...",  // Hashed with bcrypt
  role: "user" or "admin"
}
```

### Todos Collection:
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

**Relationship**: One User → Many Todos

---

## 🎯 COMPLETE REQUEST EXAMPLE

### User Creates Todo:

```
Frontend (React)
  ↓
API.post("/todos", {title, description})
  ↓
API Interceptor adds: Authorization: Bearer TOKEN
  ↓
Backend receives request
  ↓
authenticateToken middleware:
  - Verifies JWT token
  - Extracts userId, role
  - Sets req.user = {userId, email, role}
  ↓
Route handler:
  - Gets userId from req.user.userId
  - Creates Todo({title, description, user: userId})
  - Saves to MongoDB
  ↓
Response: Created todo
  ↓
Frontend displays todo
```

---

## 🛡️ SECURITY FEATURES

1. **Password Security**:
   - ✅ Hashed with bcrypt (10 rounds)
   - ✅ Never stored in plain text
   - ✅ Never returned in API responses

2. **Authentication**:
   - ✅ JWT tokens (stateless)
   - ✅ Token expiry (7 days)
   - ✅ Token verification on every request

3. **Authorization**:
   - ✅ Role-based access control
   - ✅ Users can only access own data
   - ✅ Admin routes protected

4. **Data Privacy**:
   - ✅ User-specific queries
   - ✅ Cross-user access prevented
   - ✅ Input validation

---

## 💡 INTERVIEW TALKING POINTS

### Why This Architecture?

1. **JWT Authentication**:
   - Stateless (no server-side sessions)
   - Scalable (works with load balancers)
   - Contains user info (userId, role)

2. **Role-Based Access**:
   - Flexible permission system
   - Easy to add new roles
   - Clear separation of concerns

3. **User-Specific Data**:
   - Privacy by design
   - Security (users can't access others' data)
   - Efficient queries (indexed by user)

4. **Password Hashing**:
   - Industry standard (bcrypt)
   - Prevents brute force attacks
   - Automatic salt generation

### Key Features:

- ✅ Secure authentication (JWT + bcrypt)
- ✅ Role-based authorization (user/admin)
- ✅ Data privacy (user-specific queries)
- ✅ RESTful API design
- ✅ Error handling and validation
- ✅ CORS enabled

---

## 📊 FLOW SUMMARY

```
ENTRY POINT: server.js
    ↓
MongoDB Connection
    ↓
Routes Registered
    ↓
USER REGISTRATION:
  Input → Validation → Hash Password → Save → Generate Token → Response
    ↓
USER LOGIN:
  Input → Find User → Compare Password → Generate Token → Response
    ↓
TODO OPERATIONS:
  Request → Authenticate → Extract UserId → Query/Modify → Response
    ↓
ADMIN OPERATIONS:
  Request → Authenticate → Check Role → Admin Action → Response
```

---

## 🎤 Interview Answers

### "Explain the registration flow":

"During registration, the user submits their name, email, and password. The backend validates the input, checks if the user already exists, and determines their role based on whether they provide the admin employee ID. The password is automatically hashed using bcrypt before saving to MongoDB. A JWT token is generated containing the user's ID, email, and role, which is returned to the frontend and stored in localStorage for subsequent authenticated requests."

### "How does role-based access work?":

"Roles are assigned during signup - regular users get 'user' role, while those with the admin employee ID get 'admin' role. The role is embedded in the JWT token. When accessing protected routes, middleware first authenticates the token, then checks if the user's role matches the required role. Admin routes use `checkRole('admin')` middleware which returns 403 if the user isn't an admin."

### "How is data privacy ensured?":

"Data privacy is ensured through user-specific queries. When a user requests their todos, the backend extracts their userId from the JWT token and queries only their data using `Todo.find({ user: userId })`. This ensures users can only see and modify their own todos. Additionally, update and delete operations verify the todo belongs to the requesting user before allowing modifications."

---

This flow ensures secure, scalable, and privacy-focused application architecture! 🔒
