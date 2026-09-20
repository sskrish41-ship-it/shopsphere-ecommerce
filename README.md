# ShopSphere - Complete Production-Style E-Commerce Platform 🇮🇳

ShopSphere is a full-stack, production-style e-commerce platform built with **React (Vite + Tailwind CSS)** on the frontend and **Python Flask (SQLAlchemy REST API)** on the backend with **SQLite** database and **JWT / Google OAuth 2.0 authentication**.

---

## 🌟 Key Features

- **Indian Rupee (₹ INR) Standard**: Entire application formatted exclusively in Indian Rupees (INR) using `Intl.NumberFormat('en-IN')` (`₹499`, `₹1,299`, `₹24,999`, `₹1,89,999`). 18% GST calculation and INR shipping rules.
- **Real Google OAuth 2.0 Sign-In**: Integrated Google authentication button on Login and Register pages (`@react-oauth/google`). Backend verifies Google ID tokens via Google API (`POST /api/auth/google`), creating or logging in users into the database automatically.
- **Real Drag & Drop Product Image Uploads**: Admin Product Management includes a drag-and-drop file upload zone. Backend validates MIME types (`image/jpeg`, `image/png`, `image/webp`), file extensions, and file sizes (< 5 MB), stores unique UUID files in `backend/uploads/products/`, and serves them statically.
- **Product Gallery & Primary Image Selector**: Admin interface allows ordering product images, selecting primary showcase image with a star toggle, and removing images. Newly created or updated products render immediately on the public storefront catalog.
- **Branding & Modern UI**: Dark & Light mode theme toggle, sleek glassmorphism, responsive navigation with mega menu, live search modal with instant suggestions.
- **Product Showcase**: Multi-angle image zoom gallery, video embeds, size & color variants, dynamic stock status bar, filterable shop page (categories, brands, price range slider, star rating, flash deals, stock availability), and side-by-side product comparison table.
- **Cart & Multi-Step Checkout**: Cart quantity adjustment, stock limit enforcement, backend-validated coupon system (`WELCOME10`, `FLASHSALE20`, `SAVEMORE50`), address book manager with India state/pincode fields, and mock payment options (UPI Instant Pay, Credit/Debit card, Net banking, Cash on Delivery).
- **Order Management & Tracking**: Real-time order tracking stepper timeline (`Pending` → `Confirmed` → `Processing` → `Packed` → `Shipped` → `Out for delivery` → `Delivered`), printable invoice generator in INR, and customer return request portal.
- **User Accounts & Auth**: Secure JWT-based authentication, Werkzeug password hashing, profile management, saved shipping addresses, order history, wishlist, and notification alerts.
- **Administrator Panel**: Interactive Recharts analytics dashboard (revenue over time in ₹, orders by category, top products), low-stock warning alerts, and full CRUD for products, orders, categories, brands, coupons, customer account toggling, and review moderation.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS v4
- **Authentication**: `@react-oauth/google`
- **Icons**: Lucide React
- **Charts**: Recharts
- **Router**: React Router DOM v6
- **HTTP Client**: Axios

### Backend
- **Framework**: Python Flask
- **ORM**: Flask-SQLAlchemy
- **Authentication**: Flask-JWT-Extended + Google OAuth Token Verification + Werkzeug Password Hashing
- **CORS**: Flask-CORS
- **File Uploads**: Local storage under `backend/uploads/products/` with UUID filename generation
- **Database**: SQLite (SQLAlchemy models designed for seamless migration to PostgreSQL/MySQL)

---

## 🔐 Google Cloud Console OAuth 2.0 Setup Guide

To enable live Google Sign-In on your local development environment:

1. **Go to Google Cloud Console**:
   Navigate to [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials).

2. **Create OAuth 2.0 Client ID**:
   - Click **Create Credentials** → **OAuth client ID**.
   - Select **Web application** as Application type.
   - Name your client (e.g., `ShopSphere Local`).

3. **Configure Authorized Origins & Redirect URIs**:
   - **Authorized JavaScript origins**: `http://localhost:5173` and `http://127.0.0.1:5173`
   - **Authorized redirect URIs**: `http://localhost:5173` and `http://127.0.0.1:5173`

4. **Copy Client ID to Environment Files**:
   - In `frontend/.env`:
     ```env
     VITE_API_BASE_URL=http://127.0.0.1:5000/api
     VITE_GOOGLE_CLIENT_ID=1083428935612-sampleclientid.apps.googleusercontent.com
     ```
   - In `backend/.env`:
     ```env
     GOOGLE_CLIENT_ID=1083428935612-sampleclientid.apps.googleusercontent.com
     ```

---

## 📸 Drag & Drop Image Upload Specifications

- **Upload Endpoint**: `POST /api/admin/upload-image` (Requires Admin JWT Token)
- **Allowed Formats**: `.png`, `.jpg`, `.jpeg`, `.webp`
- **Allowed MIME Types**: `image/jpeg`, `image/png`, `image/webp`
- **Max File Size**: `5 MB` per image
- **File Storage**: `backend/uploads/products/<uuid4_hex>.<extension>`
- **Public URL**: `http://127.0.0.1:5000/uploads/products/<filename>`

---

## 🚀 Quick Start Instructions

### 1. Backend Setup & Database Seeding

Open a terminal in the `backend/` directory:

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Run seed script (creates shopsphere.db with realistic INR dataset)
python seed.py

# Start Flask Backend REST API (Runs on http://127.0.0.1:5000)
python run.py
```

### 2. Frontend Setup & Launch

Open a second terminal in the `frontend/` directory:

```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite Development Server (Runs on http://localhost:5173)
npm run dev
```

---

## 🔑 Demo Login Credentials

### Administrator Account
- **Email**: `admin@shopsphere.com`
- **Password**: `Admin@123`
- *Access*: Admin Dashboard (`/admin`), Real Image Uploads, Product Management, Order Status Updates, Customer Accounts, Coupons Manager.

### Customer Account
- **Email**: `user@shopsphere.com`
- **Password**: `User@123`
- *Access*: Personal Profile (`/profile`), Order History & Tracking, Saved Addresses, Wishlist, Checkout.

---

## 🎟️ Active Demo Coupon Codes (INR)

- `WELCOME10`: 10% OFF on orders over ₹1,499
- `FLASHSALE20`: 20% OFF on orders over ₹2,999
- `SAVEMORE50`: ₹500 Flat Discount on orders over ₹9,999

---

## 📡 REST API Documentation Summary

| Endpoint | Method | Description | Auth Required |
| --- | --- | --- | --- |
| `/api/auth/register` | `POST` | Register new user account | No |
| `/api/auth/login` | `POST` | Authenticate user & return JWT token | No |
| `/api/auth/google` | `POST` | Verify Google OAuth token & login/register | No |
| `/api/auth/me` | `GET` | Fetch current user profile | Yes |
| `/api/products` | `GET` | Filterable & paginated product catalog | No |
| `/api/products/:id` | `GET` | Product details with variants & reviews | No |
| `/api/products/suggestions` | `GET` | Live autocomplete search suggestions | No |
| `/api/cart` | `GET` / `POST` / `DELETE` | Shopping cart operations & stock check | Yes |
| `/api/wishlist/toggle` | `POST` | Toggle item in user wishlist | Yes |
| `/api/coupons/validate` | `POST` | Validate coupon code & subtotal | No |
| `/api/orders` | `POST` / `GET` | Create order & view order history | Yes |
| `/api/orders/:id/track` | `GET` | Track order timeline status | Yes |
| `/api/orders/:id/return` | `POST` | Submit return request | Yes |
| `/api/admin/dashboard` | `GET` | Analytics overview & chart metrics | Admin |
| `/api/admin/upload-image` | `POST` | Drag & drop product image file upload | Admin |
| `/api/admin/products` | `GET` / `POST` / `PUT` / `DELETE` | Admin product management | Admin |
| `/api/admin/orders/:id/status` | `PUT` | Update order tracking status | Admin |
