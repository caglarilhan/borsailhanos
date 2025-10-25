#!/bin/bash

# BIST AI Smart Trader - Master Start Script
# Starts all services with proper order and health checks

set -e

# Configuration
BACKEND_PORT=8000
REALTIME_PORT=8081
HEALTH_PORT=8001
FRONTEND_PORT=3000
GRAFANA_PORT=3010
WATCHLIST_PORT=8002
NOTIFICATION_PORT=8003
MONITORING_PORT=8004

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✅${NC} $1"
}

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️${NC} $1"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ❌${NC} $1"
}

info() {
    echo -e "${CYAN}[$(date '+%Y-%m-%d %H:%M:%S')] ℹ️${NC} $1"
}

# Create necessary directories
create_directories() {
    log "Creating necessary directories..."
    mkdir -p logs
    mkdir -p pids
    mkdir -p ai/models
    mkdir -p data/cache
    success "Directories created"
}

# Check if port is available
check_port() {
    local port=$1
    local service_name=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        warning "$service_name port $port is already in use"
        return 1
    else
        info "$service_name port $port is available"
        return 0
    fi
}

# Wait for service to be ready
wait_for_service() {
    local port=$1
    local service_name=$2
    local max_attempts=30
    local attempt=0
    
    log "Waiting for $service_name to be ready on port $port..."
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s -f "http://localhost:$port" >/dev/null 2>&1; then
            success "$service_name is ready!"
            return 0
        fi
        
        attempt=$((attempt + 1))
        sleep 2
        echo -n "."
    done
    
    error "$service_name failed to start after $max_attempts attempts"
    return 1
}

# Start Backend Service
start_backend() {
    log "Starting Backend Service..."
    
    if ! check_port $BACKEND_PORT "Backend"; then
        warning "Backend port $BACKEND_PORT is in use, skipping..."
        return 0
    fi
    
    cd backend
    python3 comprehensive_backend.py &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../pids/backend.pid
    cd ..
    
    if wait_for_service $BACKEND_PORT "Backend"; then
        success "Backend started successfully (PID: $BACKEND_PID)"
    else
        error "Backend failed to start"
        return 1
    fi
}

# Start Realtime Service
start_realtime() {
    log "Starting Realtime Service..."
    
    if ! check_port $REALTIME_PORT "Realtime"; then
        warning "Realtime port $REALTIME_PORT is in use, skipping..."
        return 0
    fi
    
    cd backend
    python3 realtime_server.py &
    REALTIME_PID=$!
    echo $REALTIME_PID > ../pids/realtime.pid
    cd ..
    
    if wait_for_service $REALTIME_PORT "Realtime"; then
        success "Realtime started successfully (PID: $REALTIME_PID)"
    else
        error "Realtime failed to start"
        return 1
    fi
}

# Start Health Check Service
start_health() {
    log "Starting Health Check Service..."
    
    if ! check_port $HEALTH_PORT "Health Check"; then
        warning "Health Check port $HEALTH_PORT is in use, skipping..."
        return 0
    fi
    
    cd backend
    python3 health_check.py &
    HEALTH_PID=$!
    echo $HEALTH_PID > ../pids/health.pid
    cd ..
    
    if wait_for_service $HEALTH_PORT "Health Check"; then
        success "Health Check started successfully (PID: $HEALTH_PID)"
    else
        error "Health Check failed to start"
        return 1
    fi
}

# Start Watchlist Service
start_watchlist() {
    log "Starting Watchlist Service..."
    
    if ! check_port $WATCHLIST_PORT "Watchlist"; then
        warning "Watchlist port $WATCHLIST_PORT is in use, skipping..."
        return 0
    fi
    
    cd backend/db
    python3 watchlist_crud.py &
    WATCHLIST_PID=$!
    echo $WATCHLIST_PID > ../../pids/watchlist.pid
    cd ../..
    
    if wait_for_service $WATCHLIST_PORT "Watchlist"; then
        success "Watchlist started successfully (PID: $WATCHLIST_PID)"
    else
        error "Watchlist failed to start"
        return 1
    fi
}

# Start Notification Service
start_notification() {
    log "Starting Notification Service..."
    
    if ! check_port $NOTIFICATION_PORT "Notification"; then
        warning "Notification port $NOTIFICATION_PORT is in use, skipping..."
        return 0
    fi
    
    cd backend/services
    python3 notification_service.py &
    NOTIFICATION_PID=$!
    echo $NOTIFICATION_PID > ../../pids/notification.pid
    cd ../..
    
    if wait_for_service $NOTIFICATION_PORT "Notification"; then
        success "Notification started successfully (PID: $NOTIFICATION_PID)"
    else
        error "Notification failed to start"
        return 1
    fi
}

# Start Monitoring Service
start_monitoring() {
    log "Starting Monitoring Service..."
    
    if ! check_port $MONITORING_PORT "Monitoring"; then
        warning "Monitoring port $MONITORING_PORT is in use, skipping..."
        return 0
    fi
    
    cd backend/services
    python3 monitoring_service.py &
    MONITORING_PID=$!
    echo $MONITORING_PID > ../../pids/monitoring.pid
    cd ../..
    
    if wait_for_service $MONITORING_PORT "Monitoring"; then
        success "Monitoring started successfully (PID: $MONITORING_PID)"
    else
        error "Monitoring failed to start"
        return 1
    fi
}

# Start Frontend Service
start_frontend() {
    log "Starting Frontend Service..."
    
    if ! check_port $FRONTEND_PORT "Frontend"; then
        warning "Frontend port $FRONTEND_PORT is in use, skipping..."
        return 0
    fi
    
    cd web-app
    npm run dev &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../pids/frontend.pid
    cd ..
    
    # Wait longer for frontend to start
    log "Waiting for Frontend to be ready..."
    sleep 10
    
    if curl -s -f "http://localhost:$FRONTEND_PORT" >/dev/null 2>&1; then
        success "Frontend started successfully (PID: $FRONTEND_PID)"
    else
        warning "Frontend may still be starting up..."
    fi
}

# Start Grafana Service
start_grafana() {
    log "Starting Grafana Service..."
    
    if ! check_port $GRAFANA_PORT "Grafana"; then
        warning "Grafana port $GRAFANA_PORT is in use, skipping..."
        return 0
    fi
    
    # Start Grafana using Docker Compose
    docker-compose up -d grafana
    
    # Wait for Grafana to start
    log "Waiting for Grafana to be ready..."
    sleep 15
    
    if curl -s -f "http://localhost:$GRAFANA_PORT" >/dev/null 2>&1; then
        success "Grafana started successfully"
    else
        warning "Grafana may still be starting up..."
    fi
}

# Display service status
show_status() {
    echo ""
    echo "=========================================="
    echo "🚀 BIST AI Smart Trader - Service Status"
    echo "=========================================="
    echo ""
    
    services=(
        "Backend:http://localhost:$BACKEND_PORT"
        "Realtime:ws://localhost:$REALTIME_PORT"
        "Health Check:http://localhost:$HEALTH_PORT"
        "Watchlist:http://localhost:$WATCHLIST_PORT"
        "Notification:http://localhost:$NOTIFICATION_PORT"
        "Monitoring:http://localhost:$MONITORING_PORT"
        "Frontend:http://localhost:$FRONTEND_PORT"
        "Grafana:http://localhost:$GRAFANA_PORT"
    )
    
    for service in "${services[@]}"; do
        IFS=':' read -r name url <<< "$service"
        if curl -s -f "$url" >/dev/null 2>&1; then
            echo -e "✅ $name: ${GREEN}Running${NC} - $url"
        else
            echo -e "❌ $name: ${RED}Not Running${NC} - $url"
        fi
    done
    
    echo ""
    echo "📊 Quick Access:"
    echo "  • Main App: http://localhost:$FRONTEND_PORT"
    echo "  • API Docs: http://localhost:$BACKEND_PORT/docs"
    echo "  • Health Check: http://localhost:$HEALTH_PORT/api/health"
    echo "  • Grafana: http://localhost:$GRAFANA_PORT (admin/admin123)"
    echo ""
}

# Main function
main() {
    echo ""
    echo "🚀 BIST AI Smart Trader - Starting All Services"
    echo "=============================================="
    echo ""
    
    # Create directories
    create_directories
    
    # Start services in order
    log "Starting services in dependency order..."
    
    # Core services first
    start_backend
    start_realtime
    start_health
    
    # Wait a bit for core services to stabilize
    sleep 5
    
    # Additional services
    start_watchlist
    start_notification
    start_monitoring
    
    # Wait a bit more
    sleep 5
    
    # Frontend services
    start_frontend
    start_grafana
    
    # Final wait
    sleep 5
    
    # Show status
    show_status
    
    success "🎉 All services started successfully!"
    echo ""
    echo "💡 To stop all services, run: ./scripts/stop_all_services.sh"
    echo "💡 To monitor services, run: ./scripts/watchdog.sh monitor"
    echo ""
}

# Handle signals
trap 'echo ""; log "Received shutdown signal, stopping services..."; exit 0' SIGINT SIGTERM

# Run main function
main "$@"
