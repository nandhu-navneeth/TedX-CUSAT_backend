# TEDx Backend Platform

This is a robust backend for a TEDx event platform, built with Node.js, Express, and MongoDB. It features a role-based access control system for Organizers, Speakers, and Attendees, and includes a complete talk submission and management system.

## Features

- **User Authentication**: Secure user registration and login with JWT-based authentication. Includes both email/password and Google OAuth2.
- **Role-Based Access Control (RBAC)**:
  - **Organizer**: Can manage all aspects of the platform, including talks and users.
  - **Speaker**: Can submit and manage their talk proposals.
  - **Attendee**: Can view approved talks and event information.
- **Talk Management**: A full CRUD API for submitting, reviewing, approving, and rejecting talks.
- **Solid & Scalable Architecture**: Built with a clear and organized structure that is easy to maintain and extend.

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JSON Web Tokens (JWT), Passport.js for Google OAuth
- **Validation**: express-validator
- **Development**: nodemon for automatic server restarts

## Prerequisites

- Node.js and npm
- MongoDB (local instance or a cloud service like MongoDB Atlas)
- Google OAuth2 Credentials (Client ID and Client Secret) from the Google Cloud Console.

## Setup & Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/nandhu-navneeth/TedX-CUSAT_backend
    cd tedx-backend
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Create a `.env` file** in the root of the project and add the following variables:
    ```
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_super_secret_jwt_key
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    PORT=5000
    ```

## Running the Application

- **Development Mode** (with auto-reloading):

  ```bash
  npm run dev
  ```

- **Production Mode**:
  ```bash
  npm start
  ```

The server will start on the port specified in your `.env` file (defaults to 5000).

## API Documentation

### Auth Routes

Base URL: `/api/auth`

| Method | Endpoint           | Description                                      | Access    |
| ------ | ------------------ | ------------------------------------------------ | --------- |
| POST   | `/signup`          | Register a new user.                             | Public    |
| POST   | `/login`           | Login an existing user and get a JWT.            | Public    |
| GET    | `/me`              | Get the profile of the currently logged-in user. | Private   |
| GET    | `/google`          | Initiates Google OAuth2 authentication.          | Public    |
| GET    | `/google/callback` | Google OAuth2 callback URL.                      | Public    |
| GET    | `/admin`           | A protected route for organizers.                | Organizer |

**POST `/signup`**

Body:

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "role": "speaker" // 'attendee', 'speaker', or 'organizer' (optional, defaults to 'attendee')
}
```

### Talk Routes

Base URL: `/api/talks`

| Method | Endpoint | Description                                                            | Access                          |
| ------ | -------- | ---------------------------------------------------------------------- | ------------------------------- |
| POST   | `/`      | Submit a new talk.                                                     | Speaker                         |
| GET    | `/`      | Get talks (all for organizers, own for speakers, approved for others). | Private                         |
| GET    | `/:id`   | Get a single talk by its ID.                                           | Private                         |
| PUT    | `/:id`   | Update a talk.                                                         | Owner (if pending) or Organizer |
| DELETE | `/:id`   | Delete a talk.                                                         | Owner (if pending) or Organizer |

**POST `/` (Submit a talk)**

Headers: `x-auth-token: <your_jwt>`
Body:

```json
{
  "title": "The Future of Technology",
  "abstract": "A deep dive into the future of AI and its impact on society.",
  "duration": 20, // in minutes
  "notes": "Requires a projector and a microphone."
}
```

**PUT `/:id` (Update talk status - Organizer only)**

Headers: `x-auth-token: <your_jwt>`
Body:

```json
{
  "status": "approved" // 'pending', 'approved', or 'rejected'
}
```
