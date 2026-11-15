# Warehouse Management and Barcode Tracking System

A MERN stack web application that tracks warehouse stock using barcodes, shows which racks are free or taken (pressure plate status), and keeps a full history of every stock movement.

## Features
- **Login with roles:** admin and staff (JWT token, passwords hashed with bcrypt)
- **Dashboard:** totals, racks taken, charts (units by type, stock in and out for 7 days) and a low-stock list
- **Products:** add, edit, delete, search, filter by type, export to CSV, printable barcodes
- **Type of goods:** free text (Food, Furniture, Toys, Auto Parts ...) with suggestions
- **Stock In / Stock Out:** scan or type the barcode. Stock can never go below zero. A low-stock warning appears after a move
- **Racks:** each rack has a type, a HIGH or LOW priority and a pressure plate status. A product can only be placed on a free rack of the same type
- **History:** every movement with who did it. Filter by date and type, export to CSV
- **Users page (admin):** add and delete staff accounts

## Tech stack
MongoDB, Express.js, React (Vite), Node.js, Mongoose, JSON Web Tokens, bcryptjs, react-barcode

## How to run
You need Node.js (v18 or newer) and MongoDB running on your computer.

**Backend**
```
cd backend
npm install
copy .env.example .env      (Mac/Linux: cp .env.example .env)
npm run seed                (creates users, racks and sample products)
npm start                   (runs on http://localhost:5000)
```

**Frontend** (in a second terminal)
```
cd frontend
npm install
npm run dev                 (opens on http://localhost:5173)
```

**Logins:** `admin / admin123` and `staff / staff123`

## Project structure
```
backend/
  server.js, seed.js
  models/       Product, Rack, Transaction, User, categories
  middleware/   auth.js (login and admin checks)
  routes/       auth, products, stock, racks, users
frontend/src/
  App.jsx, api.js, constants.js, csv.js, App.css
  components/   Navbar, BarChart
  pages/        Login, Dashboard, Products, StockMovement, History, Racks, Users
```

## Main API routes
| Method and route | Who | Purpose |
|---|---|---|
| POST /api/auth/login | everyone | Login, returns a token |
| GET / POST / PUT / DELETE /api/products | logged in (changes: admin) | Manage products |
| POST /api/stock/in, /api/stock/out | logged in | Stock In and Out |
| GET /api/stock/history | logged in | History, filters: from, to, type |
| GET / POST / PUT / DELETE /api/racks | logged in (changes: admin) | Manage racks |
| PUT /api/racks/:id/occupied | logged in | Press or release the plate (simulation) |
| POST /api/racks/sensor | sensor key | For real sensor hardware (Arduino / ESP32) |
| GET / POST / DELETE /api/users | admin | Manage users |

## Pressure plate sensors
The demo uses a **Simulate plate** button. A real sensor board can send:
```
POST /api/racks/sensor
Header: x-sensor-key: <SENSOR_KEY from .env>
Body:   { "code": "A-01", "occupied": true }
```

## Future scope
Camera barcode scanning, multiple warehouses, purchase and sales orders, automatic rack suggestion by priority, email alerts, atomic stock updates for simultaneous users.
