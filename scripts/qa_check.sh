#!/bin/bash

# BIST AI Smart Trader - QA Check Script
# Comprehensive quality assurance checks for CI/CD pipeline

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

# Configuration
FRONTEND_DIR="web-app"
BACKEND_DIR="backend"
SCRIPTS_DIR="scripts"
LOG_FILE="logs/qa_check.log"

# Create logs directory
mkdir -p logs

# Initialize counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Check function
run_check() {
    local check_name="$1"
    local check_command="$2"
    local required="$3"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    log "Running check: $check_name"
    
    if eval "$check_command" >/dev/null 2>&1; then
        success "$check_name: PASSED"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        if [ "$required" = "true" ]; then
            error "$check_name: FAILED (REQUIRED)"
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
            return 1
        else
            warning "$check_name: FAILED (OPTIONAL)"
            return 0
        fi
    fi
}

# Frontend Checks
run_frontend_checks() {
    log "🔍 Running Frontend Checks..."
    
    cd "$FRONTEND_DIR"
    
    # Check if package.json exists
    run_check "Package.json exists" "test -f package.json" "true"
    
    # Check if node_modules exists
    run_check "Node modules installed" "test -d node_modules" "true"
    
    # Run ESLint
    run_check "ESLint check" "npm run lint" "false"
    
    # Run TypeScript check
    run_check "TypeScript check" "npx tsc --noEmit" "false"
    
    # Run build check
    run_check "Build check" "npm run build" "true"
    
    # Check for security vulnerabilities
    run_check "Security audit" "npm audit --audit-level=high" "false"
    
    # Check bundle size
    run_check "Bundle size check" "npm run build && du -sh .next/static" "false"
    
    cd ..
}

# Backend Checks
run_backend_checks() {
    log "🔍 Running Backend Checks..."
    
    cd "$BACKEND_DIR"
    
    # Check if Python files exist
    run_check "Python files exist" "find . -name '*.py' | head -1" "true"
    
    # Run Python syntax check
    run_check "Python syntax check" "python3 -m py_compile comprehensive_backend.py" "true"
    
    # Run import check
    run_check "Python import check" "python3 -c 'import sys; sys.path.append(\".\"); import comprehensive_backend'" "false"
    
    # Check for required dependencies
    run_check "Required dependencies" "python3 -c 'import fastapi, uvicorn, pandas, numpy'" "true"
    
    # Run health check
    run_check "Health check endpoint" "python3 health_check.py & sleep 2 && curl -f http://localhost:8001/api/health && kill %1" "false"
    
    # Check database connectivity
    run_check "Database connectivity" "python3 -c 'import sqlite3; conn = sqlite3.connect(\"bist_ai.db\"); conn.close()'" "false"
    
    # Check AI models directory
    run_check "AI models directory" "test -d ../ai/models" "false"
    
    cd ..
}

# System Checks
run_system_checks() {
    log "🔍 Running System Checks..."
    
    # Check if required ports are available
    run_check "Port 8000 available" "! lsof -Pi :8000 -sTCP:LISTEN -t" "false"
    run_check "Port 3000 available" "! lsof -Pi :3000 -sTCP:LISTEN -t" "false"
    run_check "Port 8081 available" "! lsof -Pi :8081 -sTCP:LISTEN -t" "false"
    
    # Check disk space
    run_check "Disk space check" "df -h . | awk 'NR==2 {if (\$4+0 < 1000) exit 1}'" "false"
    
    # Check memory
    run_check "Memory check" "free -m | awk 'NR==2 {if (\$7+0 < 1000) exit 1}'" "false"
    
    # Check if Docker is available
    run_check "Docker available" "docker --version" "false"
    
    # Check if required system tools exist
    run_check "Required tools" "which curl && which git && which python3" "true"
}

# Security Checks
run_security_checks() {
    log "🔍 Running Security Checks..."
    
    # Check for sensitive files
    run_check "No sensitive files" "! find . -name '*.key' -o -name '*.pem' -o -name '.env*' | grep -v '.env.example'" "false"
    
    # Check file permissions
    run_check "File permissions" "find . -type f -perm /o+w | wc -l | awk '{if (\$1 > 0) exit 1}'" "false"
    
    # Check for hardcoded secrets
    run_check "No hardcoded secrets" "! grep -r 'password.*=' . --include='*.py' --include='*.js' --include='*.ts' | grep -v 'password.*=.*input'" "false"
    
    # Check for SQL injection patterns
    run_check "SQL injection check" "! grep -r 'execute.*%' . --include='*.py'" "false"
}

# Performance Checks
run_performance_checks() {
    log "🔍 Running Performance Checks..."
    
    # Check frontend build time
    cd "$FRONTEND_DIR"
    start_time=$(date +%s)
    npm run build >/dev/null 2>&1
    end_time=$(date +%s)
    build_time=$((end_time - start_time))
    
    if [ $build_time -lt 300 ]; then
        success "Frontend build time: ${build_time}s (PASSED)"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        warning "Frontend build time: ${build_time}s (SLOW)"
    fi
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    cd ..
    
    # Check bundle size
    if [ -d "$FRONTEND_DIR/.next/static" ]; then
        bundle_size=$(du -sh "$FRONTEND_DIR/.next/static" | cut -f1)
        log "Bundle size: $bundle_size"
    fi
}

# Integration Checks
run_integration_checks() {
    log "🔍 Running Integration Checks..."
    
    # Check if all services can start
    run_check "Services can start" "./scripts/start_all_services.sh & sleep 10 && ./scripts/stop_all_services.sh stop" "false"
    
    # Check API endpoints
    run_check "API endpoints" "curl -f http://localhost:8000/docs" "false"
    
    # Check WebSocket connection
    run_check "WebSocket connection" "curl -f http://localhost:8081/api/health" "false"
}

# Documentation Checks
run_documentation_checks() {
    log "🔍 Running Documentation Checks..."
    
    # Check if README exists
    run_check "README exists" "test -f README.md" "true"
    
    # Check if deployment guide exists
    run_check "Deployment guide exists" "test -f DEPLOYMENT-GUIDE.md" "true"
    
    # Check if scripts are documented
    run_check "Scripts documented" "test -f scripts/README.md" "false"
    
    # Check for TODO comments
    todo_count=$(grep -r "TODO\|FIXME\|HACK" . --include='*.py' --include='*.js' --include='*.ts' | wc -l)
    if [ $todo_count -lt 10 ]; then
        success "TODO count: $todo_count (PASSED)"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        warning "TODO count: $todo_count (HIGH)"
    fi
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
}

# Code Quality Checks
run_code_quality_checks() {
    log "🔍 Running Code Quality Checks..."
    
    # Check Python code style
    run_check "Python code style" "python3 -m flake8 backend/ --max-line-length=120" "false"
    
    # Check JavaScript/TypeScript code style
    cd "$FRONTEND_DIR"
    run_check "TypeScript code style" "npx prettier --check src/" "false"
    cd ..
    
    # Check for unused imports
    run_check "No unused imports" "! grep -r 'import.*unused' . --include='*.py' --include='*.ts'" "false"
    
    # Check for console.log in production code
    run_check "No console.log in production" "! grep -r 'console.log' web-app/src/ --include='*.ts' --include='*.tsx'" "false"
}

# Generate Report
generate_report() {
    log "📊 Generating QA Report..."
    
    local report_file="logs/qa_report_$(date +%Y%m%d_%H%M%S).json"
    
    cat > "$report_file" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "summary": {
    "total_checks": $TOTAL_CHECKS,
    "passed_checks": $PASSED_CHECKS,
    "failed_checks": $FAILED_CHECKS,
    "success_rate": "$(echo "scale=2; $PASSED_CHECKS * 100 / $TOTAL_CHECKS" | bc)%"
  },
  "checks": {
    "frontend": "Completed",
    "backend": "Completed",
    "system": "Completed",
    "security": "Completed",
    "performance": "Completed",
    "integration": "Completed",
    "documentation": "Completed",
    "code_quality": "Completed"
  },
  "recommendations": [
    "Run security audit regularly",
    "Monitor bundle size",
    "Keep dependencies updated",
    "Review TODO comments"
  ]
}
EOF
    
    success "QA Report generated: $report_file"
}

# Main function
main() {
    echo ""
    echo "🔍 BIST AI Smart Trader - QA Check Suite"
    echo "========================================"
    echo ""
    
    # Run all checks
    run_frontend_checks
    run_backend_checks
    run_system_checks
    run_security_checks
    run_performance_checks
    run_integration_checks
    run_documentation_checks
    run_code_quality_checks
    
    # Generate report
    generate_report
    
    # Summary
    echo ""
    echo "📊 QA Check Summary"
    echo "=================="
    echo "Total Checks: $TOTAL_CHECKS"
    echo "Passed: $PASSED_CHECKS"
    echo "Failed: $FAILED_CHECKS"
    echo "Success Rate: $(echo "scale=2; $PASSED_CHECKS * 100 / $TOTAL_CHECKS" | bc)%"
    echo ""
    
    if [ $FAILED_CHECKS -eq 0 ]; then
        success "🎉 All QA checks passed! Ready for deployment."
        exit 0
    else
        error "⚠️ $FAILED_CHECKS checks failed. Review before deployment."
        exit 1
    fi
}

# Command line arguments
case "${1:-}" in
    frontend)
        run_frontend_checks
        ;;
    backend)
        run_backend_checks
        ;;
    security)
        run_security_checks
        ;;
    performance)
        run_performance_checks
        ;;
    all)
        main
        ;;
    *)
        echo "Usage: $0 {frontend|backend|security|performance|all}"
        echo ""
        echo "Commands:"
        echo "  frontend   - Run frontend checks only"
        echo "  backend    - Run backend checks only"
        echo "  security   - Run security checks only"
        echo "  performance - Run performance checks only"
        echo "  all        - Run all checks (default)"
        echo ""
        echo "Examples:"
        echo "  $0 all        # Run all checks"
        echo "  $0 frontend   # Run frontend checks only"
        echo "  $0 security   # Run security checks only"
        exit 1
        ;;
esac
