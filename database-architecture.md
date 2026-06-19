# ParkFlow Database Architecture

This document provides a detailed visual layout of the ParkFlow database schema, entity relationships, and connections using an Entity-Relationship (ER) diagram.

## Entity-Relationship Diagram

The following Mermaid diagram visualizes all the tables, their columns, and how they connect to one another through primary and foreign keys.

```mermaid
erDiagram
    users {
        UUID id PK
        VARCHAR name
        VARCHAR email "UNIQUE"
        VARCHAR phone
        VARCHAR password_hash
        VARCHAR role "SUPER_ADMIN, PARKING_ADMIN, WORKER"
        VARCHAR status "ACTIVE, SUSPENDED"
        TIMESTAMP last_login
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    parking_locations {
        UUID id PK
        UUID admin_id FK "References users(id)"
        VARCHAR name
        VARCHAR code "UNIQUE"
        TEXT address
        VARCHAR city
        VARCHAR state
        VARCHAR country
        DECIMAL latitude
        DECIMAL longitude
        VARCHAR status "ACTIVE, INACTIVE"
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    vehicle_categories {
        UUID id PK
        VARCHAR name
        VARCHAR code "UNIQUE"
        TEXT description
        TIMESTAMP created_at
    }

    parking_workers {
        UUID id PK
        UUID parking_location_id FK "References parking_locations(id)"
        UUID user_id FK "References users(id)"
        TIMESTAMP created_at
    }

    parking_slots {
        UUID id PK
        UUID parking_location_id FK "References parking_locations(id)"
        VARCHAR slot_number
        UUID vehicle_category_id FK "References vehicle_categories(id)"
        VARCHAR status "AVAILABLE, OCCUPIED, MAINTENANCE, RESERVED"
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    pricing_rules {
        UUID id PK
        UUID parking_location_id FK "References parking_locations(id)"
        UUID vehicle_category_id FK "References vehicle_categories(id)"
        DECIMAL base_price
        DECIMAL hourly_price
        DECIMAL daily_price
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    parking_sessions {
        UUID id PK
        VARCHAR ticket_number "UNIQUE"
        UUID parking_location_id FK "References parking_locations(id)"
        UUID slot_id FK "References parking_slots(id)"
        VARCHAR vehicle_number
        UUID vehicle_category_id FK "References vehicle_categories(id)"
        TIMESTAMP entry_time
        TIMESTAMP exit_time
        INTEGER duration_minutes
        DECIMAL total_amount
        VARCHAR payment_method
        VARCHAR payment_status "PENDING, PAID, FAILED, REFUNDED"
        UUID created_by FK "References users(id)"
        UUID closed_by FK "References users(id)"
        VARCHAR status "ACTIVE, COMPLETED, CANCELLED"
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    payments {
        UUID id PK
        UUID session_id FK "References parking_sessions(id)"
        DECIMAL amount
        VARCHAR payment_method
        VARCHAR reference_number
        TIMESTAMP paid_at
    }

    audit_logs {
        UUID id PK
        UUID user_id FK "References users(id)"
        VARCHAR action
        VARCHAR entity_type
        UUID entity_id
        JSONB old_value
        JSONB new_value
        VARCHAR ip_address
        TIMESTAMP created_at
    }

    %% Relationships Definition
    users ||--o{ parking_locations : "Manages (as Admin)"
    users ||--o{ parking_workers : "Works as (Worker)"
    users ||--o{ parking_sessions : "Creates/Closes sessions"
    users ||--o{ audit_logs : "Generates actions"

    parking_locations ||--o{ parking_workers : "Employs"
    parking_locations ||--o{ parking_slots : "Contains"
    parking_locations ||--o{ pricing_rules : "Defines"
    parking_locations ||--o{ parking_sessions : "Hosts"

    vehicle_categories ||--o{ parking_slots : "Restricts slot type"
    vehicle_categories ||--o{ pricing_rules : "Determines price"
    vehicle_categories ||--o{ parking_sessions : "Identifies vehicle"

    parking_slots ||--o{ parking_sessions : "Occupied by"

    parking_sessions ||--o| payments : "Resolved by"
```

## Detailed Relationship Breakdown

1. **Users & Roles (`users`)**
   - **`PARKING_ADMIN`** users map to multiple `parking_locations` where they serve as `admin_id`.
   - **`WORKER`** users are mapped to `parking_locations` via the `parking_workers` junction table.
   - Workers link to `parking_sessions` through `created_by` (check-in) and `closed_by` (check-out).

2. **Location Infrastructure (`parking_locations`)**
   - Acts as the central hub. Every physical asset (slots) and logical rule (pricing, workers) is tied directly to a location ID.
   - Employs a strict cascading delete policy (`ON DELETE CASCADE`) for slots and workers to maintain data integrity if a location is removed.

3. **Categorization & Pricing (`vehicle_categories` & `pricing_rules`)**
   - `vehicle_categories` (e.g., Bike, Car, Truck) act as a global reference.
   - `pricing_rules` creates a unique composite matrix linking a specific `parking_location_id` with a `vehicle_category_id` to determine unique rates (Base, Hourly, Daily) per location.

4. **Live Transactions (`parking_sessions` & `payments`)**
   - The `parking_sessions` table aggregates foreign keys from almost every other domain: It needs a location, a slot, a vehicle category, and workers (creator/closer).
   - Once a session completes (status updates from `ACTIVE` to `COMPLETED`), a row is inserted into the `payments` table mapping directly back to the session.

5. **Security & Auditing (`audit_logs`)**
   - Every major system action records who performed it (`user_id`) along with JSONB snapshots of the `old_value` and `new_value`, allowing complete system state reconstruction if necessary.
