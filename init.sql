-- Create database if not exists
SELECT 'CREATE DATABASE funquizz'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'funquizz')\gexec

-- Connect to the database
\c funquizz;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (will be created by TypeORM, this is just for reference)
-- CREATE TABLE IF NOT EXISTS users (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   email VARCHAR(255) UNIQUE NOT NULL,
--   password VARCHAR(255) NOT NULL,
--   "firstName" VARCHAR(255) NOT NULL,
--   "lastName" VARCHAR(255) NOT NULL,
--   "isActive" BOOLEAN DEFAULT true,
--   "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );