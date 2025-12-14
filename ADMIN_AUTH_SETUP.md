# 🔐 Admin Authentication Setup Guide

## Overview

The admin panel now requires login with email and password. Admins must authenticate before accessing the panel.

---

## How It Works

### 1. Admin Login Page
- URL: `/admin/login`
- Requires email and password
- Uses Supabase Authentication

### 2. Admin Panel
- URL: `/admin`
- Protected route - requires authentication
- Shows logged-in user's email
- Logout button to sign out

### 3. Authentication Flow
```
User visits /admin
  ↓
Not logged in? → Redirect to /admin/login
  ↓
Enter credentials → Supabase Auth
  ↓
Success? → Access admin panel
  ↓
Click Logout → Sign out → Redirect to /admin/login
```

---

## Setup Instructions

### Step 1: Enable Email Auth in Supabase

1. Go to Supabase Dashboard
2. Click **Authentication** → **Providers**
3. Enable **Email** provider
4. Save changes

### Step 2: Create Admin User

**Option A: Using Supabase Dashboard**
1. Go to **Authentication** → **Users**
2. Click **Add User**
3. Enter:
   - Email: `admin@example.com`
   - Password: `your-secure-password`
   - Auto Confirm User: ✅ Yes
4. Click **Create User**

**Option B: Using SQL**
```sql
-- Run in Supabase SQL Editor
-- This creates a user and confirms their email

INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@example.com',
    crypt('your-secure-password', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);
```

### Step 3: Test Login

1. Go to `http://localhost:5173/admin/login`
2. Enter your admin credentials
3. Click **Login**
4. Should redirect to `/admin` panel

---

## Usage

### For Admins:

**Login:**
1. Visit `/admin` or `/admin/login`
2. Enter email and password
3. Click "Login"
4. Access admin panel

**Logout:**
1. Click "Logout" button in admin panel header
2. Redirected to login page
3. Must login again to access panel

### For Users:
- Regular users cannot access `/admin`
- They only see the voting interface at `/`

---

## Security Features

### ✅ Implemented:
- Email/password authentication
- Protected admin routes
- Session management
- Automatic redirect if not logged in
- Logout functionality
- User email display

### 🔒 Best Practices:
- Use strong passwords
- Don't share admin credentials
- Logout when done
- Change password regularly

---

## Troubleshooting

### Issue: "Invalid email or password"
**Solution:**
- Check email is correct
- Check password is correct
- Verify user exists in Supabase Auth
- Check email is confirmed

### Issue: Redirects to login immediately
**Solution:**
- Session expired - login again
- Check Supabase connection
- Verify `.env` file has correct credentials

### Issue: Can't create admin user
**Solution:**
- Enable Email provider in Supabase
- Check SQL syntax if using SQL method
- Use Dashboard method instead

### Issue: Logout doesn't work
**Solution:**
- Check browser console for errors
- Clear browser cache
- Check Supabase connection

---

## Admin User Management

### Create Additional Admins:

**Method 1: Supabase Dashboard**
1. Authentication → Users → Add User
2. Enter email and password
3. Auto-confirm user
4. Save

**Method 2: Invite via Email**
1. Authentication → Users → Invite User
2. Enter email
3. User receives invitation email
4. User sets password via link

### Remove Admin Access:
1. Authentication → Users
2. Find user
3. Click "..." → Delete User

### Reset Admin Password:
1. Authentication → Users
2. Find user
3. Click "..." → Reset Password
4. User receives reset email

---

## Configuration

### Change Login Page URL:
Edit `src/pages/AdminPanel.tsx`:
```typescript
navigate('/your-custom-login-url');
```

### Change Session Duration:
In Supabase Dashboard:
1. Authentication → Settings
2. JWT Expiry: Set duration (default 3600 seconds = 1 hour)

### Require Email Verification:
In Supabase Dashboard:
1. Authentication → Settings
2. Enable "Confirm email"
3. Users must verify email before login

---

## API Reference

### Check Authentication:
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
    // Not logged in
}
```

### Login:
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@example.com',
    password: 'password'
});
```

### Logout:
```typescript
await supabase.auth.signOut();
```

### Get Current User:
```typescript
const { data: { user } } = await supabase.auth.getUser();
console.log(user.email);
```

---

## Files Modified

### New Files:
- `src/pages/AdminLogin.tsx` - Login page component

### Modified Files:
- `src/pages/AdminPanel.tsx` - Added auth check and logout
- `src/main.tsx` - Added login route

---

## Testing Checklist

- [ ] Can access `/admin/login`
- [ ] Can login with valid credentials
- [ ] Invalid credentials show error
- [ ] Redirects to admin panel after login
- [ ] Admin panel shows user email
- [ ] Logout button works
- [ ] After logout, redirects to login
- [ ] Cannot access `/admin` without login
- [ ] Session persists on page refresh

---

## Default Credentials

**⚠️ IMPORTANT: Change these after first login!**

For testing purposes, create an admin user with:
- Email: `admin@assalcommunity.com`
- Password: `Admin@2024!`

**Remember to change the password immediately after first login!**

---

## Production Deployment

### Before Going Live:

1. **Create Strong Admin Passwords**
   - Minimum 12 characters
   - Mix of letters, numbers, symbols
   - No common words

2. **Enable Email Verification**
   - Prevents unauthorized signups
   - Confirms email ownership

3. **Set Up Email Templates**
   - Customize invitation emails
   - Customize password reset emails

4. **Configure SMTP**
   - Use custom email domain
   - Professional appearance

5. **Monitor Auth Logs**
   - Check for failed login attempts
   - Watch for suspicious activity

---

## Support

### Common Questions:

**Q: Can I have multiple admins?**
A: Yes! Create multiple users in Supabase Auth.

**Q: Can admins have different permissions?**
A: Not yet. All admins have full access. (Future enhancement)

**Q: What if I forget my password?**
A: Use "Forgot Password" feature (to be implemented) or reset via Supabase Dashboard.

**Q: Is this secure?**
A: Yes, uses Supabase Auth with industry-standard security.

---

## Summary

✅ **Admin login required**
✅ **Email/password authentication**
✅ **Protected admin routes**
✅ **Logout functionality**
✅ **Session management**
✅ **User email display**

**Status: Fully Implemented!** 🔐
