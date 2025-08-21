# Docker Setup for EVLinkHA

This guide explains how to run EVLinkHA using Docker and docker-compose for local development.

## Prerequisites

- Docker (version 20.10 or later)
- Docker Compose (version 2.0 or later)
- Git

## Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rogasp/evlink-backend.git
   cd evlink-backend
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.docker .env
   # Edit .env with your actual API keys and configuration
   ```

3. **Start all services**:
   ```bash
   docker-compose up -d
   ```

4. **Access the applications**:
   - Frontend (Next.js): http://localhost:3000
   - Backend API (FastAPI): http://localhost:8000
   - API Documentation: http://localhost:8000/docs
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379

## Services Overview

The docker-compose.yml includes the following services:

### 🗄️ postgres
- **Image**: postgres:15-alpine
- **Port**: 5432
- **Purpose**: Local PostgreSQL database (replaces Supabase for development)
- **Credentials**: postgres/postgres

### 🚀 redis
- **Image**: redis:7-alpine
- **Port**: 6379
- **Purpose**: Caching and SMS verification storage

### 🔧 backend
- **Build**: ./backend/Dockerfile
- **Port**: 8000
- **Purpose**: FastAPI backend with hot reload
- **Health check**: Available

### 🌐 frontend
- **Build**: ./frontend/Dockerfile
- **Port**: 3000
- **Purpose**: Next.js frontend with hot reload
- **Health check**: Available

## Environment Configuration

### Required Variables

For basic functionality, you'll need:

```bash
# Enode API (required for EV integration)
ENODE_CLIENT_ID=your_client_id
ENODE_CLIENT_SECRET=your_client_secret

# Database (automatically configured for Docker)
SUPABASE_URL=postgresql://postgres:postgres@postgres:5432/evlink
```

### Optional Variables

For full functionality:

```bash
# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Twilio (for SMS verification)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token

# Email services
RESEND_API_KEY=your_resend_key
BREVO_API_KEY=your_brevo_key
```

## Docker Commands

### Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart a service
docker-compose restart backend

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose down -v
```

### Building

```bash
# Rebuild all images
docker-compose build

# Rebuild specific service
docker-compose build backend

# Force rebuild without cache
docker-compose build --no-cache
```

### Database Operations

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d evlink

# View database logs
docker-compose logs postgres

# Backup database
docker-compose exec postgres pg_dump -U postgres evlink > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres -d evlink < backup.sql
```

### Redis Operations

```bash
# Connect to Redis CLI
docker-compose exec redis redis-cli

# View Redis logs
docker-compose logs redis
```

## Development Workflow

### Making Code Changes

1. **Backend changes**: The backend container uses volume mounting with hot reload
   - Edit files in `./backend/`
   - Changes are automatically detected and the server restarts

2. **Frontend changes**: The frontend container uses volume mounting with hot reload
   - Edit files in `./frontend/`
   - Changes are automatically detected and the page reloads

### Adding Dependencies

**Backend (Python)**:
```bash
# Add to requirements.txt, then rebuild
docker-compose build backend
docker-compose up -d backend
```

**Frontend (Node.js)**:
```bash
# Update package.json, then rebuild
docker-compose build frontend
docker-compose up -d frontend
```

## Troubleshooting

### Common Issues

1. **Port already in use**:
   ```bash
   # Check what's using the port
   lsof -i :3000
   lsof -i :8000
   
   # Kill the process or change ports in docker-compose.yml
   ```

2. **Database connection issues**:
   ```bash
   # Check if postgres is healthy
   docker-compose ps
   docker-compose logs postgres
   
   # Reset database
   docker-compose down
   docker volume rm evlink-backend_postgres_data
   docker-compose up -d
   ```

3. **Build failures**:
   ```bash
   # Clean build
   docker-compose down
   docker system prune -a
   docker-compose build --no-cache
   ```

### Health Checks

All services include health checks. Check status:

```bash
docker-compose ps
```

Healthy services show "healthy" status.

## Production Considerations

This docker-compose.yml is designed for **development only**. For production:

1. Use environment-specific configurations
2. Use external managed databases (e.g., Supabase, AWS RDS)
3. Use production-grade Redis (e.g., AWS ElastiCache)
4. Implement proper secrets management
5. Use reverse proxy (nginx, traefik)
6. Enable SSL/TLS
7. Configure proper logging and monitoring

## Network Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │
│   (Next.js)     │◄──►│   (FastAPI)     │
│   Port: 3000    │    │   Port: 8000    │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┼─────────────────┐
                                 │                 │
                    ┌─────────────────┐  ┌─────────────────┐
                    │   PostgreSQL    │  │     Redis       │
                    │   Port: 5432    │  │   Port: 6379    │
                    └─────────────────┘  └─────────────────┘
```

All services communicate through the `evlink-network` Docker network.

## Support

For issues with the Docker setup:

1. Check the [troubleshooting section](#troubleshooting)
2. Review logs: `docker-compose logs`
3. Open an issue on GitHub with full error details