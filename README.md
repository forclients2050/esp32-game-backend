# ESP32 Game Backend

A production-ready **Node.js + Express** backend for ESP32 game management, with **MongoDB Atlas** integration, JWT authentication, file uploads, and full CRUD operations.

## Project Structure

```
src/
├── config/
│   ├── database.js       # MongoDB connection
│   └── constants.js      # HTTP status codes, enums
├── controllers/
│   ├── authController.js
│   ├── gameController.js
│   ├── deviceController.js
│   └── userController.js
├── models/
│   ├── User.js
│   ├── Game.js
│   └── Device.js
├── routes/
│   ├── authRoutes.js
│   ├── gameRoutes.js
│   ├── deviceRoutes.js
│   └── userRoutes.js
├── middleware/
│   ├── auth.js           # JWT verification
│   ├── errorHandler.js   # Global error handler
│   └── upload.js         # Multer .lua file upload
├── utils/
│   ├── jwt.js            # Token generation/verification
│   └── validation.js     # Joi input validation schemas
├── app.js
└── server.js

uploads/                  # Stores uploaded .lua game files
.env.example
package.json
```

## Getting Started

### Prerequisites
- Node.js >= 16
- MongoDB Atlas account (or local MongoDB)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/forclients2050/esp32-game-backend.git
cd esp32-game-backend

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env and set your MONGODB_URI and JWT_SECRET

# 4. Start the server
npm start

# Or for development with auto-restart
npm run dev
```

### Environment Variables

| Variable      | Description                              | Example                                         |
|---------------|------------------------------------------|-------------------------------------------------|
| `PORT`        | Server port                              | `5000`                                          |
| `MONGODB_URI` | MongoDB connection string                | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET`  | Secret key for signing JWTs             | `your_strong_secret_here`                       |
| `JWT_EXPIRE`  | JWT expiry duration                      | `7d`                                            |
| `NODE_ENV`    | Environment (`development`/`production`) | `development`                                   |

---

## API Endpoints

### Auth

| Method | Endpoint                    | Access  | Description          |
|--------|-----------------------------|---------|----------------------|
| POST   | `/api/auth/signup`          | Public  | Register a new user  |
| POST   | `/api/auth/login`           | Public  | Login user           |
| POST   | `/api/auth/refresh-token`   | Private | Refresh JWT token    |

**Signup body:**
```json
{ "name": "John Doe", "email": "john@example.com", "password": "secret123" }
```

**Login body:**
```json
{ "email": "john@example.com", "password": "secret123" }
```

---

### Games

> All game routes require `Authorization: Bearer <token>` header.

| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| POST   | `/api/games/upload`             | Upload a `.lua` game file (multipart/form-data: `name`, `description`, `file`) |
| GET    | `/api/games`                    | List all games (supports `?page=1&limit=10`) |
| GET    | `/api/games/:gameId`            | Get game details         |
| GET    | `/api/games/:gameId/download`   | Download game file       |
| DELETE | `/api/games/:gameId`            | Delete game + file       |

---

### Devices

> All device routes require `Authorization: Bearer <token>` header.

| Method | Endpoint                          | Description              |
|--------|-----------------------------------|--------------------------|
| POST   | `/api/devices`                    | Add a new ESP32 device   |
| GET    | `/api/devices`                    | List all devices         |
| GET    | `/api/devices/:deviceId`          | Get device details       |
| PUT    | `/api/devices/:deviceId/status`   | Update device status     |
| DELETE | `/api/devices/:deviceId`          | Delete device            |

**Add device body:**
```json
{ "name": "My ESP32", "macAddress": "AA:BB:CC:DD:EE:FF", "ipAddress": "192.168.1.100" }
```

**Update status body:**
```json
{ "status": "connected" }
```
Status values: `connected`, `disconnected`, `error`

---

### Users

> All user routes require `Authorization: Bearer <token>` header.

| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| GET    | `/api/users/profile`            | Get user profile         |
| PUT    | `/api/users/profile`            | Update name/email        |
| PUT    | `/api/users/change-password`    | Change password          |

**Change password body:**
```json
{ "oldPassword": "old123", "newPassword": "new456" }
```

---

## Features

- ✅ JWT authentication with token refresh
- ✅ Password hashing with bcrypt
- ✅ `.lua` file upload with Multer (5 MB limit)
- ✅ Pagination for game listings
- ✅ Input validation with Joi
- ✅ Global error handling middleware
- ✅ CORS enabled
- ✅ MongoDB with Mongoose ODM
- ✅ Device status tracking with last connection timestamp

## Contributing

Contributions are welcome! Please submit a pull request or raise an issue for discussion.

## License

This project is licensed under the MIT License.