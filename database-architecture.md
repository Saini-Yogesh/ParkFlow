# ParkNova Database Architecture

This document provides a detailed visual layout of the ParkNova database schema, entity relationships, and connections using an Entity-Relationship (ER) diagram.

## Entity-Relationship Diagram

The following Mermaid diagram visualizes all the tables, their columns, and how they connect to one another through primary and foreign keys.

```mermaid
erDiagram
	direction LR
	users {
		UUID id PK ""  
		VARCHAR name  ""  
		VARCHAR email  "UNIQUE"  
		VARCHAR phone  ""  
		VARCHAR password_hash  ""  
		VARCHAR role  "SUPER_ADMIN, PARKING_ADMIN, WORKER"  
		VARCHAR status  "ACTIVE, SUSPENDED"  
		TIMESTAMP last_login  ""  
		TIMESTAMP created_at  ""  
		TIMESTAMP updated_at  ""  
	}

	audit_logs {
		UUID id PK ""  
		UUID user_id FK "References users(id)"  
		VARCHAR action  ""  
		VARCHAR entity_type  ""  
		UUID entity_id  ""  
		JSONB old_value  ""  
		JSONB new_value  ""  
		VARCHAR ip_address  ""  
		TIMESTAMP created_at  ""  
	}

	parking_locations {
		UUID id PK ""  
		UUID admin_id FK "References users(id)"  
		VARCHAR name  ""  
		VARCHAR code  "UNIQUE"  
		TEXT address  ""  
		VARCHAR city  ""  
		VARCHAR state  ""  
		VARCHAR country  ""  
		DECIMAL latitude  ""  
		DECIMAL longitude  ""  
		VARCHAR status  "ACTIVE, INACTIVE"  
		TIMESTAMP created_at  ""  
		TIMESTAMP updated_at  ""  
	}

	vehicle_categories {
		UUID id PK ""  
		VARCHAR name  ""  
		VARCHAR code  "UNIQUE"  
		TEXT description  ""  
		TIMESTAMP created_at  ""  
	}

	parking_workers {
		UUID id PK ""  
		UUID parking_location_id FK "References parking_locations(id)"  
		UUID user_id FK "References users(id)"  
		TIMESTAMP created_at  ""  
	}

	parking_slots {
		UUID id PK ""  
		UUID parking_location_id FK "References parking_locations(id)"  
		VARCHAR slot_number  ""  
		UUID vehicle_category_id FK "References vehicle_categories(id)"  
		VARCHAR status  "AVAILABLE, OCCUPIED, MAINTENANCE, RESERVED"  
		TIMESTAMP created_at  ""  
		TIMESTAMP updated_at  ""  
	}

	pricing_rules {
		UUID id PK ""  
		UUID parking_location_id FK "References parking_locations(id)"  
		UUID vehicle_category_id FK "References vehicle_categories(id)"  
		DECIMAL base_price  ""  
		DECIMAL hourly_price  ""  
		DECIMAL daily_price  ""  
		TIMESTAMP created_at  ""  
		TIMESTAMP updated_at  ""  
	}

	parking_sessions {
		UUID id PK ""  
		VARCHAR ticket_number  "UNIQUE"  
		UUID parking_location_id FK "References parking_locations(id)"  
		UUID slot_id FK "References parking_slots(id)"  
		VARCHAR vehicle_number  ""  
		UUID vehicle_category_id FK "References vehicle_categories(id)"  
		TIMESTAMP entry_time  ""  
		TIMESTAMP exit_time  ""  
		INTEGER duration_minutes  ""  
		DECIMAL total_amount  ""  
		VARCHAR payment_method  ""  
		VARCHAR payment_status  "PENDING, PAID, FAILED, REFUNDED"  
		UUID created_by FK "References users(id)"  
		UUID closed_by FK "References users(id)"  
		VARCHAR status  "ACTIVE, COMPLETED, CANCELLED"  
		TIMESTAMP created_at  ""  
		TIMESTAMP updated_at  ""  
	}

	payments {
		UUID id PK ""  
		UUID session_id FK "References parking_sessions(id)"  
		DECIMAL amount  ""  
		VARCHAR payment_method  ""  
		VARCHAR reference_number  ""  
		TIMESTAMP paid_at  ""  
	}

    %% Relationships Definition
    %% Level 1
    users ||--o{ parking_locations : manages
    users ||--o{ parking_workers : manages
    users ||--o{ audit_logs: tracks 

    %% Level 2
    parking_locations ||--o{ parking_workers : employs
    parking_locations ||--o{ parking_slots : defines
    parking_locations ||--o{ pricing_rules : defines

    %% Level 3
    vehicle_categories ||--o{ parking_slots : slot_type
    vehicle_categories ||--o{ pricing_rules : pricing

    %% Level 4
    parking_workers ||--o{ parking_sessions : creates
    parking_slots ||--o{ parking_sessions : occupied
    pricing_rules ||--o{ parking_sessions : charges

    %% Level 5
    parking_sessions ||--o| payments : resolved_by
```

## Detailed Relationship Breakdown

### 1. User Management (`users`)

* The `users` table serves as the central identity and authentication entity for the system.
* Users can have one of three roles: `SUPER_ADMIN`, `PARKING_ADMIN`, or `WORKER`.
* A `PARKING_ADMIN` can manage multiple parking locations.
* Workers are assigned to specific parking locations through the `parking_workers` table.
* All significant system activities performed by users are recorded in the `audit_logs` table.

### 2. Parking Location Management (`parking_locations`)

* `parking_locations` represents individual parking facilities managed within the system.
* Each parking location is owned and managed by a parking administrator.
* A parking location can employ multiple workers.
* Every parking slot and pricing rule is defined within the scope of a specific parking location.
* This entity acts as the operational center for managing parking resources and business rules.

### 3. Vehicle Categories & Pricing (`vehicle_categories`, `pricing_rules`)

* `vehicle_categories` defines the supported vehicle types such as Bike, Car, SUV, or Truck.
* Parking slots are associated with a vehicle category to ensure vehicles are parked in suitable spaces.
* Pricing rules connect a parking location with a vehicle category, allowing different locations to maintain independent pricing structures.
* Each pricing rule defines the base, hourly, and daily charges applicable to a specific vehicle category at a particular location.

### 4. Parking Operations (`parking_workers`, `parking_slots`, `parking_sessions`)

* Workers are responsible for creating and managing parking sessions.
* Parking slots represent the physical parking spaces available at a location and maintain their current occupancy status.
* When a vehicle enters the facility, a parking session is created and linked to a worker, parking slot, pricing rule, and vehicle information.
* Parking sessions store the complete lifecycle of a parked vehicle, including entry time, exit time, duration, total charges, and session status.

### 5. Payments & Billing (`payments`)

* Each completed parking session can generate a corresponding payment record.
* The payments table stores transaction details such as amount paid, payment method, reference number, and payment timestamp.
* This relationship enables revenue tracking and financial reporting for parking operations.

### 6. Audit & Activity Tracking (`audit_logs`)

* The audit logging system provides traceability for all important actions performed within the application.
* Each audit record stores the acting user, affected entity type, entity identifier, and action performed.
* JSON snapshots of previous and updated values are maintained to support historical tracking and operational transparency.
* Audit logs assist with troubleshooting, accountability, and compliance requirements.
