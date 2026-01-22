# Quick Postman Security Tests

## 🔐 Essential Security Tests

### 1. Register Regular User
```
POST http://localhost:3001/api/auth/signup
Content-Type: application/json

{
  "name": "Test User",
  "email": "user@test.com",
  "password": "password123"
}
```
**Save token** → Use as `USER_TOKEN`

---

### 2. Register Admin User
```
POST http://localhost:3001/api/auth/signup
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@test.com",
  "password": "admin123456",
  "employeeId": "ARUN12345"
}
```
**Save token** → Use as `ADMIN_TOKEN`

---

### 3. ✅ Test: User Can Only See Own Todos
```
GET http://localhost:3001/api/todos
Authorization: Bearer USER_TOKEN
```
**Expected**: Only returns todos created by this user

---

### 4. ❌ Test: User Cannot Access Admin Routes
```
GET http://localhost:3001/api/admin/users
Authorization: Bearer USER_TOKEN
```
**Expected**: Status 403 - "Access denied"

---

### 5. ✅ Test: Admin Can Access Admin Routes
```
GET http://localhost:3001/api/admin/users
Authorization: Bearer ADMIN_TOKEN
```
**Expected**: Status 200 - Returns all users

---

### 6. ❌ Test: No Token = Access Denied
```
GET http://localhost:3001/api/todos
(No Authorization header)
```
**Expected**: Status 401 - "Access token required"

---

### 7. ❌ Test: Invalid Token = Access Denied
```
GET http://localhost:3001/api/todos
Authorization: Bearer invalid_token_12345
```
**Expected**: Status 403 - "Invalid or expired token"

---

### 8. ✅ Test: User Creates Todo (Privacy Check)
```
POST http://localhost:3001/api/todos
Authorization: Bearer USER_TOKEN
Content-Type: application/json

{
  "title": "My Private Todo",
  "description": "Only I should see this"
}
```

Then login as different user and try to access this todo → Should fail

---

## 🔍 Privacy Verification Checklist

- [ ] User A's todos are NOT visible to User B
- [ ] User cannot access admin routes
- [ ] Admin can access admin routes
- [ ] Passwords are hashed (check MongoDB)
- [ ] Tokens are required for protected routes
- [ ] Invalid tokens are rejected

---

## 🎯 Critical Security Tests

Run these in order to verify data privacy:

1. **Create User A** → Create todos
2. **Create User B** → Try to access User A's todos → Should FAIL
3. **Login as Admin** → Access admin routes → Should SUCCEED
4. **Login as User** → Access admin routes → Should FAIL

Your data is private if all these tests pass! ✅
