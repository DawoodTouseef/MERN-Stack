# Nexus Mart - MERN Stack E-Commerce Platform

A full-featured e-commerce platform built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring multi-vendor support, advanced product management, and modern UI/UX.

## 🚀 Features

### 🛍️ Core E-Commerce Features
- **Product Management**: Complete CRUD operations for products with variants, specifications, and media
- **Category & Brand Management**: Hierarchical category structure with brand associations
- **Shopping Cart**: Persistent cart with local storage integration
- **Order Management**: Complete order lifecycle from placement to delivery
- **Payment Integration**: PayPal payment gateway integration
- **User Authentication**: JWT-based authentication with role-based access control

### 👥 Multi-User System
- **Customer Portal**: Product browsing, wishlist, order tracking, profile management
- **Admin Dashboard**: User management, product oversight, order management, analytics
- **Vendor/Seller Portal**: Product listing, inventory management, order fulfillment
- **Multi-Role Support**: Customer, Admin, Vendor, Seller roles with specific permissions

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach with Material-UI components
- **Advanced Search**: Auto-suggest search with product filtering
- **Product Reviews**: Customer review and rating system
- **Wishlist & Recently Viewed**: Enhanced user experience features
- **Flash Sales**: Special promotional product sections

### 🔧 Advanced Features
- **Tax Management**: Configurable tax rules by location and product type
- **Address Management**: Multiple shipping addresses per user
- **Banner Management**: Dynamic promotional banners
- **Offer System**: Discount and promotional offer management
- **Real-time Updates**: Socket.io integration for live updates
- **File Upload**: Multer-based image and media upload system

## 🏗️ Project Structure

```
MERN-Stack/
├── backend/                    # Node.js/Express API
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/           # Route controllers
│   │   ├── userController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── categoryController.js
│   │   ├── brandController.js
│   │   ├── bannerController.js
│   │   ├── offerController.js
│   │   ├── taxController.js
│   │   ├── addressController.js
│   │   └── PagesController.js
│   ├── models/               # Mongoose schemas
│   │   ├── userModel.js
│   │   ├── productModel.js
│   │   ├── orderModel.js
│   │   ├── categoryModel.js
│   │   ├── BrandModel.js
│   │   ├── bannerModel.js
│   │   ├── offersModel.js
│   │   ├── taxModel.js
│   │   ├── AddressModel.js
│   │   ├── PageModel.js
│   │   └── tokenModel.js
│   ├── routes/               # API routes
│   ├── middlewares/          # Custom middleware
│   │   ├── authMiddleware.js
│   │   ├── asyncHandler.js
│   │   └── checkId.js
│   ├── utils/
│   │   └── createToken.js
│   └── index.js             # Server entry point
├── frontend/                # React application
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   │   ├── Admin/      # Admin dashboard pages
│   │   │   ├── Auth/       # Authentication pages
│   │   │   ├── Seller/     # Seller portal pages
│   │   │   ├── Vendor/     # Vendor portal pages
│   │   │   ├── User/       # User profile pages
│   │   │   ├── Products/   # Product-related pages
│   │   │   └── Orders/     # Order management pages
│   │   ├── redux/          # State management
│   │   │   ├── api/        # RTK Query API slices
│   │   │   ├── features/   # Redux slices
│   │   │   └── store.js    # Redux store configuration
│   │   ├── Utils/          # Utility functions
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # React entry point
│   ├── package.json
│   └── vite.config.js      # Vite configuration
├── package.json            # Root package.json
└── example-env.env         # Environment variables template
```

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **Socket.io** - Real-time communication
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Material-UI (MUI)** - Component library
- **Redux Toolkit** - State management
- **RTK Query** - Data fetching and caching
- **React Router** - Client-side routing
- **Framer Motion** - Animations
- **Axios** - HTTP client
- **React Toastify** - Notifications

### Additional Libraries
- **PayPal SDK** - Payment processing
- **ApexCharts** - Data visualization
- **React Slick** - Carousel components
- **Lodash** - Utility functions
- **Moment.js** - Date manipulation

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### 1. Clone the Repository
```bash
git clone <repository-url>
cd MERN-Stack
```

### 2. Environment Configuration
Create a `.env` file in the root directory based on `example-env.env`:

```env
PORT=5000
MONGODB_URL=mongodb://127.0.0.1:27017/huxnStore
JWT_SECRET=your_jwt_secret_key
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
PAYPAL_CLIENT_ID=your_paypal_client_id
```

### 3. Install Dependencies
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 4. Start the Application

#### Development Mode (Concurrent)
```bash
npm run dev
```
This starts both frontend and backend concurrently.

#### Separate Terminals
```bash
# Terminal 1 - Backend
npm run backend

# Terminal 2 - Frontend
npm run frontend
```

### 5. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5500
- **Admin Panel**: Login with admin credentials

## 📱 User Roles & Access

### Customer
- Browse products and categories
- Add items to cart and wishlist
- Place and track orders
- Write product reviews
- Manage profile and addresses

### Seller/Vendor
- Add and manage products
- View and fulfill orders
- Manage inventory
- Access sales analytics

### Admin
- Manage all users and roles
- Oversee all products and orders
- Manage categories, brands, and banners
- Configure tax rules and offers
- Access comprehensive analytics

## 🔐 Authentication & Security

- **JWT-based authentication** with secure token storage
- **Role-based access control** (RBAC)
- **Password hashing** with bcryptjs
- **Input validation** and sanitization
- **CORS protection** for cross-origin requests
- **Secure cookie handling** for authentication tokens

## 📊 Database Schema

### Key Models
- **User**: Authentication, profile, addresses, wishlist
- **Product**: Details, variants, specifications, reviews
- **Order**: Items, shipping, payment, status tracking
- **Category**: Hierarchical product categorization
- **Brand**: Product brand management
- **Tax**: Location and product-based tax rules

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or your preferred database
2. Configure environment variables for production
3. Deploy to platforms like Heroku, Railway, or DigitalOcean

### Frontend Deployment
1. Build the React application: `npm run build`
2. Deploy to platforms like Netlify, Vercel, or AWS S3

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Dawood Touseef**

## 🆘 Support

For support and questions, please open an issue in the repository or contact the development team.

---

**Note**: This is a comprehensive e-commerce platform suitable for learning MERN stack development and can be extended for production use with additional security measures and optimizations.