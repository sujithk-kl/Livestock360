# Livestock360 - Digital Livestock & Farm Product Management System

Livestock360 is a comprehensive web application designed to bridge the gap between farmers and customers. It empowers farmers to manage their livestock, milk production, and produce sales efficiently while providing customers with a seamless platform to purchase fresh farm products.

## 🚀 Features

### 👨‍🌾 For Farmers
- **Dashboard**: A central hub for farm management insights using charts and summaries.
- **Livestock Management**: Add, update, and track livestock inventory (Cows, Buffaloes, Goats, Sheep, Poultry).
- **Milk Production Tracking**: Log daily milk yields and view historical production data.
- **Product Management**: List and manage farm products for sale (Milk, Eggs, Meat, etc.).
- **Staff Management**: Manage farm staff records and attendance (In progress).
- **Reports**: Generate reports for milk production, sales, and profit analysis.

### 🛒 For Customers
- **Product Browsing**: Browse fresh farm products with details on quality and price.
- **Shopping Cart**: Add products to a cart for purchase.
- **Order History**: View past orders (Future implementation).
- **Secure Authentication**: Dedicated login and registration for customers.

## 🛠️ Technology Stack

**MERN Stack**:
- **MongoDB**: NoSQL database for flexible data storage.
- **Express.js**: Backend web application framework.
- **React.js**: Frontend library for building user interfaces.
- **Node.js**: JavaScript runtime environment for the server.

**Styling**:
- **Tailwind CSS**: Utility-first CSS framework for modern, responsive design.

## 📦 Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/) (Local or AtlasURI)

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
```
Start the backend server:
```bash
npm run server
```

### 3. Frontend Setup
Navigate to the client directory and install dependencies:
```bash
cd ../client
npm install
```
Start the React development server:
```bash
npm start
```

## 🔗 API Documentation
The API runs on `http://localhost:4000/api`. Key endpoints include:
- `AUTH`: `/api/farmers/login`, `/api/customers/login`
- `LIVESTOCK`: `/api/livestock`
- `PRODUCTS`: `/api/products`
- `MILK`: `/api/milk-production`

## 🤝 Contributing
Contributions are welcome! Please fork the repository and submit a pull request for any enhancements.
