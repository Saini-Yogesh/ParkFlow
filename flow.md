# ParkFlow System Architecture & Website Flow

This document outlines the complete, detailed flow of the ParkFlow web application, encompassing both the frontend user journey and the underlying backend architecture, including database schemas, relationships, and system design.

---

## 1. System Architecture Overview

ParkFlow is a full-stack web application designed for comprehensive parking management. The architecture is composed of:

- **Frontend**: A React.js application using Vite, leveraging React Router for client-side navigation. It uses role-based access control (RBAC) to present different dashboards based on user permissions.
- **Backend**: A Node.js and Express.js REST API providing secure endpoints for all operations. It implements rate-limiting, CORS, HTTP request logging (Morgan), and global error handling.
- **Database**: A PostgreSQL relational database storing users, locations, parking slots, live sessions, pricing, and payments. UUIDs are heavily utilized for primary keys to ensure security and scalability.

---

## 2. Complete Frontend & Backend Route Flow (Click-by-Click)

The application handles three distinct user roles: `SUPER_ADMIN`, `PARKING_ADMIN`, and `WORKER`. Here is the detailed interaction flow:

### 2.1 Public & Authentication Flow
- **Route**: `/` (Landing Page)
  - **Action**: User visits the root URL.
  - **Condition**: If not logged in, the `<Landing />` page component is shown.
- **Route**: `/login` (Login Page)
  - **Action**: User clicks "Login".
  - **Backend Connection**: Submits credentials to `POST /api/auth/login`.
  - **Result**: Backend validates credentials against the `users` table, generating a JWT token on success. Frontend receives the token and role, storing them in context/localStorage, and redirects to `/`.
- **Route**: `/register` (Registration Page)
  - **Action**: User clicks "Register".
  - **Backend Connection**: Submits user details to `POST /api/auth/register`.
  - **Result**: Backend creates a new user in the `users` table with a hashed password.

### 2.2 Redirect Logic (The Role Router)
Once logged in, accessing `/` automatically directs users based on their role:
- **SUPER_ADMIN** -> Redirects to `/admin/enterprise`
- **PARKING_ADMIN** -> Redirects to `/admin/dashboard`
- **WORKER** -> Redirects to `/worker/dashboard`

---

### 2.3 Super Admin Flow
**Super Admins manage the platform across multiple clients/enterprises.**
- **Route**: `/admin/enterprise` (Enterprise Dashboard)
  - **Action**: Super Admin views high-level metrics across all registered parking systems.
  - **Backend Connections**: 
    - `GET /api/enterprise/stats` to fetch system-wide revenue and usage.
    - `GET /api/enterprise/clients` to list all PARKING_ADMINs.
  - **Interactions**: Clicking to view a specific parking client's activity fetches details via `GET /api/enterprise/client/:id`.

---

### 2.4 Parking Admin Flow
**Parking Admins manage their specific parking locations, slots, pricing, and workers.**
- **Route**: `/admin/dashboard`
  - **Action**: Admin sees an overview of their parking locations (live availability, revenue).
  - **Backend Connections**: `GET /api/dashboard/stats` via `dashboardController`.
- **Route**: `/admin/locations`
  - **Action**: Manage physical parking locations.
  - **Backend Connections**:
    - `GET /api/locations` (List locations linked to `admin_id`).
    - `POST /api/locations` (Create new location, saves to `parking_locations` table).
- **Route**: `/admin/workers`
  - **Action**: Assign workers to specific parking locations.
  - **Backend Connections**: 
    - `GET /api/users/workers` (Fetch users with WORKER role).
    - `POST /api/locations/:id/workers` (Link worker to location in `parking_workers` table).
- **Route**: `/admin/slots`
  - **Action**: Define and view the layout of parking slots.
  - **Backend Connections**:
    - `GET /api/slots` (List all slots).
    - `POST /api/slots` (Add a new slot to `parking_slots` table with `vehicle_category_id`).
- **Route**: `/admin/pricing`
  - **Action**: Set pricing rules per vehicle category.
  - **Backend Connections**:
    - `GET /api/pricing` (Fetch pricing rules).
    - `POST /api/pricing` (Set base, hourly, and daily rates in `pricing_rules`).

---

### 2.5 Worker Flow
**Workers are on the ground, handling check-ins and check-outs for vehicles.**
- **Route**: `/worker/dashboard`
  - **Action**: The main interface for workers to manage live parking sessions.
  - **Backend Connections**:
    - `GET /api/slots/available` (Find open slots for incoming vehicles).
    - `POST /api/sessions/entry` (Check-in a vehicle).
      - *Backend execution*: Creates a row in `parking_sessions`, marks `parking_slots` as `OCCUPIED`.
    - `POST /api/sessions/exit` (Check-out a vehicle).
      - *Backend execution*: Calculates `duration_minutes` and `total_amount` using `pricing_rules`. Marks `parking_slots` as `AVAILABLE`.
    - `POST /api/sessions/:id/pay` (Process payment).
      - *Backend execution*: Creates a row in `payments` table and marks session `status` as `COMPLETED`.

---

## 3. Database Architecture & Schema Detail

The PostgreSQL database utilizes `uuid-ossp` for primary keys. Below is the detailed table structure and their relationships:

### 3.1 Core Users & Entities

**Table: `users`**
- **Columns**: `id` (UUID), `name`, `email` (Unique), `phone`, `password_hash`, `role` (SUPER_ADMIN, PARKING_ADMIN, WORKER), `status`, `last_login`, `created_at`, `updated_at`.
- **Purpose**: Centralized authentication and role management.

**Table: `vehicle_categories`**
- **Columns**: `id` (UUID), `name`, `code` (Unique), `description`, `created_at`.
- **Purpose**: Defines vehicle types (e.g., Bike, Car, Truck).

---

### 3.2 Location & Staffing

**Table: `parking_locations`**
- **Columns**: `id` (UUID), `admin_id` (FK -> users.id), `name`, `code`, `address`, `city`, `state`, `country`, `latitude`, `longitude`, `status`, timestamps.
- **Connections**: Links directly to the `PARKING_ADMIN` who owns it.

**Table: `parking_workers`**
- **Columns**: `id` (UUID), `parking_location_id` (FK -> parking_locations.id), `user_id` (FK -> users.id).
- **Connections**: A junction table resolving the many-to-many relationship between workers and parking locations.

---

### 3.3 Infrastructure & Rules

**Table: `parking_slots`**
- **Columns**: `id` (UUID), `parking_location_id` (FK -> parking_locations.id), `slot_number`, `vehicle_category_id` (FK -> vehicle_categories.id), `status` (AVAILABLE, OCCUPIED, MAINTENANCE).
- **Purpose**: Represents physical parking bays. Unique constraint on `(parking_location_id, slot_number)`.

**Table: `pricing_rules`**
- **Columns**: `id` (UUID), `parking_location_id` (FK -> parking_locations.id), `vehicle_category_id` (FK -> vehicle_categories.id), `base_price`, `hourly_price`, `daily_price`.
- **Purpose**: Dictates how cost is calculated based on vehicle type at a specific location.

---

### 3.4 Live Operations & Revenue

**Table: `parking_sessions`**
- **Columns**: `id` (UUID), `ticket_number` (Unique), `parking_location_id` (FK), `slot_id` (FK), `vehicle_number`, `vehicle_category_id` (FK), `entry_time`, `exit_time`, `duration_minutes`, `total_amount`, `payment_method`, `payment_status` (PENDING, PAID), `created_by` (FK -> users.id, the worker who checked them in), `closed_by` (FK -> users.id, worker who checked them out), `status` (ACTIVE, COMPLETED).
- **Connections**: The most complex table. It joins locations, slots, vehicle categories, and the specific workers who handled the transaction.

**Table: `payments`**
- **Columns**: `id` (UUID), `session_id` (FK -> parking_sessions.id), `amount`, `payment_method`, `reference_number`, `paid_at`.
- **Purpose**: Tracks actual financial transactions securely.

**Table: `audit_logs`**
- **Columns**: `id` (UUID), `user_id` (FK), `action`, `entity_type`, `entity_id`, `old_value` (JSONB), `new_value` (JSONB), `ip_address`.
- **Purpose**: System-wide logging for compliance and troubleshooting. Tracks who changed what and when using JSONB snapshots.

### 3.5 System Architecture Overview
The system employs an event-driven database model to keep timestamps fresh:
- **Database Triggers**: Functions like `update_updated_at_column()` are attached to nearly every table (users, locations, slots, sessions) to automatically manage `updated_at` timestamps at the database engine level.
- **Indexes**: Highly indexed tables (`idx_users_email`, `idx_parking_sessions_ticket`, `idx_parking_sessions_status`, etc.) ensure fast lookups for high-frequency queries like worker dashboard slot availability and session checking.
