# Jessie Cane Juice Bar - Web Application

## Project Structure

```
Project-sa-SOFE-main/
├── api/                    # FUTURE: Backend API (empty - ready for backend)
│   ├── auth/              # Authentication endpoints
│   ├── products/          # Product management
│   ├── orders/            # Order management
│   └── users/             # User management
│
├── assets/                 # Shared Assets
│   ├── css/
│   │   └── shared.css     # Shared header and common styles
│   ├── js/
│   │   └── header.js      # Shared header functionality
│   └── images/            # All images (logos, product images, etc.)
│
├── database/               # FUTURE: Database files (empty - ready for backend)
│
├── public/                 # Frontend Files
│   ├── customer/          # Customer Portal
│   │   ├── css/
│   │   ├── js/
│   │   └── *.html
│   ├── admin/             # Admin Portal
│   │   ├── css/
│   │   ├── js/
│   │   └── *.html
│   └── cashier_fairview/  # Cashier Portal (Fairview)
│   └── cashier_sjdm/      # Cashier Portal (SJDM)
│       ├── css/
│       ├── js/
│       └── *.html
│
└── Documentation/
    ├── README.md                          # This file
    └── BACKEND-IMPLEMENTATION-GUIDE.md    # Backend integration guide
```

## Setup Instructions

### Web Server Setup

**Option A: Direct File Access**
Simply open any HTML file in your browser

**Option B: Simple HTTP Server**
```bash
cd public
python -m http.server 8000
```

**Option C: Any Web Server**
Upload the `public/` folder to any static hosting service

## Default Credentials

**Admin Portal:**
- Username: `admin`
- Password: `admin123`
- URL: `public/admin/login_admin.html`

## Features

### Customer Portal
- Browse menu with product images
- Add items to cart
- Guest checkout
- User registration and login
- Profile management
- Order history
- Event booking inquiry

### Admin Portal
- Manage products (CRUD)
- View and manage orders
- Approve/reject orders
- User management

### Cashier Portal
- Process orders
- Update order status
- View pending/completed orders

## Current State

**Frontend Only** - Uses LocalStorage for data storage
- ✅ All features working
- ✅ No backend required
- ✅ No database required
- ✅ Works offline

**Backend Ready** - Folders prepared for future backend integration
- ✅ `api/` folder structure created
- ✅ `database/` folder ready
- ✅ Easy to add backend later

## Backend Integration

**For Backend Developers:** The complete backend implementation guide is available at:
- **BACKEND-IMPLEMENTATION-GUIDE.md** - Complete PHP/MySQL backend guide including:
  - Database schema and setup instructions
  - PHP API endpoints for authentication, products, orders
  - Xendit GCash payment integration guide
  - Google Authentication integration
  - XAMPP configuration
  - Frontend integration examples

The guide provides step-by-step instructions for implementing:
- MySQL database using phpMyAdmin
- RESTful PHP APIs
- Xendit GCash payment gateway integration
- Google OAuth authentication
- XAMPP Apache server setup

## Technologies Used
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Storage:** LocalStorage (current), MySQL (planned)
- **Icons:** Font Awesome
- **Backend:** PHP, MySQL, XAMPP (planned)
- **Payment:** Xendit GCash API (planned)
- **Authentication:** Google OAuth (planned)

## Documentation

- **README.md** - This file
- **BACKEND-IMPLEMENTATION-GUIDE.md** - Complete backend integration guide

## License
This project is for educational purposes.
