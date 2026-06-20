# ParkNova Backend ⚙️

The backend for ParkNova is a robust, highly-scalable Express.js REST API. It handles authentication, data validation, business logic, and real-time operations, backed by a powerful PostgreSQL database managed via Supabase.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (via Supabase Client)
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs
- **Real-Time WebSockets**: Socket.io
- **CORS & Security**: cors, dotenv

## 📂 Directory Structure

```text
/backend
  /controllers   # Business logic (auth, analytics, sessions, pricing)
  /database      # SQL schema files, migrations, and dummy data generators
  /middleware    # Express middleware (auth protection, error handling)
  /routes        # Express route definitions
  app.js         # Application entry point and server configuration
  createAdmin.js # Utility script to bootstrap the first Super Admin
```

## 🚀 Development Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   We have provided a `.env.example` file. Copy it to create your own `.env` file:
   ```bash
   cp .env.example .env
   ```
   Open the `.env` file and fill in your Supabase credentials, JWT keys, and database URL.

3. **Database Initialization**:
   You must set up your PostgreSQL database schema before running the server. 
   - Open your Supabase SQL Editor.
   - Run the contents of `database/schema.sql`.
   - Run the contents of `database/enterprise_migrations.sql`.
   - *(Optional)* Run `database/dummy_data.sql` to populate the database with realistic test data.

4. **Bootstrap Admin Account**:
   Run the setup script to create your initial `SUPER_ADMIN` account:
   ```bash
   node createAdmin.js
   ```

5. **Start the Server**:
   ```bash
   npm run dev
   ```
   The API will be available at `http://localhost:5000`.

## 📡 API Endpoints

The API is structured around several core domains:
- `/api/auth` - Login and registration.
- `/api/enterprise` - Cross-location aggregate statistics and materialized views.
- `/api/dashboard` - Real-time location-specific statistics.
- `/api/locations` - Management of parking facilities.
- `/api/pricing` - Dynamic pricing rules and category assignments.
- `/api/sessions` - Core business logic: vehicle entry, exit, and payment processing.
- `/api/users` - Worker and admin account management.

## 🔐 Authentication Flow
All protected routes require an `Authorization: Bearer <token>` header. The `protect` middleware verifies the token, while the `authorize(...roles)` middleware ensures the authenticated user has the correct permission level.

## 🗄️ Database Schema & Relationships

ParkNova uses a robust relational PostgreSQL database with the following core tables:

### 1. `users`
Stores all platform users.
- **Columns**: `id`, `name`, `email`, `password_hash`, `role` (SUPER_ADMIN, PARKING_ADMIN, WORKER), `status`.
- **Relationships**: A single user can create many locations (if PARKING_ADMIN) or be assigned to locations (if WORKER).

### 2. `parking_locations`
Represents physical parking facilities/buildings.
- **Columns**: `id`, `admin_id`, `name`, `code`, `address`, `city`, `latitude`, `longitude`.
- **Relationships**: 
  - Belongs to `users` (`admin_id`).
  - Has many `parking_slots`, `pricing_rules`, and `parking_sessions`.

### 3. `parking_workers` (Junction Table)
Maps Workers to the locations they are authorized to operate.
- **Columns**: `id`, `user_id`, `parking_location_id`.
- **Relationships**: Connects `users` to `parking_locations`.

### 4. `vehicle_categories`
Defines standard vehicle types (e.g., CAR, BIKE, TRUCK).
- **Columns**: `id`, `name`, `code`.
- **Relationships**: Used by slots, pricing rules, and sessions.

### 5. `parking_slots`
Represents individual physical parking spots.
- **Columns**: `id`, `parking_location_id`, `slot_number`, `vehicle_category_id`, `status` (AVAILABLE, OCCUPIED).
- **Relationships**: 
  - Belongs to a `parking_location`.
  - Is restricted to a specific `vehicle_category`.

### 6. `pricing_rules`
Defines dynamic pricing per location and vehicle type.
- **Columns**: `id`, `parking_location_id`, `vehicle_category_id`, `base_price`, `hourly_price`, `daily_price`.
- **Relationships**: Belongs to a location and a category.

### 7. `parking_sessions`
The core transactional table tracking a vehicle's stay.
- **Columns**: `id`, `ticket_number`, `parking_location_id`, `slot_id`, `vehicle_number`, `entry_time`, `exit_time`, `total_amount`, `status` (ACTIVE, COMPLETED).
- **Relationships**: 
  - Belongs to a location, slot, and category.
  - Linked to the worker who generated it (`created_by`, `closed_by`).

### 8. `payments`
Tracks financial transactions.
- **Columns**: `id`, `session_id`, `amount`, `payment_method`, `reference_number`.
- **Relationships**: Belongs to a `parking_session`.
