# FunQuizz Backend

A NestJS backend application for FunQuizz with PostgreSQL database, comprehensive validation, security features, and API documentation.

## Features

- **NestJS Framework** with TypeScript
- **PostgreSQL** database with TypeORM
- **Authentication & Authorization** ready structure
- **Input Validation** with class-validator and Zod
- **API Documentation** with Swagger
- **Security** with Helmet and CORS
- **Rate Limiting** with Throttler
- **Global Exception Handling**
- **Request/Response Logging**
- **Response Transformation**
- **Docker Support**

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
├── database/
│   └── entities/        # TypeORM entities
├── modules/
│   └── user/           # User module
│       ├── dto/        # User DTOs
│       ├── user.controller.ts
│       ├── user.service.ts
│       └── user.module.ts
├── app.module.ts
└── main.ts
```

## Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=funquizz

# Application
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10
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
