# Food Delivery Web Application (Work In Progress)

A comprehensive multi-tier restaurant management and food delivery system that supports multiple branches, administrative controls, and real-time order tracking.

## 🚀 Features

### Multi-tier User System
- **Super Admin Dashboard**: Complete control over all branches and system settings
- **Branch Management**: Individual branch control panels for menu and order management
- **Rider Interface**: Real-time order tracking and delivery management
- **Customer Portal**: User-friendly ordering system with real-time tracking

### Key Functionalities
- **Branch-specific Operations**: 
  - Customized menus and pricing
  - Independent inventory management
  - Branch-specific order handling

- **Customer Features**:
  - Branch selection system
  - Multiple address management with map integration
  - Real-time order tracking
  - Interactive cart and checkout system
  - Cash on delivery payment option

- **Order Management**: 
  - Real-time order status updates
  - Order cancellation (before confirmation)
  - Live tracking map showing:
    - Branch location
    - Customer location
    - Real-time rider position

- **Rider System**:
  - Mobile app for delivery personnel
  - Real-time location tracking
  - Order status management


## 🛠️ Technology Stack

- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Real-time Features**: WebSocket/Socket.io
- **Maps Integration**: (Mapping Service API)
- **Authentication**: JWT-based auth system
- **Mobile App**: React Native for riders

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/taciturn2021/food-delivery-webapp.git
cd food-delivery-webapp
```

2. Install dependencies for each component:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install rider app dependencies
cd ../riderApp
npm install
```

3. Set up environment variables:
```bash
# Create .env file in the backend directory
cd backend
cp .env.example .env

# Fill in required environment variables:
# - Database credentials
# - JWT secret
# - API keys
```

4. Start the applications:
```bash
# Start backend server
cd backend
npm run dev

# Start frontend application (in a new terminal)
cd frontend
npm run dev

# For rider app development
cd riderApp
npm start
```

Note: The database tables will be automatically initialized on first startup of the backend server.


## 👥 User Roles

1. **Super Admin**
   - System-wide management
   - Branch creation and management
   - User role management

2. **Branch Manager**
   - Menu management
   - Order processing
   - Staff management

3. **Rider**
   - Order pickup and delivery
   - Real-time location updates
   - Delivery status management

4. **Customer**
   - Branch selection
   - Order placement
   - Address management
   - Order tracking

## 🔐 Authentication

The system uses JWT (JSON Web Tokens) for secure authentication with role-based access control (RBAC) for different user types.


## 📝 License

[MIT License](LICENSE)

## 👤 Author

**taciturn2021**

---

*Last Updated: 2025-03-11 17:07:27*
