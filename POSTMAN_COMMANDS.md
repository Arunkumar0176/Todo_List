# Postman API Commands - Step by Step

## 🔐 Step 1: Login Through Postman

### Login as Regular User
**Method**: `POST`  
**URL**: `http://localhost:3001/api/auth/login`  
**Headers**:
```
Content-Type: application/json
```
**Body** (raw → JSON):
```json
{
  "email": "your_email@example.com",
  "password": "your_password"
}
```

**Response**: You'll get a `token` - **COPY THIS TOKEN!**

Example Response:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123456789",
    "name": "Your Name",
    "email": "your_email@example.com",
    "role": "user"
  }
}
```

---

### Login as Admin
**Method**: `POST`  
**URL**: `http://localhost:3001/api/auth/login`  
**Headers**:
```
Content-Type: application/json
```
**Body** (raw → JSON):
```json
{
  "email": "admin@example.com",
  "password": "admin_password"
}
```

**Response**: You'll get an admin `token` - **COPY THIS TOKEN!**

---

## 📋 Step 2: Check Your Todo List in Postman

### Get All Your Todos
**Method**: `GET`  
**URL**: `http://localhost:3001/api/todos`  
**Headers**:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Replace `YOUR_TOKEN_HERE`** with the token you got from login!

**Response**: List of all your todos
```json
[
  {
    "_id": "todo_id_1",
    "title": "My First Todo",
    "description": "Description here",
    "completed": false,
    "user": "your_user_id",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "_id": "todo_id_2",
    "title": "My Second Todo",
    "description": "Another todo",
    "completed": true,
    "user": "your_user_id",
    "createdAt": "2024-01-02T00:00:00.000Z"
  }
]
```

---

### Create a New Todo
**Method**: `POST`  
**URL**: `http://localhost:3001/api/todos`  
**Headers**:
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```
**Body** (raw → JSON):
```json
{
  "title": "New Todo from Postman",
  "description": "This todo was created via Postman API"
}
```

---

### Update a Todo
**Method**: `PUT`  
**URL**: `http://localhost:3001/api/todos/TODO_ID_HERE`  
**Headers**:
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```
**Body** (raw → JSON):
```json
{
  "title": "Updated Todo Title",
  "description": "Updated description",
  "completed": true
}
```

**Replace `TODO_ID_HERE`** with the actual todo ID from your list!

---

### Delete a Todo
**Method**: `DELETE`  
**URL**: `http://localhost:3001/api/todos/TODO_ID_HERE`  
**Headers**:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 👑 Step 3: Check Admin Access in Postman

### Test 1: Regular User Tries Admin Route (Should FAIL)
**Method**: `GET`  
**URL**: `http://localhost:3001/api/admin/users`  
**Headers**:
```
Authorization: Bearer YOUR_USER_TOKEN
```

**Expected Response**: 
```json
{
  "message": "Access denied. Insufficient permissions."
}
```
**Status**: 403 Forbidden

---

### Test 2: Admin Accesses Admin Route (Should SUCCEED)
**Method**: `GET`  
**URL**: `http://localhost:3001/api/admin/users`  
**Headers**:
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Expected Response**: 
```json
[
  {
    "_id": "user_id_1",
    "name": "User 1",
    "email": "user1@example.com",
    "role": "user"
  },
  {
    "_id": "user_id_2",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
]
```
**Status**: 200 OK

---

### Test 3: Admin Gets All Todos (All Users)
**Method**: `GET`  
**URL**: `http://localhost:3001/api/admin/todos`  
**Headers**:
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Expected Response**: All todos from all users
```json
[
  {
    "_id": "todo_id_1",
    "title": "User 1's Todo",
    "description": "...",
    "completed": false,
    "user": {
      "_id": "user_id_1",
      "name": "User 1",
      "email": "user1@example.com"
    }
  },
  {
    "_id": "todo_id_2",
    "title": "User 2's Todo",
    "description": "...",
    "completed": true,
    "user": {
      "_id": "user_id_2",
      "name": "User 2",
      "email": "user2@example.com"
    }
  }
]
```

---

### Test 4: Admin Gets Statistics
**Method**: `GET`  
**URL**: `http://localhost:3001/api/admin/stats`  
**Headers**:
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Expected Response**:
```json
{
  "totalUsers": 5,
  "totalTodos": 12,
  "completedTodos": 7,
  "pendingTodos": 5
}
```

---

## 📝 Complete Testing Flow

### Scenario: Test Data Privacy

**Step 1**: Login as User A
```
POST http://localhost:3001/api/auth/login
Body: {"email": "usera@test.com", "password": "password123"}
```
Save token → `USER_A_TOKEN`

**Step 2**: User A creates todo
```
POST http://localhost:3001/api/todos
Authorization: Bearer USER_A_TOKEN
Body: {"title": "User A's Todo", "description": "Private"}
```
Save todo ID → `TODO_ID_A`

**Step 3**: Login as User B
```
POST http://localhost:3001/api/auth/login
Body: {"email": "userb@test.com", "password": "password123"}
```
Save token → `USER_B_TOKEN`

**Step 4**: User B tries to get User A's todo (Should FAIL)
```
GET http://localhost:3001/api/todos/TODO_ID_A
Authorization: Bearer USER_B_TOKEN
```
Expected: 404 Not Found (Privacy protected!)

**Step 5**: User B gets own todos (Should SUCCEED)
```
GET http://localhost:3001/api/todos
Authorization: Bearer USER_B_TOKEN
```
Expected: Only User B's todos (not User A's)

---

## 🔍 Quick Reference

### All Available Endpoints:

**Authentication:**
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/test` - Test API (no auth needed)

**User Todos (Requires Auth):**
- `GET /api/todos` - Get your todos
- `POST /api/todos` - Create todo
- `GET /api/todos/:id` - Get specific todo
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo

**Admin Routes (Requires Admin Token):**
- `GET /api/admin/users` - Get all users
- `GET /api/admin/todos` - Get all todos (all users)
- `GET /api/admin/stats` - Get statistics

---

## 💡 Tips for Postman

1. **Save Tokens**: Create environment variables in Postman:
   - `user_token` = Your user token
   - `admin_token` = Your admin token
   - Then use: `Bearer {{user_token}}`

2. **Test Collection**: Import `TodoList_Security_Tests.postman_collection.json`

3. **Check Responses**: 
   - Status 200/201 = Success ✅
   - Status 401 = Not authenticated ❌
   - Status 403 = Access denied ❌
   - Status 404 = Not found ❌

4. **Verify Privacy**: 
   - User A's todos should NOT appear when User B requests todos
   - Only admin can see all users' data

---

## 🎯 Quick Test Commands (Copy-Paste Ready)

### Login:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your_email@example.com","password":"your_password"}'
```

### Get Todos:
```bash
curl -X GET http://localhost:3001/api/todos \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Admin Get All Users:
```bash
curl -X GET http://localhost:3001/api/admin/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Use these commands to test your API security and data privacy! 🔒
