# Financial Planning System

## Overview

This is a full-stack personal financial management application built with React, Express, and PostgreSQL. The system enables users to track income, expenses, and budgets through an intuitive dashboard interface. It features a modern UI built with shadcn/ui components and provides comprehensive financial analytics including loan assessment capabilities. The application is designed as a single-page application with a RESTful API backend and supports real-time data visualization through charts and graphs.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on top of Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation schemas
- **Charts**: Recharts for data visualization components

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **Database ORM**: Drizzle ORM with type-safe database operations
- **Validation**: Zod schemas shared between frontend and backend
- **Error Handling**: Centralized error middleware with structured error responses

### Data Storage Solutions
- **Primary Database**: PostgreSQL using Neon serverless database
- **Connection Pooling**: @neondatabase/serverless with WebSocket support
- **Schema Management**: Drizzle Kit for migrations and schema synchronization
- **Data Models**: Strongly typed entities for users, income records, expense records, and budgets

### Database Schema Design
- **Users Table**: Basic user authentication structure
- **Income Records**: Categorized income tracking with types (salary, investment, business)
- **Expense Records**: Detailed expense tracking with categories and descriptions
- **Budgets**: Budget management with period-based allocation
- **Relationships**: Foreign key relationships linking all financial data to users

### Authentication & Authorization
- **Demo Mode**: Currently uses a hardcoded demo user ID for development
- **Session Management**: Prepared for session-based authentication with connect-pg-simple
- **Security**: Input validation through Zod schemas and parameterized queries

### Development & Build Pipeline
- **Development Server**: Vite dev server with HMR and Express API proxy
- **Production Build**: Static asset compilation with server-side bundling via esbuild
- **Environment Configuration**: Environment-based configuration for database connections
- **Code Quality**: TypeScript strict mode with comprehensive type checking

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL database with connection pooling
- **Drizzle ORM**: Type-safe database operations and schema management

### Frontend Libraries
- **Radix UI**: Headless UI component primitives for accessibility
- **TanStack Query**: Server state management and caching
- **Recharts**: React charting library for financial data visualization
- **React Hook Form**: Form state management with performance optimization
- **Wouter**: Minimalist routing for single-page applications

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Static type checking and enhanced developer experience
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Zod**: Runtime type validation and schema definition

### Build & Deployment
- **esbuild**: Fast JavaScript bundler for production server builds
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer
- **ESLint**: Code linting and formatting (configured for TypeScript/React)