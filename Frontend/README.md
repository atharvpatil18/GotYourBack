# Got Your Back - Frontend Documentation

## 📁 Directory Structure

```
Frontend/
├── assets/            # Static assets and images
├── scripts/           # JavaScript files
│   ├── utils/         # Utility functions
│   └── api.js         # API integration
├── index.html         # Landing page
├── login.html         # Login page
├── signup.html        # Registration page
├── dashboard.html     # User dashboard
├── profile.html       # User profile
├── postItem.html      # Post new item
├── editItem.html      # Edit item details
├── messages.html      # Messaging interface
└── style.css         # Global styles
```

## 📄 File Descriptions & Flow

### 🌐 HTML Pages

#### 1. `index.html` - Landing Page
- Entry point of the application
- Features showcase
- Navigation to login/signup
- Search functionality for public items

#### 2. `login.html` & `signup.html` - Authentication
- User authentication forms
- Input validation
- Error handling
- Redirects to dashboard on success

#### 3. `dashboard.html` - Main Interface
- Display of available items
- Category-based filtering
- User's posted items
- Request management
- Quick access to messages

#### 4. `profile.html` - User Profile
- User information display
- Profile editing
- Transaction history
- Active listings/requests

#### 5. `postItem.html` & `editItem.html` - Item Management
- Item creation/editing forms
- Image upload
- Category selection
- Type selection (Lend/Sell)
- Urgency setting

#### 6. `messages.html` - Communication
- Chat interface
- Message history
- User conversations list
- Real-time updates

### 📜 JavaScript Files

#### Core Files (`scripts/`)

1. `api.js`
- Backend API integration
- HTTP request handling
- Response processing
- Error handling

2. `auth.js`
- Authentication state management
- Token handling
- Session management
- Login/logout logic

3. `dashboard.js`
- Item listing management
- Filter implementation
- Search functionality
- Request handling

4. `messages.js`
- Message sending/receiving
- Conversation management
- Real-time updates
- Notification handling

5. `profile.js`
- Profile data management
- Form handling
- Image upload
- Validation

6. `postItem.js`
- Item creation logic
- Form validation
- Image preview
- Category management

#### Utility Files (`scripts/utils/`)

1. `api-config.js`
- API endpoint configurations
- Request headers
- Base URL management

2. `auth-utils.js`
- Token management
- Authentication helpers
- Permission checking

3. `ui-utils.js`
- Common UI components
- Loading states
- Toast notifications
- Modal handling

4. `validation.js`
- Input validation
- Form validation
- Error messages
- Data formatting

## 🔄 Frontend Flow

### 1. Authentication Flow
```
Login/Signup Page
    ↓
Form Validation (validation.js)
    ↓
API Request (api.js)
    ↓
Token Storage (auth-utils.js)
    ↓
Redirect to Dashboard
```

### 2. Item Posting Flow
```
Post Item Page
    ↓
Form Input & Validation
    ↓
Image Upload & Preview
    ↓
API Request
    ↓
Dashboard Update
```

### 3. Request Flow
```
View Item
    ↓
Create Request
    ↓
Owner Notification
    ↓
Status Updates
    ↓
Message Thread Creation
```

### 4. Messaging Flow
```
Select Conversation
    ↓
Load Message History
    ↓
Real-time Updates
    ↓
Notification System
```

## 🎨 Style Guide

### CSS Organization (`style.css`)
- Global styles
- Component-specific styles
- Responsive design
- Theme variables

### Color Palette
```css
:root {
  --primary: #3498db;
  --secondary: #2ecc71;
  --accent: #e74c3c;
  --background: #f9f9f9;
  --text: #2c3e50;
}
```

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
- Flexible grid system
- Adaptive navigation

## 🔧 Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers