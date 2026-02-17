# Livestock360 - Digital Livestock & Farm Product Management System

Livestock360 is a comprehensive bilingual (English/Tamil) web application designed to bridge the gap between farmers and customers. It empowers farmers to manage their livestock, milk production, staff, and product sales efficiently while providing customers with a seamless platform to purchase fresh farm products directly from local sources.

## 🚀 Features

### 👨‍🌾 For Farmers
- **Dashboard**: Comprehensive farm management dashboard with real-time statistics (livestock count, products listed, daily milk production, farm size)
- **Livestock Management**: Add, update, and track livestock inventory (Cows, Buffaloes, Goats, Sheep, Poultry)
- **Milk Production Tracking**: Log daily milk yields with date tracking and view historical production data
- **Product Management**: List and manage farm products for sale (Milk, Eggs, Meat, Dairy products, etc.) with pricing, quantity, and category management
- **Staff Management**: Manage farm staff records with salary tracking and payment status
- **Sales Reports**: Generate comprehensive sales reports with revenue breakdowns, expense tracking, and profit analysis
- **Notifications**: Real-time notifications for new orders with mark-as-done and delete options
- **Profile Management**: Update farm and personal details
- **Bilingual Support**: Full interface available in English and Tamil

### 🛒 For Customers
- **Product Browsing**: Browse fresh farm products by category with detailed information
- **Smart Cart**: Add products with fractional quantities (e.g., 0.5 kg/L) with real-time price calculation
- **Product Reviews**: Rate and review purchased products (optional comments)
- **Order Management**: View order history with detailed item breakdowns
- **Location-Based Filtering**: Products automatically filtered by customer's city
- **Secure Authentication**: Dedicated login and registration system
- **Bilingual Interface**: Switch between English and Tamil seamlessly

### 🎨 UI/UX Features
- **Dark Mode**: System-wide dark theme support with smooth transitions
- **Responsive Design**: Mobile-first design optimized for all screen sizes
- **Modern Aesthetics**: Glassmorphism effects, smooth animations, and vibrant color palettes
- **Accessibility**: Intuitive navigation with clear visual feedback

## 🛠️ Technology Stack

**MERN Stack**:
- **MongoDB**: NoSQL database for flexible data storage with Mongoose ODM
- **Express.js**: Backend web application framework with RESTful API design
- **React.js**: Frontend library with Hooks and modern component patterns
- **Node.js**: JavaScript runtime environment for the server

**Frontend Technologies**:
- **React Router**: Client-side routing and navigation
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Heroicons**: Beautiful hand-crafted SVG icons
- **react-i18next**: Internationalization framework for bilingual support
- **Axios**: Promise-based HTTP client for API calls
- **jsPDF & jsPDF-AutoTable**: PDF generation for reports
- **Chart.js & react-chartjs-2**: Data visualization for analytics
- **React Toastify**: Toast notifications for user feedback

**Backend Technologies**:
- **JWT**: JSON Web Tokens for secure authentication
- **bcrypt**: Password hashing for security
- **node-cron**: Scheduled tasks for keep-alive pings
- **CORS**: Cross-Origin Resource Sharing configuration

## 📦 Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/) (Local installation or Atlas URI)
- Git for version control

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Livestock360
```

### 2. Backend Setup

Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory with the following variables:
```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
BACKEND_URL=http://localhost:4000
```

Start the backend server:
```bash
nodemon server.js
```
*The server will run on `http://localhost:4000`*

### 3. Frontend Setup

Navigate to the client directory and install dependencies:
```bash
cd ../client
npm install
```

Start the React development server:
```bash
npm run dev
```
*The client will run on `http://localhost:5173` (Vite default)*

## 📁 Project Structure

```
Livestock360/
├── client/                 # React frontend application
│   ├── public/            # Static assets and PWA manifest
│   ├── src/
│   │   ├── assets/        # Images and media files
│   │   ├── components/    # Reusable React components
│   │   ├── contexts/      # React Context providers (Auth, Theme)
│   │   ├── locales/       # i18n translation files (en, ta)
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   └── App.js         # Main application component
│   └── package.json
│
├── server/                # Express backend application
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Custom middleware (auth, etc.)
│   ├── models/           # Mongoose data models
│   ├── routes/           # API route definitions
│   ├── server.js         # Server entry point
│   └── package.json
│
└── README.md
```

## 🔗 API Documentation

The API runs on `http://localhost:4000/api`. Key endpoints include:

### Authentication
- `POST /api/farmers/login` - Farmer login
- `POST /api/farmers/register` - Farmer registration
- `POST /api/customers/login` - Customer login
- `POST /api/customers/register` - Customer registration

### Farmers (Protected)
- `GET /api/farmers/profile` - Get farmer profile
- `PUT /api/farmers/profile` - Update farmer profile
- `GET /api/farmers/dashboard-stats` - Get dashboard statistics

### Livestock (Protected)
- `GET /api/livestock` - Get all livestock
- `POST /api/livestock` - Add new livestock
- `PUT /api/livestock/:id` - Update livestock
- `DELETE /api/livestock/:id` - Delete livestock

### Products (Protected/Public)
- `GET /api/products` - Get all products (with filters)
- `POST /api/products` - Add new product (Farmer only)
- `PUT /api/products/:id` - Update product (Farmer only)
- `DELETE /api/products/:id` - Delete product (Farmer only)

### Milk Production (Protected)
- `GET /api/milk-production` - Get milk production records
- `POST /api/milk-production` - Add milk production entry

### Orders (Protected)
- `POST /api/orders` - Create new order
- `GET /api/orders/my-orders` - Get customer's orders
- `GET /api/orders/farmer-orders` - Get farmer's orders

### Reviews (Protected/Public)
- `POST /api/reviews` - Submit product review
- `GET /api/reviews/:productId` - Get product reviews

### Notifications (Protected)
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `DELETE /api/notifications/:id` - Delete notification

### Staff (Protected)
- `GET /api/staff` - Get all staff
- `POST /api/staff` - Add staff member
- `PUT /api/staff/:id` - Update staff
- `DELETE /api/staff/:id` - Delete staff

### Reports (Protected)
- `GET /api/reports/monthly?month=X&year=Y` - Get monthly financial report

## 🌍 Internationalization

The application supports two languages:
- **English (en)**: Default language
- **Tamil (ta)**: Full Tamil translation

Translation files are located in `client/src/locales/`. The language switcher is accessible from the navigation bar.

## 🔐 Security Features

- JWT-based authentication with secure token storage
- Password hashing using bcrypt
- Protected routes with middleware authentication
- Input validation and sanitization
- CORS configuration for secure cross-origin requests

## 📱 Progressive Web App (PWA)

Livestock360 is PWA-ready with:
- Custom app manifest
- Offline capability (future enhancement)
- Installation prompt for mobile devices

## 🎨 Theming

- **Light Mode**: Default clean and bright theme
- **Dark Mode**: Eye-friendly dark theme with smooth transitions
- Theme preference persisted in localStorage

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Developers

Developed with ❤️ by :
                     Sujith K
                     Sheguvara A
                     Sririthanya S P
## 🐛 Known Issues

- Port 4000 may occasionally need to be manually cleared on Windows (`taskkill /F /IM node.exe`)
- PDF reports are generated in English only to avoid font rendering issues with Tamil characters

## 🔄 Recent Updates

- ✅ Added bilingual support (English/Tamil)
- ✅ Implemented notification system with actions
- ✅ Added product review system with optional comments
- ✅ Enhanced dashboard with real-time statistics
- ✅ Implemented dark mode with theme persistence
- ✅ Added fractional quantity support for cart items
- ✅ Improved mobile responsiveness across all pages
