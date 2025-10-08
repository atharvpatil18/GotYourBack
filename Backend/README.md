# Got Your Back - Backend Documentation

## 🏗 Architecture Overview

The backend follows a layered architecture pattern with the following components:

```
src/main/java/com/gotyourback/
├── controller/     # REST API endpoints
├── service/        # Business logic
├── repository/     # Database access
├── model/          # Entity classes
├── dto/            # Data Transfer Objects
├── config/         # Configuration classes
└── filter/         # Request filters
```

## 📁 Directory Structure Explained

### 🎯 Controllers (`controller/`)
- `AuthController.java`: Handles user authentication and registration
- `DashboardController.java`: Manages dashboard data and statistics
- `ItemController.java`: Manages CRUD operations for items
- `MessageController.java`: Handles user-to-user messaging
- `RequestController.java`: Manages item requests
- `UserController.java`: Handles user profile operations

### 📦 Models (`model/`)
- `User.java`: User entity with profile details
  - Stores: name, email, password, department, registration number, year
- `Item.java`: Resource item entity
  - Contains: name, description, category, type (LEND/SELL), status
  - Includes enums: ItemStatus, ItemType
- `Request.java`: Request entity for items
  - Tracks: requester, item, status
  - Includes enum: RequestStatus
- `Message.java`: User communication entity
  - Stores: sender, receiver, content, timestamp

### 🔄 Services (`service/`)
- `AuthService`: Implements authentication logic and JWT handling
- `ItemService`: Business logic for item management
- `UserService`: User profile and management operations
- `RequestService`: Request processing and status management
- `MessageService`: Message handling and notifications

### 💾 Repositories (`repository/`)
- `UserRepository`: User data access
- `ItemRepository`: Item data access
- `RequestRepository`: Request data access
- `MessageRepository`: Message data access

### ⚙️ Configuration (`config/`)
- `WebConfig.java`: CORS and web configuration
- `GlobalExceptionHandler.java`: Central error handling

### 🔐 Filters (`filter/`)
- JWT authentication filter
- Request logging
- Security filters

## 🗄 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    department VARCHAR(255),
    registration_number VARCHAR(255),
    year_of_study INT
);
```

### Items Table
```sql
CREATE TABLE items (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    category VARCHAR(50),
    type VARCHAR(20),
    urgency VARCHAR(20),
    image_url TEXT,
    status VARCHAR(20),
    owner_id BIGINT,
    FOREIGN KEY (owner_id) REFERENCES users(id)
);
```

### Requests Table
```sql
CREATE TABLE requests (
    id BIGINT PRIMARY KEY,
    item_id BIGINT,
    requester_id BIGINT,
    status VARCHAR(20),
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (requester_id) REFERENCES users(id)
);
```

### Messages Table
```sql
CREATE TABLE messages (
    id BIGINT PRIMARY KEY,
    sender_id BIGINT,
    receiver_id BIGINT,
    content TEXT,
    timestamp TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
);
```

## 🔄 Data Flow

1. **Authentication Flow**:
   - Request → JWT Filter → Auth Controller → Auth Service → Repository
   - JWT token generation and validation
   - User session management

2. **Item Management Flow**:
   - Request → Item Controller → Item Service → Repository
   - Handles CRUD operations for items
   - Manages item status updates

3. **Request Processing Flow**:
   - Request → Request Controller → Request Service → Repository
   - Item request creation and management
   - Status updates and notifications

4. **Messaging Flow**:
   - Request → Message Controller → Message Service → Repository
   - Real-time message handling
   - User notifications

## 🔌 API Endpoints

### Auth Endpoints
- `POST /api/auth/login`: User login
- `POST /api/auth/register`: User registration

### Item Endpoints
- `GET /api/items`: List all items
- `POST /api/items`: Create new item
- `GET /api/items/{id}`: Get item details
- `PUT /api/items/{id}`: Update item
- `DELETE /api/items/{id}`: Delete item

### Request Endpoints
- `POST /api/requests`: Create new request
- `PUT /api/requests/{id}`: Update request status
- `GET /api/requests/user`: Get user's requests

### Message Endpoints
- `POST /api/messages`: Send message
- `GET /api/messages/{userId}`: Get conversation
- `GET /api/messages`: Get all user messages

### User Endpoints
- `GET /api/users/profile`: Get user profile
- `PUT /api/users/profile`: Update profile