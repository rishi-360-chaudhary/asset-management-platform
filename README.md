# 🏛️ Asset Management and Resource Allocation Platfrom
### Cultural Council, IIT Roorkee

A full-stack web application for managing shared resources and assets across the Cultural Council of IIT Roorkee. The platform
enables efficient inventory tracking, asset booking, approval workflows, and operational analytics.

---

## 📋 TTable of Contents
1. [Tech Stack](#-tech-stack)
2. [Features](#-features)
3. [Project Structure](#-project-structure)
4. [Setup Instructions](#-setup-instructions)
5. [Running the Application](#-running-the-application)
6. [API Overview](#-api-overview)
7. [Database Schema](#-database-schema)
8. [Role-Based Access](#-role-based-access)

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas 
- **ODM:** Mongoose
- **Authentication:** JWT 
- **Password Hashing:** bcryptjs

### Frontend
- **Library:** React.js (Vite)
- **Routing:** React Router DOM
- **HTTP Client:** Axios
- **Charts:** Recharts
- **Notifications:** React Hot Toast

---

## ✨ Features

### User Features
- 🔐 Secure registration and login
- 📦 Browse all available assets with search and category filters
- 📩 Request asset bookings with quantity, purpose and date range
- 📋 Track all personal booking requests and their status
- ⚠️ Overdue notifications for unreturned assets

### Admin Features
- 📊 Analytics dashboard with charts and statistics
- 📦 Full inventory management (Add, Edit, Delete assets)
- ✅ Approve or reject booking requests with reasons
- 📦 Issue assets to users and track returns
- 👥 System-wide booking history and activity feed
- 📈 Most borrowed assets and category breakdown charts

---

## 📁 Project Structure

```
asset-management/
├── backend/
│   ├── config/
│   │   └── db.js                  
│   ├── controllers/
│   │   ├── authController.js      # Register, Login logic
│   │   ├── assetController.js     # Asset CRUD logic
│   │   ├── bookingController.js   # Booking workflow logic
│   │   └── analyticsController.js # Dashboard stats logic
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT verification, role check
│   ├── models/
│   │   ├── User.js                
│   │   ├── Asset.js               
│   │   └── Booking.js             
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── assetRoutes.js
│   │   ├── bookingRoutes.js
│   │   └── analyticsRoutes.js
│   ├── .env                       
│   └── server.js                  
│
└── frontend/
    └── src/
        ├── context/
        │   └── AuthContext.jsx    
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   ├── AdminDashboard.jsx
        │   ├── AdminAssets.jsx
        │   ├── AdminBookings.jsx
        │   ├── UserAssets.jsx
        │   └── UserBookings.jsx
        ├── components/
        │   └── Layout.jsx        
        └── utils/
            └── axios.js           
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 
- MongoDB Atlas account 
- Git

### 1. Clone the repository
```bash
git clone https://github.com/rishi-360-chaudhary/asset-management-platform.git
cd asset-management-platform
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder:
```
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key
```

### 3. Frontend Setup
Open a new terminal:
```bash
cd frontend
npm install
```

---

## ▶️ Running the Application

### Start Backend
```bash
cd backend
npm run dev
```
Backend runs on: http://localhost:5000

### Start Frontend
```bash
cd frontend
npm run dev
```
Frontend runs on: http://localhost:5173

### Create Admin Account
Use Postman or any API client to register an admin:
```
POST http://localhost:5000/api/auth/register
Body (JSON):
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "admin"
}
```
> ⚠️ Admin accounts can only be created via API. The registration page creates regular user accounts only.

---

## 📡 API Overview

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/auth/register | Public | Register new user |
| POST | /api/auth/login | Public | Login and get token |
| GET | /api/assets | Protected | Get all assets |
| POST | /api/assets | Admin | Add new asset |
| PUT | /api/assets/:id | Admin | Update asset |
| DELETE | /api/assets/:id | Admin | Delete asset |
| POST | /api/bookings | Protected | Create booking request |
| GET | /api/bookings | Admin | Get all bookings |
| GET | /api/bookings/my | Protected | Get my bookings |
| PUT | /api/bookings/:id/approve | Admin | Approve booking |
| PUT | /api/bookings/:id/reject | Admin | Reject booking |
| PUT | /api/bookings/:id/issue | Admin | Issue asset |
| PUT | /api/bookings/:id/return | Admin | Mark as returned |
| GET | /api/analytics/dashboard | Admin | Get dashboard stats |

---

## 🗄️ Database Schema

### User
| Field | Type | Description |
|-------|------|-------------|
| name | String | Full name |
| email | String | Unique email |
| password | String | Hashed password (bcrypt) |
| role | String | 'user' or 'admin' |
| createdAt | Date | Auto timestamp |

### Asset
| Field | Type | Description |
|-------|------|-------------|
| name | String | Asset name |
| category | String | Asset category |
| description | String | Asset description |
| totalQuantity | Number | Total units owned |
| availableQuantity | Number | Currently available units |
| status | String | Available / Unavailable |
| addedBy | ObjectId | Reference to Admin User |
| createdAt | Date | Auto timestamp |

### Booking
| Field | Type | Description |
|-------|------|-------------|
| user | ObjectId | Reference to User |
| asset | ObjectId | Reference to Asset |
| quantity | Number | Units requested |
| purpose | String | Reason for booking |
| startDate | Date | Requested from date |
| endDate | Date | Requested to date |
| status | String | pending/approved/rejected/issued/returned |
| rejectionReason | String | Reason if rejected |
| issuedAt | Date | Actual issue timestamp |
| returnedAt | Date | Actual return timestamp |

---

## 🔐 Role-Based Access

| Feature | User | Admin |
|---------|------|-------|
| Browse Assets | ✅ | ✅ |
| Request Booking | ✅ | ✅ |
| View Own Bookings | ✅ | ✅ |
| View All Bookings | ❌ | ✅ |
| Add/Edit/Delete Assets | ❌ | ✅ |
| Approve/Reject Bookings | ❌ | ✅ |
| Issue/Return Assets | ❌ | ✅ |
| Analytics Dashboard | ❌ | ✅ |

---

## Developed By

**Rishi Chaudhary**
Indian Institute of Technology (IIT) Roorkee · 23117116 · 4th Year, Mechanical Engineering

---
