# Technical Test: React JS and Go (CRUD)
## Project Overview
This project is a full-stack application built using React JS for the frontend and Go for the backend. The application allows for managing users and products with the following functionalities:
- User Management: Create, read, update, and delete user data (name and email).
- Product Management: Create, read, update, and delete product information (name, price, and stock).
- State Management: Uses a state management system to handle application data and user sessions.
- Authentication: Implemented JWT-based authentication for secure login.
- Backend API: The backend is built using Go and serves data via GraphQL.
- Database: MongoDB is used to store and search user and product data.

## Features
1. User Management
- Add a user with name and email.
- Display a list of users.
- Edit user details.
- Delete a user from the system.

2. Product Management
- Add a product with name, price, and stock.
- View a list of products.
- Edit product details.
- Remove a product from the system.

3. JWT Authentication
- Users must log in with their credentials to access the application.
- JWT (JSON Web Tokens) is used for secure authentication.

4. Backend with Go & GraphQL
- The backend API is built using Go and exposes GraphQL endpoints for interacting with user and product data.

5. MongoDB
- MongoDB is used to store both user and product data.
- MongoDB allows for efficient searching and management of data.

6. React JS Frontend
- The frontend is developed using React JS.
- State management is implemented to handle the application data efficiently.
- JWT tokens are stored in local storage to manage user sessions.

## Technologies Used
- Frontend: React JS, Axios (for API calls), React Router (for navigation)
- Backend: Go, GraphQL
- Database: MongoDB
- Authentication: JWT (JSON Web Token)
- State Management: React Context API


## Installation
1. Clone the Repository
```
git clone https://github.com/your-username/technical-test-react-go.git
cd technical-test-react-go
```

2. Backend Setup
Install Go dependencies:
```
cd backend
go mod tidy
```

Run the Go server:
```
go run main.go
```
The backend will be available on http://localhost:8080.

3. Frontend Setup
Install Node.js dependencies:
```
cd frontend
npm install
```
Run the React application:
```
npm start
```
The frontend will be available on http://localhost:3000.

## Usage
- Open the application in your browser (http://localhost:3000).
- Log in with your credentials (JWT token will be stored in local storage).
- Manage users and products using the provided interfaces:
- User Management: Add, edit, and delete users.
- Product Management: Add, edit, and delete products.