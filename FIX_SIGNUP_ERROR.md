# Fix "Server Error" During Signup

## What I Fixed

1. **Enhanced error logging** - Shows exactly where the error occurs
2. **Better error messages** - Returns specific error details
3. **JWT token error handling** - Catches token generation errors
4. **User save error handling** - Catches database save errors
5. **MongoDB error detection** - Handles database connection errors

## How to Debug

### 1. Restart Backend
```bash
cd backend
npm start
```

### 2. Try Signing Up

### 3. Check Backend Console

You should see one of these:

**If Working:**
```
📝 ========== SIGNUP ATTEMPT ==========
📥 Request body: ...
🔍 Checking if user exists...
✅ Email is available
📝 Creating user document...
💾 Saving user to database...
✅ User saved successfully
🔑 Generating JWT token...
✅ Token generated
========== SIGNUP SUCCESS ==========
```

**If Error:**
```
❌ ========== SIGNUP ERROR ==========
❌ Error message: [exact error]
❌ Error name: [error type]
❌ Error stack: [full details]
=====================================
```

## Common Errors

### "JWT_SECRET is not defined"
**Fix:** Check `backend/middleware/auth.js` - JWT_SECRET should be exported

### "Password hashing error"
**Fix:** 
- Check if bcryptjs is installed: `npm list bcryptjs`
- If not: `npm install bcryptjs`

### "Database not connected"
**Fix:**
- Check MongoDB connection in `server.js`
- Verify MongoDB is running
- Check connection string

### "ValidationError"
**Fix:** Check the specific field mentioned in the error

### "MongoServerError"
**Fix:** 
- Check MongoDB connection
- Verify database permissions
- Check if cluster is accessible

## What to Do

1. **Restart backend** - `cd backend && npm start`
2. **Try signup** - Enter name, email, password
3. **Check backend console** - Look for error message
4. **Share the error** - Copy the complete error from console

The enhanced logging will show exactly what's failing!
