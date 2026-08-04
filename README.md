# Food Delivery Web Application (Work In Progress)
## DEPLOYED AT 
[Deployment](https://bit.ly/3IzQgvP)
## SHOWCASE
[Food Delivery App Demo Youtube](https://www.youtube.com/watch?v=Ieu_6uhlZhc)
## TO-DO
- Fix bugs
- security testing on backend endpoints
- remove placeholders and add QOL features for branch and admin panels


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
# Create the backend environment file from the example
cd backend
cp .env.example .env

# Set the supplied database credentials in backend/.env.
# For local development use:
#   PORT=5001
#   NODE_ENV=development
#   FRONTEND_URL=http://localhost:3000

# Configure the web frontend
cd ../frontend
cp .env.example .env
# VITE_API_URL=http://localhost:5001/fooddelivery/api
# VITE_PORT=3000

# Configure the rider app
cd ../riderApp
cp .env.example .env
# API_BASE_URL=http://localhost:5001/fooddelivery/api
```

4. Start the applications:
```bash
# Start the backend server (terminal 1)
cd backend
npm run dev

# Start the frontend application (terminal 2)
cd frontend
npm run dev

# For rider app development (terminal 3)
cd riderApp
npm start
```

Note: The database tables will be automatically initialized on first startup of the backend server.

The web app is available at `http://localhost:3000` and the backend API at
`http://localhost:5001/fooddelivery/api`. If the rider app runs on a physical
device, replace `localhost` in `riderApp/.env` with the development machine's
LAN IP. For an Android emulator, use `http://10.0.2.2:5001/fooddelivery/api`.


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
