# Makefile for EVLinkHA Docker operations

.PHONY: help build up down logs restart clean config health

# Default target
help:
	@echo "EVLinkHA Docker Commands:"
	@echo "  make build     - Build all Docker images"
	@echo "  make up        - Start all services in background"
	@echo "  make down      - Stop all services"
	@echo "  make logs      - Show logs from all services"
	@echo "  make restart   - Restart all services"
	@echo "  make clean     - Stop services and remove volumes (⚠️  deletes data)"
	@echo "  make config    - Validate docker-compose.yml"
	@echo "  make health    - Check health status of all services"
	@echo ""
	@echo "Service-specific commands:"
	@echo "  make logs-backend   - Show backend logs"
	@echo "  make logs-frontend  - Show frontend logs"
	@echo "  make logs-postgres  - Show database logs"
	@echo "  make logs-redis     - Show Redis logs"
	@echo ""
	@echo "Development:"
	@echo "  make dev       - Start development environment"
	@echo "  make prod      - Start production environment"

# Build all images
build:
	docker compose build

# Start development environment
dev: build
	docker compose up -d
	@echo "🚀 EVLinkHA development environment started!"
	@echo "📱 Frontend: http://localhost:3000"
	@echo "🔧 Backend API: http://localhost:8000"
	@echo "📚 API Docs: http://localhost:8000/docs"

# Start production environment
prod:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
	@echo "🚀 EVLinkHA production environment started!"

# Start all services
up:
	docker compose up -d

# Stop all services
down:
	docker compose down

# Show logs from all services
logs:
	docker compose logs -f

# Show logs from specific services
logs-backend:
	docker compose logs -f backend

logs-frontend:
	docker compose logs -f frontend

logs-postgres:
	docker compose logs -f postgres

logs-redis:
	docker compose logs -f redis

# Restart all services
restart:
	docker compose restart

# Clean everything (⚠️ deletes volumes/data)
clean:
	docker compose down -v
	docker system prune -a --volumes -f
	@echo "🧹 All Docker resources cleaned!"

# Validate docker-compose.yml
config:
	docker compose config

# Check health status
health:
	docker compose ps