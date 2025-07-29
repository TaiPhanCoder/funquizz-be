# FunQuizz Backend

A NestJS backend application for FunQuizz with PostgreSQL database, comprehensive validation, security features, and API documentation.

## Features

- **NestJS Framework** - Modern Node.js framework
- **PostgreSQL Database** - Robust relational database
- **Redis Cache** - In-memory data structure store
- **TypeORM** - Database ORM with migrations
- **Repository Pattern** - Clean separation of data access logic
- **Swagger Documentation** - Auto-generated API docs
- **Docker Support** - Containerized development and deployment
- **Authentication** - JWT-based auth with OTP verification
- **Email Service** - Nodemailer integration for OTP emails
- **Security** - Helmet, CORS, rate limiting
- **Logging & Monitoring** - Request/response logging
- **Modular Configuration** - Organized config modules

## Prerequisites

- Node.js 18+
- Docker and Docker Compose
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration

## Database Setup

### Using Docker (Recommended for Development)

1. Start PostgreSQL container:
   ```bash
   npm run db:dev
   ```

2. Stop PostgreSQL container:
   ```bash
   npm run db:dev:stop
   ```

3. View database logs:
   ```bash
   npm run db:dev:logs
   ```

## Running the Application

### Development Mode

1. Start the database:
   ```bash
   npm run db:dev
   ```

2. Start the application:
   ```bash
   npm run start:dev
   ```

3. Access the application:
   - API: http://localhost:3000/api
   - Swagger Documentation: http://localhost:3000/api/docs

### Production Mode with Docker

1. Build and start all services:
   ```bash
   npm run docker:up
   ```

2. Stop all services:
   ```bash
   npm run docker:down
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with OTP
- `POST /api/auth/change-password` - Change password (authenticated)
- `POST /api/auth/verify-email` - Verify email with OTP
- `POST /api/auth/resend-verification` - Resend verification OTP

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Project Structure

```
src/
├── common/
│   ├── filters/          # Global exception filters
│   ├── interceptors/     # Global interceptors
│   ├── decorators/       # Custom decorators
│   └── dtos/            # Common DTOs
├── config/              # Configuration files
│   ├── app.config.ts    # Application configuration
│   ├── database.config.ts # Database configuration
│   ├── redis.config.ts  # Redis configuration
│   ├── typeorm.config.ts # TypeORM module configuration
│   ├── throttler.config.ts # Rate limiting configuration
│   └── redis.module.ts  # Redis module
├── database/
│   └── entities/        # TypeORM entities
├── modules/
│   ├── auth/           # Authentication module
│   │   ├── dto/        # Auth DTOs
│   │   ├── guards/     # Auth guards
│   │   ├── strategies/ # Passport strategies
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   └── otp.repository.ts
│   └── user/           # User module
│       ├── dto/        # User DTOs
│       ├── user.controller.ts
│       ├── user.service.ts
│       ├── user.repository.ts # Data access layer
│       └── user.module.ts
├── app.module.ts
└── main.ts
```

## Environment Variables

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=funquizz

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Application Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Rate Limiting Configuration
THROTTLE_TTL=60
THROTTLE_LIMIT=10

# Mailer Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@funquizz.com
MAIL_FROM_NAME=FunQuizz
```

## Available Scripts

- `npm run start:dev` - Start development server
- `npm run build` - Build the application
- `npm run start:prod` - Start production server
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run db:dev` - Start PostgreSQL for development
- `npm run docker:up` - Start all services with Docker

## Security Features

- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Request throttling
- **Input Validation** - Request validation
- **Password Hashing** - bcrypt for password security

## Development Guidelines

1. Follow NestJS best practices
2. Use TypeScript strictly
3. Implement proper error handling
4. Add Swagger documentation for all endpoints
5. Write unit tests for services
6. Use environment variables for configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the UNLICENSED License.
