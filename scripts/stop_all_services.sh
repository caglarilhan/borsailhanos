#!/bin/bash

# BIST AI Smart Trader - Stop All Services Script
# Gracefully stops all running services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Stop service by PID
stop_service() {
    local pid_file=$1
    local service_name=$2
    local force=$3
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            log "Stopping $service_name (PID: $pid)..."
            
            if [ "$force" = "true" ]; then
                kill -9 "$pid" 2>/dev/null || true
                success "$service_name force stopped"
            else
                kill "$pid" 2>/dev/null || true
                sleep 2
                
                if kill -0 "$pid" 2>/dev/null; then
                    warning "Force killing $service_name (PID: $pid)..."
                    kill -9 "$pid" 2>/dev/null || true
                fi
                
                success "$service_name stopped"
            fi
        else
            warning "$service_name process not found (PID: $pid)"
        fi
        rm -f "$pid_file"
    else
        warning "PID file not found for $service_name"
    fi
}

# Stop Docker services
stop_docker_services() {
    log "Stopping Docker services..."
    
    # Stop Grafana
    if docker ps -q --filter "name=grafana" | grep -q .; then
        docker-compose down grafana
        success "Grafana stopped"
    else
        warning "Grafana container not running"
    fi
    
    # Stop any other Docker services
    if docker ps -q | grep -q .; then
        docker-compose down
        success "All Docker services stopped"
    else
        info "No Docker services running"
    fi
}

# Kill processes by port
kill_by_port() {
    local port=$1
    local service_name=$2
    
    local pids=$(lsof -ti:$port 2>/dev/null || true)
    if [ -n "$pids" ]; then
        log "Killing processes on port $port ($service_name)..."
        echo "$pids" | xargs kill -9 2>/dev/null || true
        success "$service_name processes killed on port $port"
    else
        info "No processes found on port $port"
    fi
}

# Main stop function
stop_all_services() {
    echo ""
    echo "🛑 BIST AI Smart Trader - Stopping All Services"
    echo "=============================================="
    echo ""
    
    log "Stopping services in reverse order..."
    
    # Stop frontend services first
    stop_service "pids/frontend.pid" "Frontend"
    
    # Stop additional services
    stop_service "pids/monitoring.pid" "Monitoring"
    stop_service "pids/notification.pid" "Notification"
    stop_service "pids/watchlist.pid" "Watchlist"
    
    # Stop core services
    stop_service "pids/health.pid" "Health Check"
    stop_service "pids/realtime.pid" "Realtime"
    stop_service "pids/backend.pid" "Backend"
    
    # Stop Docker services
    stop_docker_services
    
    # Kill any remaining processes by port
    kill_by_port 3000 "Frontend"
    kill_by_port 8000 "Backend"
    kill_by_port 8001 "Health Check"
    kill_by_port 8002 "Watchlist"
    kill_by_port 8003 "Notification"
    kill_by_port 8004 "Monitoring"
    kill_by_port 8081 "Realtime"
    kill_by_port 3010 "Grafana"
    
    # Clean up PID directory
    if [ -d "pids" ]; then
        rm -rf pids/*
        success "PID files cleaned up"
    fi
    
    success "🎉 All services stopped successfully!"
    echo ""
}

# Force stop function
force_stop_all_services() {
    echo ""
    echo "💥 BIST AI Smart Trader - Force Stopping All Services"
    echo "===================================================="
    echo ""
    
    warning "Force stopping all services..."
    
    # Force stop all services
    stop_service "pids/frontend.pid" "Frontend" "true"
    stop_service "pids/monitoring.pid" "Monitoring" "true"
    stop_service "pids/notification.pid" "Notification" "true"
    stop_service "pids/watchlist.pid" "Watchlist" "true"
    stop_service "pids/health.pid" "Health Check" "true"
    stop_service "pids/realtime.pid" "Realtime" "true"
    stop_service "pids/backend.pid" "Backend" "true"
    
    # Force stop Docker services
    docker-compose down --remove-orphans 2>/dev/null || true
    
    # Kill all processes by port
    for port in 3000 8000 8001 8002 8003 8004 8081 3010; do
        kill_by_port $port "Service"
    done
    
    # Clean up
    rm -rf pids/* 2>/dev/null || true
    
    success "💥 All services force stopped!"
    echo ""
}

# Check if services are running
check_running_services() {
    echo ""
    echo "📊 BIST AI Smart Trader - Service Status"
    echo "======================================="
    echo ""
    
    services=(
        "Frontend:3000"
        "Backend:8000"
        "Health Check:8001"
        "Watchlist:8002"
        "Notification:8003"
        "Monitoring:8004"
        "Realtime:8081"
        "Grafana:3010"
    )
    
    running_count=0
    total_count=${#services[@]}
    
    for service in "${services[@]}"; do
        IFS=':' read -r name port <<< "$service"
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo -e "✅ $name: ${GREEN}Running${NC} (Port: $port)"
            running_count=$((running_count + 1))
        else
            echo -e "❌ $name: ${RED}Stopped${NC} (Port: $port)"
        fi
    done
    
    echo ""
    echo "Summary: $running_count/$total_count services running"
    echo ""
}

# Command line arguments
case "${1:-}" in
    stop)
        stop_all_services
        ;;
    force)
        force_stop_all_services
        ;;
    status)
        check_running_services
        ;;
    *)
        echo "Usage: $0 {stop|force|status}"
        echo ""
        echo "Commands:"
        echo "  stop   - Gracefully stop all services"
        echo "  force  - Force stop all services"
        echo "  status - Check which services are running"
        echo ""
        echo "Examples:"
        echo "  $0 stop     # Normal shutdown"
        echo "  $0 force    # Force shutdown"
        echo "  $0 status   # Check status"
        exit 1
        ;;
esac
