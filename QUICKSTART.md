# Quick Start Guide

## Getting Started (2 Minutes!)

### Step 1: Open the Website
Simply double-click any HTML file or use a local server:

**Option A - Direct File Access:**
- Just open `public/customer/customer_dashboard.html` in your browser

**Option B - Simple HTTP Server:**
```bash
# Using Python
cd public
python -m http.server 8000

# Using Node.js (http-server)
npx http-server public -p 8000

# Using PHP
cd public
php -S localhost:8000
```
Visit: `http://localhost:8000/customer/customer_dashboard.html`

### Step 2: Access the Portals

**Customer Portal:**
- Open `public/customer/customer_dashboard.html`
- Browse menu, add to cart, checkout
- Create account and login (stored in browser's LocalStorage)

**Admin Portal:**
- Open `public/admin/login_admin.html`
- Use admin credentials (if configured)

**Cashier Portal:**
- Open `public/cashier/login_cashier.html`
- Process orders and manage transactions

## How It Works

### LocalStorage-Based System
This is a **pure frontend application** that uses:
- **LocalStorage** for user authentication
- **LocalStorage** for storing products
- **LocalStorage** for managing orders
- **No database or server required!**

### Try It Out

1. **Browse Menu:**
   - Open `public/customer/drinks.html`
   - Click on any drink to customize
   - Add to cart

2. **Create Account:**
   - Click "Create Account" in header
   - Fill in the registration form
   - Login with your credentials

3. **Guest Checkout:**
   - Add items to cart
   - Click checkout
   - Select "Continue as Guest"
   - Complete order without login

4. **View Profile:**
   - Click "Profile" in header
   - Edit your information
   - View order history

## File Locations for Common Tasks

### Add New Product
- **Frontend Display:** `public/customer/drinks.js`
- Add product to `DEFAULT_MENU_ITEMS` array

### Change Header Design
- **CSS:** `assets/css/shared.css`
- **JS:** `assets/js/header.js`

### Update Logo
- Replace: `assets/images/logo.png`

### Add New Portal Page
1. Create new HTML file in `public/customer/` (or admin/cashier)
2. Link to `assets/css/shared.css` and `assets/js/header.js`
3. Add portal-specific CSS/JS files

## Important Paths

All customer portal files are in: `public/customer/`

- Dashboard: `customer_dashboard.html`
- Menu: `drinks.html`
- Profile: `profile.html`
- Register: `register.html`
- Login: `login_customer.html`
- Inquiry: `inquiry.html`

All shared assets are in: `assets/`

- CSS: `assets/css/shared.css`
- JS: `assets/js/header.js`
- Images: `assets/images/`

## Troubleshooting

**Images not loading?**
- Check path is `../../assets/images/`
- Ensure images exist in `assets/images/` folder
- Clear browser cache (Ctrl+Shift+Delete)

**Styles not applied?**
- Check path to `assets/css/shared.css`
- Open browser console (F12) for errors

**Login not working?**
- Clear browser LocalStorage:
  - Open DevTools (F12)
  - Go to Application/Storage tab
  - Clear LocalStorage
  - Refresh page

**Cart not saving?**
- LocalStorage must be enabled in browser
- Check browser settings allow LocalStorage
- Try in incognito/private window

## Browser Compatibility

Works on all modern browsers:
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

## Data Persistence

All data is stored in your browser's LocalStorage:
- **Users:** `jessie_users`
- **Orders:** `jessie_orders`
- **Menu:** `jessie_menu`, `jessieCaneMenu`
- **Authentication:** `isLoggedIn`, `currentUser`

**Note:** Data is specific to each browser and cleared when:
- Browser cache is cleared
- Using incognito/private mode
- Different browser is used

## No Backend Required!

This is a complete **frontend-only** application:
- ✅ No PHP server needed
- ✅ No database setup required
- ✅ No API configuration
- ✅ Works offline after first load
- ✅ Can be deployed to any static hosting

## Deploy to Web

Upload the entire `public/` folder to any web hosting:
- GitHub Pages
- Netlify
- Vercel
- Any static hosting service

Just upload and it works!

## Next Steps

To add backend functionality in the future:
1. Create PHP/Node.js API endpoints
2. Replace LocalStorage calls with API calls
3. Implement database storage
4. Add session management

For now, enjoy the fully functional frontend!