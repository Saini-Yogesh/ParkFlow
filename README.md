# ParkNova 🚗💨

ParkNova is a comprehensive, enterprise-grade Parking Management System designed to handle multiple parking locations, diverse vehicle categories, dynamic pricing rules, and real-time analytics. It provides tailored dashboards for Enterprise Administrators, Location Managers, and On-the-ground Workers.

![ParkNova Banner](https://via.placeholder.com/1200x400?text=ParkNova+-+Enterprise+Parking+Management)

## 🌟 Key Features

- **Enterprise Analytics Engine**: Cross-location business intelligence, revenue heatmaps, employee leaderboards, and peak activity tracking.
- **Multi-Tenant Architecture**: Manage multiple parking garages, each with their own slots, pricing rules, and assigned workers.
- **Role-Based Access Control (RBAC)**:
  - `SUPER_ADMIN`: Full system access, enterprise analytics, and location creation.
  - `PARKING_ADMIN`: Location-specific management, pricing configuration, and worker assignment.
  - `WORKER`: On-the-ground operations, ticket generation, and payment processing.
- **Real-Time Operations**: Socket.io integration for live dashboard updates as vehicles enter and exit.
- **Dynamic Pricing**: Configurable base rates, hourly rates, and daily maximums per vehicle category and location.

## 🏗️ Project Structure

This is a full-stack monorepo consisting of two main environments:

- [`/frontend`](./frontend): A modern, lightning-fast React application built with Vite.
- [`/backend`](./backend): A robust Express.js REST API powered by PostgreSQL (Supabase).

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- A PostgreSQL database (Supabase recommended)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Saini-Yogesh/ParkNova.git
   cd ParkNova
   ```

2. **Set up the Backend:**
   Navigate to the backend directory, install dependencies, and configure your environment.
   ```bash
   cd backend
   npm install
   ```
   *See the [Backend README](./backend/README.md) for detailed database setup and environment variables.*

3. **Set up the Frontend:**
   Navigate to the frontend directory and install dependencies.
   ```bash
   cd ../frontend
   npm install
   ```
   *See the [Frontend README](./frontend/README.md) for configuration details.*

4. **Run the Application Locally:**
   You can run both servers simultaneously using your preferred method, or run them in separate terminal windows:
   
   Terminal 1 (Backend):
   ```bash
   cd backend
   npm run dev
   ```
   
   Terminal 2 (Frontend):
   ```bash
   cd frontend
   npm run dev
   ```

## 🔒 Security
- Passwords are cryptographically hashed using bcrypt.
- API endpoints are protected using JWT (JSON Web Tokens).
- Strict role-based middleware prevents unauthorized data access.

## 📜 License
This project is proprietary and confidential.