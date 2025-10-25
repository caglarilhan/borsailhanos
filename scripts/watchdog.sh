#!/bin/bash

# BIST AI Smart Trader - Watchdog Script
# Monitors and restarts services automatically

set -e

# Configuration
BACKEND_PORT=8000
REALTIME_PORT=8081
HEALTH_PORT=8001
FRONTEND_PORT=3000
GRAFANA_PORT=3010

# Logging
LOG_FILE="logs/watchdog.log"
mkdir -p logs

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS:${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

# Check if port is in use
check_port() {
    local port=$1
    local service_name=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        log "$service_name is running on port $port"
        return 0
    else
        warning "$service_name is not running on port $port"
        return 1
    fi
}

# Check service health
check_service_health() {
    local port=$1
    local service_name=$2
    local health_endpoint=$3
    
    if curl -s -f "http://localhost:$port$health_endpoint" >/dev/null 2>&1; then
        log "$service_name health check passed"
        return 0
    else
        error "$service_name health check failed"
        return 1
    fi
}

# Start backend service
start_backend() {
    log "Starting Backend service..."
    
    if check_port $BACKEND_PORT "Backend"; then
        warning "Backend already running on port $BACKEND_PORT"
        return 0
    fi
    
    cd backend
    python3 comprehensive_backend.py &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../pids/backend.pid
    cd ..
    
    # Wait for service to start
    sleep 5
    
    if check_port $BACKEND_PORT "Backend"; then
        success "Backend started successfully (PID: $BACKEND_PID)"
        return 0
    else
        error "Failed to start Backend service"
        return 1
    fi
}

# Start realtime service
start_realtime() {
    log "Starting Realtime service..."
    
    if check_port $REALTIME_PORT "Realtime"; then
        warning "Realtime already running on port $REALTIME_PORT"
        return 0
    fi
    
    cd backend
    python3 realtime_server.py &
    REALTIME_PID=$!
    echo $REALTIME_PID > ../pids/realtime.pid
    cd ..
    
    # Wait for service to start
    sleep 3
    
    if check_port $REALTIME_PORT "Realtime"; then
        success "Realtime started successfully (PID: $REALTIME_PID)"
        return 0
    else
        error "Failed to start Realtime service"
        return 1
    fi
}

# Start health check service
start_health() {
    log "Starting Health Check service..."
    
    if check_port $HEALTH_PORT "Health Check"; then
        warning "Health Check already running on port $HEALTH_PORT"
        return 0
    fi
    
    cd backend
    python3 health_check.py &
    HEALTH_PID=$!
    echo $HEALTH_PID > ../pids/health.pid
    cd ..
    
    # Wait for service to start
    sleep 2
    
    if check_port $HEALTH_PORT "Health Check"; then
        success "Health Check started successfully (PID: $HEALTH_PID)"
        return 0
    else
        error "Failed to start Health Check service"
        return 1
    fi
}

# Start frontend service
start_frontend() {
    log "Starting Frontend service..."
    
    if check_port $FRONTEND_PORT "Frontend"; then
        warning "Frontend already running on port $FRONTEND_PORT"
        return 0
    fi
    
    cd web-app
    npm run dev &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../pids/frontend.pid
    cd ..
    
    # Wait for service to start
    sleep 10
    
    if check_port $FRONTEND_PORT "Frontend"; then
        success "Frontend started successfully (PID: $FRONTEND_PID)"
        return 0
    else
        error "Failed to start Frontend service"
        return 1
    fi
}

# Start Grafana service
start_grafana() {
    log "Starting Grafana service..."
    
    if check_port $GRAFANA_PORT "Grafana"; then
        warning "Grafana already running on port $GRAFANA_PORT"
        return 0
    fi
    
    # Start Grafana using Docker Compose
    docker-compose up -d grafana
    
    # Wait for service to start
    sleep 15
    
    if check_port $GRAFANA_PORT "Grafana"; then
        success "Grafana started successfully"
        return 0
    else
        error "Failed to start Grafana service"
        return 1
    fi
}

# Stop service by PID
stop_service() {
    local pid_file=$1
    local service_name=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            log "Stopping $service_name (PID: $pid)..."
            kill "$pid"
            sleep 2
            
            if kill -0 "$pid" 2>/dev/null; then
                warning "Force killing $service_name (PID: $pid)..."
                kill -9 "$pid"
            fi
            
            success "$service_name stopped"
        else
            warning "$service_name process not found (PID: $pid)"
        fi
        rm -f "$pid_file"
    else
        warning "PID file not found for $service_name"
    fi
}

# Stop all services
stop_all_services() {
    log "Stopping all services..."
    
    stop_service "pids/frontend.pid" "Frontend"
    stop_service "pids/health.pid" "Health Check"
    stop_service "pids/realtime.pid" "Realtime"
    stop_service "pids/backend.pid" "Backend"
    
    # Stop Grafana
    docker-compose down grafana
    
    success "All services stopped"
}

# Monitor services
monitor_services() {
    log "Starting service monitoring..."
    
    while true; do
        # Check Backend
        if ! check_port $BACKEND_PORT "Backend"; then
            error "Backend service down, restarting..."
            start_backend
        fi
        
        # Check Realtime
        if ! check_port $REALTIME_PORT "Realtime"; then
            error "Realtime service down, restarting..."
            start_realtime
        fi
        
        # Check Health Check
        if ! check_port $HEALTH_PORT "Health Check"; then
            error "Health Check service down, restarting..."
            start_health
        fi
        
        # Check Frontend
        if ! check_port $FRONTEND_PORT "Frontend"; then
            error "Frontend service down, restarting..."
            start_frontend
        fi
        
        # Check Grafana
        if ! check_port $GRAFANA_PORT "Grafana"; then
            error "Grafana service down, restarting..."
            start_grafana
        fi
        
        # Wait before next check
        sleep 30
    done
}

# Main function
main() {
    log "🚀 BIST AI Smart Trader Watchdog Starting..."
    
    # Create PID directory
    mkdir -p pids
    
    # Handle signals
    trap 'log "Received shutdown signal, stopping all services..."; stop_all_services; exit 0' SIGINT SIGTERM
    
    # Start all services
    start_backend
    start_realtime
    start_health
    start_frontend
    start_grafana
    
    # Wait a bit for services to stabilize
    sleep 10
    
    # Start monitoring
    monitor_services
}

# Command line arguments
case "${1:-}" in
    start)
        main
        ;;
    stop)
        stop_all_services
        ;;
    restart)
        stop_all_services
        sleep 5
        main
        ;;
    status)
        log "Service Status:"
        check_port $BACKEND_PORT "Backend"
        check_port $REALTIME_PORT "Realtime"
        check_port $HEALTH_PORT "Health Check"
        check_port $FRONTEND_PORT "Frontend"
        check_port $GRAFANA_PORT "Grafana"
        ;;
    monitor)
        monitor_services
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|monitor}"
        echo ""
        echo "Commands:"
        echo "  start   - Start all services"
        echo "  stop    - Stop all services"
        echo "  restart - Restart all services"
        echo "  status  - Check service status"
        echo "  monitor - Monitor services only"
        exit 1
        ;;
esac
