# 📘 API Endpoint Overview

Generated from live routes in the application.

| Method | Path | Access |
|--------|------|--------|
| GET | `/api/vehicle/{vehicle_id}/status` | 🔐 API Key Required |
| GET | `/api/user/{user_id}/link` | 🔐 API Key Required |
| GET | `/api/vehicle/{vehicle_id}` | 🔐 API Key Required |
| GET | `/api/vehicles` | 🔐 API Key Required |
| GET | `/api/user/{user_id}` | 🔐 API Key Required |
| GET | `/api/user/{user_id}/vehicles` | ❓ Unknown |
| GET | `/api/ping` | 🔓 Public |
| GET | `/api/public/user/{user_id}` | ❓ Unknown |
| POST | `/api/register` | ❓ Unknown |
| GET | `/api/public/user/{user_id}` | ❓ Unknown |
| GET | `/api/public/user/{user_id}/apikey` | ❓ Unknown |
| POST | `/api/user/{user_id}/apikey` | 🛠️ Dev Only |
| GET | `/api/token` | 🛠️ Dev Only |
| DELETE | `/api/events` | 👮 Admin Only |
| POST | `/api/webhook/subscribe` | 🛠️ Dev Only |
| GET | `/api/admin/apikeys` | 👮 Admin Only |
| GET | `/api/events` | 👮 Admin Only |
| POST | `/webhook` | 🔓 Public |
| GET | `/` | ❓ Unknown |
