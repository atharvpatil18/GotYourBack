# 🎒 GotYourBack - Campus Item Lending and Borrowing Platform

A full-stack web application enabling students to lend, borrow, or sell items within their campus community. Built for SRM students to promote collaboration, sustainability, and easy resource sharing.

---

## 📘 Overview

**GotYourBack** is a campus-exclusive platform designed to help SRM students **lend, borrow, and sell** academic or personal items within their community. It promotes collaboration, sustainability, and accessibility by simplifying how students share essential resources.

---

## 🧭 Table of Contents

* [Quick Start Guide](#-quick-start-guide)
* [Features](#-key-features)
* [Technology Stack](#-technology-stack)
* [Database Schema](#-database-schema)
* [API Reference](#-api-reference)
* [Security Features](#-security-features)
* [Testing Guide](#testing-guide)
* [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start Guide

### Prerequisites

- **MySQL 8.0+**
- **Java 17+**
- **Maven 3.6+**
- Modern web browser
- Live Server extension (VS Code) or any HTTP server

### Setup in 5 Minutes

**1. Clone Repository**

```bash
git clone https://github.com/atharvpatil18/GotYourBack.git
cd GotYourBack
```

**2. Database Setup**

```bash
cd Backend
mysql -u root -p < src/main/resources/db/DB_SETUP.sql
# Enter your MySQL root password
```

**3. Configure Backend** (if needed)

Edit `Backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    password: your_mysql_password
```

**4. Start Backend**

```bash
mvn spring-boot:run
```

✅ Backend runs on `http://localhost:8080`

**5. Start Frontend**

- Open `Frontend/index.html` with Live Server
- Or visit `http://localhost:5500`

**6. Create Account & Login**

- Visit `/signup.html`
- Use your email to register
- Login and start sharing!

---

## ✨ Key Features

│   │   ├── service/         # Business logic layer

│   │   ├── model/           # JPA entities---

│   │   ├── dto/             # Data transfer objects

│   │   ├── repository/      # Database repositories## 🎯 Purpose & Impact

│   │   ├── config/          # Security & CORS config

## ✨ Key Features

### 📚 Core Functionality
- **Post Items**: List items to lend or sell with details and images
- **Browse & Search**: Filter by category, type, urgency, keywords
- **Request System**: Send, accept, or reject requests
- **Real-time Messaging**: Chat with users for accepted requests
- **Smart Notifications**: Get notified of all activities
- **Profile Management**: Update personal details

### 🔄 Complete Transaction Workflow

#### For LEND Items (Full Handover Tracking):
```
1. Borrower sends REQUEST
   ↓
2. Owner ACCEPTS request
   ↓
3. Owner clicks "Mark as Lent" (when handing over item)
   ↓
4. Borrower clicks "Confirm Receipt" (when receiving item)
   ↓
5. Either party clicks "Mark as Done" (transaction in use)
   ↓
6. Both parties "Confirm Return" (when item returned)
   ↓
7. Item status → AVAILABLE (back in browse)
```

#### For SELL Items (Simplified):
```
1. Buyer sends REQUEST
   ↓
2. Seller ACCEPTS
   ↓
3. Either clicks "Mark as Done"
   ↓
4. Transaction COMPLETE
```

### 🔔 Notification System
Automatic notifications for:
- New requests received
- Request accepted/rejected
- Item marked as lent
- Receipt confirmed
- New messages received
- Return confirmations
- Transaction completed

### 💬 Messaging System
- Private messaging for accepted requests
- Real-time message threads
- Message history
- Organized by conversation

---

## 🧱 Technology Stack

### Backend
| Component | Technology |
|-----------|------------|
| Framework | Spring Boot 3.5.6 |
| Database | MySQL 8.0 |
| ORM | JPA/Hibernate |
| Security | BCrypt Password Hashing |
| Build Tool | Maven |
| API Style | RESTful |

### Frontend
| Component | Technology |
|-----------|------------|
| Core | Vanilla JavaScript (ES6 Modules) |
| UI Framework | Bootstrap 5 |
| Icons | Bootstrap Icons |
| HTTP Client | Fetch API |
| Architecture | MVC Pattern |

---

## 📊 Database Schema

### Tables Overview
```sql
users               # User accounts
items               # Items for lending/selling  
requests            # Borrowing/buying requests
messages            # User-to-user messages
notifications       # Activity notifications
```

### Key Entities & Relationships

**Users** (`users`)
- Fields: id, name, email, password, department, registration_number, year_of_study
- Relations: → items (one-to-many), → requests (one-to-many)

**Items** (`items`)
- Fields: id, name, description, category, type, status, urgency, image_url, owner_id
- Types: LEND, SELL
- Status: AVAILABLE, SOLD, RETURNED, UNAVAILABLE

**Requests** (`requests`)
- Fields: id, item_id, requester_id, status, timestamps
- Status: PENDING, ACCEPTED, REJECTED, DONE
- Tracking: lent_at, received_at, completed_at
- Confirmations: lender_marked_as_lent, borrower_confirmed_receipt

**Messages** (`messages`)
- Fields: id, request_id, sender_id, receiver_id, content, sent_at

**Notifications** (`notifications`)
- Fields: id, recipient_id, notification_type, message, is_read, timestamps

---

## 🛡️ Security Features

✅ **Authentication & Authorization**
- BCrypt password hashing (10 rounds)
- Session-based authentication
- Ownership verification for all actions

✅ **Input Validation**
- Frontend validation
- Backend validation with custom exceptions
- SQL injection prevention (JPA/Hibernate)

✅ **XSS Prevention**
- DOM-based rendering (no innerHTML for user content)
- Content sanitization

✅ **CORS Configuration**
- Controlled origins
- Credentials support

✅ **Error Handling**
- Global exception handler
- Custom exception types
- User-friendly error messages

---

## 📡 API Reference

### Authentication
```
POST   /api/auth/signup          Create new account
POST   /api/auth/login           User login
```

### Items
```
GET    /api/items                Browse all items
GET    /api/items/{id}           Get item by ID
POST   /api/items                Create new item
PUT    /api/items/{id}           Update item
DELETE /api/items/{id}           Delete item
GET    /api/items/user/{userId}  Get user's items
```

### Requests
```
GET    /api/requests/user/{userId}              Get user's sent requests
GET    /api/requests/received/{userId}          Get received requests
GET    /api/requests/user/{userId}/accepted     Get accepted requests
POST   /api/requests                            Create request
PUT    /api/requests/{id}/status                Update request status
PUT    /api/requests/{id}/done                  Mark as done
PUT    /api/requests/{id}/mark-as-lent          Owner marks as lent
PUT    /api/requests/{id}/confirm-receipt       Borrower confirms receipt
PUT    /api/requests/{id}/confirm-return        Confirm return
```

### Messages
```
GET    /api/messages/user/{userId}              Get user messages
GET    /api/messages/request/{requestId}        Get request messages
POST   /api/messages/send/{requestId}           Send message
```

### Notifications
```
GET    /api/notifications/{userId}              Get notifications
PUT    /api/notifications/{id}/read             Mark as read
DELETE /api/notifications/{id}                  Delete notification
```

### User Profile
```
GET    /api/users/{userId}                      Get profile
PUT    /api/users/{userId}                      Update profile
```

---

## 🐛 Troubleshooting

### Backend Issues

**Port 8080 Already in Use**
```powershell
# Find process using port 8080
netstat -ano | findstr :8080

# Kill the process
taskkill /PID <PID> /F

# Restart backend
mvn spring-boot:run
```

**Database Connection Error**
- Check MySQL is running
- Verify credentials in `application.yml`
- Ensure database `gotyourback` exists

**Compilation Errors**
```bash
# Clean and rebuild
mvn clean compile
```

### Frontend Issues

**API Calls Failing**
- Check backend is running on port 8080
- Open browser console (F12) for errors
- Verify CORS settings

**Not Loading Data**
- Clear browser cache
- Check if logged in (localStorage has userId)
- Verify API endpoints in api-config.js

**Images Not Showing**
- Check image URLs are valid
- Verify CORS for image sources

---

## 🧪 Testing Checklist

### User Flow Testing
- [ ] Sign up new user
- [ ] Login with credentials
- [ ] Post LEND item
- [ ] Post SELL item  
- [ ] Browse and search items
- [ ] Send request to item
- [ ] Accept/reject requests
- [ ] Mark as lent
- [ ] Confirm receipt
- [ ] Send/receive messages
- [ ] Check notifications
- [ ] Mark as done
- [ ] Confirm return (both parties)
- [ ] Verify item reappears in browse

### Edge Cases
- [ ] Cannot request own item
- [ ] Cannot accept own request
- [ ] Duplicate requests prevented
- [ ] Proper status transitions
- [ ] Ownership verification enforced

---

## 📈 Version History

### v1.3.0 - Lend/Receipt Tracking (Current)
- ✅ Added "Mark as Lent" feature for owners
- ✅ Added "Confirm Receipt" feature for borrowers
- ✅ Full handover process tracking
- ✅ Enhanced notifications for all workflow steps
- ✅ Database schema updated with lent/receipt fields

### v1.2.0 - Return Confirmation
- ✅ Dual return confirmation (borrower + lender)
- ✅ Automatic item availability after confirmation
- ✅ Completed items removed from browse

### v1.1.0 - Security Fixes
- ✅ Fixed duplicate notification bug
- ✅ Removed wildcard CORS
- ✅ Added XSS prevention
- ✅ Implemented ownership verification
- ✅ Added custom exceptions

### v1.0.0 - Initial Release
- ✅ Core lending/selling functionality
- ✅ User authentication
- ✅ Messaging system
- ✅ Basic notifications

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is for educational purposes as part of academic coursework.

---

## 👥 Authors & Support

**Project Team**: SRM Students
**Repository**: [atharvpatil18/GotYourBack](https://github.com/atharvpatil18/GotYourBack)

For issues or questions:
- Check existing GitHub issues
- Review troubleshooting section
- Contact project maintainers

---

**Built with ❤️ for campus communities**
