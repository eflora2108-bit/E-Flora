# eFlora - B2B-B2C Nursery Marketplace

A verified online marketplace connecting plant nurseries with customers. Features supplier verification, product moderation, real-time inventory management, and automated GST-compliant invoicing.

## Features

- **Verified Suppliers**: Mandatory verification before selling
- **Product Moderation**: Admin approval required for all listings
- **Inventory Management**: Real-time stock tracking with transaction safety
- **Order Management**: Complete order lifecycle with status tracking
- **Invoice Generation**: Automated GST-compliant invoices (CGST/SGST/IGST)
- **Role-Based Access**: Customer, Supplier, and Admin roles
- **Payment Integration**: Razorpay payment gateway
- **Reviews & Ratings**: Customer feedback system

## Tech Stack

### Backend
- Node.js + Express + TypeScript
- PostgreSQL (with connection pooling)
- JWT Authentication
- Razorpay Payment Gateway
- PDFKit for invoice generation
- Nodemailer for emails

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- React Router (routing)
- Axios (HTTP client)
- React Hook Form (forms)
- Tailwind CSS (styling)
- Zustand (state management)

### Infrastructure
- Docker & Docker Compose
- Redis (caching & sessions)
- GitHub Actions (CI/CD)

## Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Docker & Docker Compose (optional, for containerized development)
- Redis (optional, for caching)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd E-Flora
```

### 2. Setup Environment Variables

**Backend:**
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
```

**Frontend:**
```bash
cd frontend
cp .env.example .env
# Edit .env with your configuration
```

### 3. Option A: Local Development (Without Docker)

#### Backend Setup

```bash
cd backend
npm install

# Create PostgreSQL database
createdb eflora_db

# Run migrations
psql -U postgres -d eflora_db -f migrations/001_initial_schema.sql

# Start development server
npm run dev
```

Backend will run on `http://localhost:5000`

#### Frontend Setup

```bash
cd frontend
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:3000`

### 4. Option B: Docker Development (Recommended)

```bash
# Create .env file in root directory
cp backend/.env.example .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

### 5. Seed Database (Optional)

```bash
cd backend
npm run seed
```

This creates:
- Default admin user
- Sample categories
- Sample products (if admin user exists)

## Project Structure

```
E-Flora/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Helper functions
│   │   └── server.ts       # Entry point
│   ├── migrations/         # Database migrations
│   ├── seeds/             # Seed data
│   ├── tests/             # Unit & integration tests
│   └── uploads/           # File uploads (local dev)
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/        # Page components
│   │   ├── contexts/     # React contexts
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # API services
│   │   ├── utils/        # Utilities
│   │   └── main.tsx      # Entry point
│   └── public/           # Static assets
└── docker-compose.yml    # Docker configuration
```

## API Documentation

Once the backend is running, API documentation is available at:
- Swagger UI: `http://localhost:5000/api-docs`

## Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run tests with UI
npm run test:ui
```

## Database Migrations

### Create a new migration

```bash
cd backend
npm run migrate:create <migration_name>
```

### Run migrations

```bash
npm run migrate
```

## Deployment

### Production Build

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Serve the dist folder with nginx or serve
```

### Docker Production

```bash
# Build and run production containers
docker-compose -f docker-compose.prod.yml up -d
```

## Environment Variables

### Backend Required Variables

- `DB_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - JWT secret key (min 32 chars)
- `RAZORPAY_KEY_ID` - Razorpay key ID
- `RAZORPAY_KEY_SECRET` - Razorpay secret

### Frontend Required Variables

- `VITE_API_BASE_URL` - Backend API URL
- `VITE_RAZORPAY_KEY_ID` - Razorpay public key

## Key Workflows

### Supplier Onboarding
1. Register as supplier
2. Complete business profile
3. Upload verification documents (GSTIN, PAN, license)
4. Admin reviews and approves/rejects
5. Access supplier dashboard
6. Add products (requires admin approval)

### Customer Order Flow
1. Browse approved products
2. Add to cart
3. Checkout (select address, review order)
4. Payment via Razorpay
5. Order confirmation
6. Invoice generated and emailed
7. Track order status
8. Delivery confirmation

### Admin Workflows
- Verify supplier documents
- Moderate product listings
- Manage orders
- View analytics and reports
- Manage users and permissions

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT authentication with refresh tokens
- Role-based access control (RBAC)
- SQL injection prevention (parameterized queries)
- XSS protection (input sanitization)
- Rate limiting (100 requests/15 minutes)
- HTTPS in production
- Payment webhook signature verification

## Performance Optimizations

- Database connection pooling
- Query optimization with indexes
- Response caching with Redis
- Image optimization and lazy loading
- CDN for static assets (production)

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License

## Support

For issues and questions:
- GitHub Issues: <repository-url>/issues
- Email: support@eflora.com

## Roadmap

- [ ] Phase 1: Foundation & Authentication ✅
- [ ] Phase 2: Supplier Verification
- [ ] Phase 3: Product Management
- [ ] Phase 4: Cart & Checkout
- [ ] Phase 5: Payment Integration
- [ ] Phase 6: Order Management
- [ ] Phase 7: Invoice System
- [ ] Phase 8: Admin Dashboard
- [ ] Phase 9: Reviews & Wishlist
- [ ] Phase 10: Deployment & CI/CD

---

**Built with ❤️ for the plant community**
