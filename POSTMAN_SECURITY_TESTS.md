# Postman Security & Privacy Testing Guide

## 🔐 Complete Security Test Collection for Postman

### Prerequisites
1. **Start Backend**: `cd backend && npm start`
2. **Base URL**: `http://localhost:3001/api`
3. **Save tokens** from responses for subsequent requests

---

## 📋 Test 1: User Registration (Regular User)

**Method**: `POST`  
**URL**: `http://localhost:3001/api/auth/signup`  
**Headers**:
```
Content-Type: application/json
```
**Body** (raw JSON):
```json
{
  "name": "Regular User",
  "email": "user@test.com",
  "password": "password123"
}
```

**Expected**: Status 201, token received, role: "user"

**Save**: Copy the `token` from response → Use as `USER_TOKEN`

---

## 📋 Test 2: Admin Registration

**Method**: `POST`  
**URL**: `http://localhost:3001/api/auth/signup`  
**Headers**:
```
Content-Type: application/json
```
**Body** (raw JSON):
```json
{
  "name": "Admin User",
  "email": "admin@test.com",
  "password": "admin123456",
  "employeeId": "ARUN12345"
}
```

**Expected**: Status 201, token received, role: "admin"

**Save**: Copy the `token` from response → Use as `ADMIN_TOKEN`

---

## 🔒 SECURITY TEST 1: Data Privacy - User Can Only See Own Todos

### Test 1.1: User Creates Todo
**Method**: `POST`  
**URL**: `http://localhost:3001/api/todos`  
**Headers**:
```
Content-Type: application/json
Authorization: Bearer YOUR_USER_TOKEN
```
**Body**:
```json
{
  "title": "User's Private Todo",
  "description": "This should only be visible to this user"
}
```

**Expected**: Status 201, todo created

### Test 1.2: User Gets Own Todos
**Method**: `GET`  
**URL**: `http://localhost:3001/api/todos`  
**Headers**:
```
Authorization: Bearer YOUR_USER_TOKEN
```

**Expected**: 
- ✅ Status 200
- ✅ Only returns todos created by this user
- ✅ Does NOT return other users' todos

### Test 1.3: Admin Tries to Access User's Todos (Should See All)
**Method**: `GET`  
**URL**: `http://localhost:3001/api/todos`  
**Headers**:
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Expected**: 
- ✅ Status 200
- ✅ Returns only admin's own todos (if admin created any)
- ✅ Does NOT return other users' todos (unless admin route is used)

---

## 🔒 SECURITY TEST 2: Admin Access Control

### Test 2.1: Regular User Tries Admin Route (Should Fail)
**Method**: `GET`  
**URL**: `http://localhost:3001/api/admin/users`  
**Headers**:
```
Authorization: Bearer YOUR_USER_TOKEN
```

**Expected**: 
- ❌ Status 403 (Forbidden)
- ❌ Message: "Access denied. Insufficient permissions."

### Test 2.2: Admin Accesses Admin Route (Should Succeed)
**Method**: `GET`  
**URL**: `http://localhost:3001/api/admin/users`  
**Headers**:
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Expected**: 
- ✅ Status 200
- ✅ Returns all users (without passwords)

### Test 2.3: No Token - Admin Route (Should Fail)
**Method**: `GET`  
**URL**: `http://localhost:3001/api/admin/users`  
**Headers**: (No Authorization header)

**Expected**: 
- ❌ Status 401
- ❌ Message: "Access token required"

---

## 🔒 SECURITY TEST 3: Token Manipulation Tests

### Test 3.1: Invalid Token Format
**Method**: `GET`  
**URL**: `http://localhost:3001/api/todos`  
**Headers**:
```
Authorization: Bearer invalid_token_here
```

**Expected**: 
- ❌ Status 403
- ❌ Message: "Invalid or expired token"

### Test 3.2: Modified Token (Tampering)
**Method**: `GET`  
**URL**: `http://localhost:3001/api/todos`  
**Headers**:
```
Authorization: Bearer YOUR_USER_TOKEN_BUT_MODIFIED
```

**Expected**: 
- ❌ Status 403
- ❌ Message: "Invalid or expired token"

### Test 3.3: Expired Token (If you have expiry logic)
**Method**: `GET`  
**URL**: `http://localhost:3001/api/todos`  
**Headers**:
```
Authorization: Bearer EXPIRED_TOKEN
```

**Expected**: 
- ❌ Status 403
- ❌ Message: "Invalid or expired token"

---

## 🔒 SECURITY TEST 4: Cross-User Data Access Prevention

### Test 4.1: User A Creates Todo
**Method**: `POST`  
**URL**: `http://localhost:3001/api/todos`  
**Headers**:
```
Authorization: Bearer USER_A_TOKEN
```
**Body**:
```json
{
  "title": "User A's Secret Todo",
  "description": "Only User A should see this"
}
```

**Save**: Copy the `_id` from response → Use as `TODO_ID_A`

### Test 4.2: User B Tries to Access User A's Todo (Should Fail)
**Method**: `GET`  
**URL**: `http://localhost:3001/api/todos/TODO_ID_A`  
**Headers**:
```
Authorization: Bearer USER_B_TOKEN
```

**Expected**: 
- ❌ Status 404 or 403
- ❌ Should NOT return User A's todo

### Test 4.3: User B Tries to Update User A's Todo (Should Fail)
**Method**: `PUT`  
**URL**: `http://localhost:3001/api/todos/TODO_ID_A`  
**Headers**:
```
Authorization: Bearer USER_B_TOKEN
```
**Body**:
```json
{
  "title": "Hacked by User B",
  "completed": true
}
```

**Expected**: 
- ❌ Status 404 or 403
- ❌ Should NOT allow User B to modify User A's todo

### Test 4.4: User B Tries to Delete User A's Todo (Should Fail)
**Method**: `DELETE`  
**URL**: `http://localhost:3001/api/todos/TODO_ID_A`  
**Headers**:
```
Authorization: Bearer USER_B_TOKEN
```

**Expected**: 
- ❌ Status 404 or 403
- ❌ Should NOT allow User B to delete User A's todo

---

## 🔒 SECURITY TEST 5: Admin Privilege Tests

### Test 5.1: Admin Gets All Users
**Method**: `GET`  
**URL**: `http://localhost:3001/api/admin/users`  
**Headers**:
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Expected**: 
- ✅ Status 200
- ✅ Returns all users
- ✅ Passwords should NOT be included

### Test 5.2: Admin Gets All Todos
**Method**: `GET`  
**URL**: `http://localhost:3001/api/admin/todos`  
**Headers**:
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Expected**: 
- ✅ Status 200
- ✅ Returns all todos from all users
- ✅ Includes user information

### Test 5.3: Admin Gets Statistics
**Method**: `GET`  
**URL**: `http://localhost:3001/api/admin/stats`  
**Headers**:
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Expected**: 
- ✅ Status 200
- ✅ Returns statistics about users and todos

---

## 🔒 SECURITY TEST 6: Input Validation & SQL Injection Prevention

### Test 6.1: XSS Attempt in Todo Title
**Method**: `POST`  
**URL**: `http://localhost:3001/api/todos`  
**Headers**:
```
Authorization: Bearer YOUR_USER_TOKEN
```
**Body**:
```json
{
  "title": "<script>alert('XSS')</script>",
  "description": "Test XSS"
}
```

**Expected**: 
- ✅ Should save as plain text (not execute script)
- ✅ Frontend should escape HTML

### Test 6.2: SQL Injection Attempt
**Method**: `POST`  
**URL**: `http://localhost:3001/api/todos`  
**Headers**:
```
Authorization: Bearer YOUR_USER_TOKEN
```
**Body**:
```json
{
  "title": "'; DROP TABLE todos; --",
  "description": "SQL injection test"
}
```

**Expected**: 
- ✅ Should be treated as plain text
- ✅ MongoDB should handle safely (no SQL injection possible)

### Test 6.3: NoSQL Injection Attempt
**Method**: `POST`  
**URL**: `http://localhost:3001/api/auth/login`  
**Body**:
```json
{
  "email": {"$ne": null},
  "password": {"$ne": null}
}
```

**Expected**: 
- ❌ Should fail validation
- ❌ Should NOT bypass authentication

---

## 🔒 SECURITY TEST 7: Authentication Bypass Tests

### Test 7.1: Access Protected Route Without Token
**Method**: `GET`  
**URL**: `http://localhost:3001/api/todos`  
**Headers**: (No Authorization header)

**Expected**: 
- ❌ Status 401
- ❌ Message: "Access token required"

### Test 7.2: Access Protected Route With Empty Token
**Method**: `GET`  
**URL**: `http://localhost:3001/api/todos`  
**Headers**:
```
Authorization: Bearer 
```

**Expected**: 
- ❌ Status 403
- ❌ Should reject empty token

### Test 7.3: Access Protected Route With Wrong Format
**Method**: `GET`  
**URL**: `http://localhost:3001/api/todos`  
**Headers**:
```
Authorization: YOUR_USER_TOKEN
```

**Expected**: 
- ❌ Status 401 or 403
- ❌ Should require "Bearer " prefix

---

## 🔒 SECURITY TEST 8: Role Escalation Prevention

### Test 8.1: User Tries to Change Own Role (Should Fail)
**Method**: `PUT`  
**URL**: `http://localhost:3001/api/users/USER_ID`  
**Headers**:
```
Authorization: Bearer YOUR_USER_TOKEN
```
**Body**:
```json
{
  "role": "admin"
}
```

**Expected**: 
- ❌ Should NOT allow role change
- ❌ Role should only be set during signup

### Test 8.2: User Tries Admin Employee ID Verification
**Method**: `POST`  
**URL**: `http://localhost:3001/api/admin/verify`  
**Body**:
```json
{
  "employeeId": "ARUN12345"
}
```

**Expected**: 
- ✅ Status 200 (verification only, doesn't grant access)
- ✅ But user still needs to signup with employeeId to become admin

---

## 🔒 SECURITY TEST 9: Password Security

### Test 9.1: Check Password is Hashed in Database
After signup, check MongoDB directly:
- Password should start with `$2a$` or `$2b$`
- Password should be ~60 characters long
- Password should NOT be plain text

### Test 9.2: Login with Wrong Password
**Method**: `POST`  
**URL**: `http://localhost:3001/api/auth/login`  
**Body**:
```json
{
  "email": "user@test.com",
  "password": "wrongpassword"
}
```

**Expected**: 
- ❌ Status 400
- ❌ Message: "Invalid credentials"

### Test 9.3: Login with Correct Password
**Method**: `POST`  
**URL**: `http://localhost:3001/api/auth/login`  
**Body**:
```json
{
  "email": "user@test.com",
  "password": "password123"
}
```

**Expected**: 
- ✅ Status 200
- ✅ Token received

---

## 🔒 SECURITY TEST 10: Rate Limiting & Brute Force Prevention

### Test 10.1: Multiple Failed Login Attempts
**Method**: `POST`  
**URL**: `http://localhost:3001/api/auth/login`  
**Body**:
```json
{
  "email": "user@test.com",
  "password": "wrong1"
}
```

Repeat 10 times with different wrong passwords.

**Expected**: 
- ⚠️ Should handle gracefully
- ⚠️ Consider implementing rate limiting

---

## 📊 Security Checklist

### ✅ Data Privacy
- [ ] Users can only see their own todos
- [ ] Users cannot access other users' todos
- [ ] Users cannot modify other users' todos
- [ ] Users cannot delete other users' todos
- [ ] Passwords are hashed in database
- [ ] Passwords are not returned in API responses

### ✅ Authorization
- [ ] Regular users cannot access admin routes
- [ ] Admin can access admin routes
- [ ] Token is required for protected routes
- [ ] Invalid tokens are rejected
- [ ] Role-based access control works

### ✅ Authentication
- [ ] Login requires valid credentials
- [ ] Signup creates user with correct role
- [ ] Tokens are properly validated
- [ ] Expired tokens are rejected

### ✅ Input Validation
- [ ] XSS attempts are handled safely
- [ ] SQL injection attempts fail
- [ ] NoSQL injection attempts fail
- [ ] Invalid input is rejected

---

## 🚨 Common Security Issues to Check

1. **Token in URL**: Never put tokens in URL parameters
2. **Password in Response**: Never return passwords in API responses
3. **User ID Exposure**: Don't expose sensitive user IDs unnecessarily
4. **CORS Configuration**: Ensure CORS is properly configured
5. **Error Messages**: Don't reveal sensitive info in error messages

---

## 📝 Postman Collection Setup

### Create Environment Variables:
1. In Postman, create a new Environment
2. Add variables:
   - `base_url`: `http://localhost:3001/api`
   - `user_token`: (will be set from signup response)
   - `admin_token`: (will be set from admin signup response)
   - `user_id`: (will be set from signup response)
   - `todo_id`: (will be set from todo creation)

### Use Variables in Requests:
- URL: `{{base_url}}/auth/signup`
- Header: `Authorization: Bearer {{user_token}}`

---

## 🎯 Quick Test Summary

**Critical Tests**:
1. ✅ User can only see own todos
2. ✅ User cannot access admin routes
3. ✅ Admin can access admin routes
4. ✅ Invalid tokens are rejected
5. ✅ Passwords are hashed
6. ✅ Cross-user data access is prevented

Run these tests to verify your website's data privacy and security!
