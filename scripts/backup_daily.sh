#!/bin/bash
# ==============================================
# BIST AI Smart Trader - Daily Backup Script
# ==============================================
# Automated daily backup for production system
# Backs up: databases, models, logs, configs

set -e  # Exit on error

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7  # Keep backups for 7 days

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log_info() {
    echo -e "${GREEN}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Create backup directory
mkdir -p "$BACKUP_DIR"
log_info "Backup directory: $BACKUP_DIR"

# Backup function
backup_file() {
    local source=$1
    local dest=$2
    
    if [ -f "$source" ]; then
        log_info "Backing up: $source"
        cp "$source" "$dest"
        return 0
    elif [ -d "$source" ]; then
        log_info "Backing up directory: $source"
        cp -r "$source" "$dest"
        return 0
    else
        log_warn "Source not found: $source"
        return 1
    fi
}

# Backup SQLite databases
backup_databases() {
    log_info "📊 Backing up databases..."
    
    # List of databases to backup
    DATABASES=(
        "bist_ai.db"
        "backtest_results.db"
        "data_freshness.db"
        "ensemble_models.db"
        "feature_store.db"
        "macro_regime.db"
        "model_validation.db"
        "production_monitoring.db"
        "security_access.db"
        "signal_tracker.db"
        "xai_explanations.db"
        "xai_reporting.db"
    )
    
    for db in "${DATABASES[@]}"; do
        if [ -f "$db" ]; then
            mkdir -p "$BACKUP_DIR/databases"
            cp "$db" "$BACKUP_DIR/databases/${db}_${DATE}"
            log_info "✅ Backed up: $db"
        fi
    done
}

# Backup AI models
backup_models() {
    log_info "🤖 Backing up AI models..."
    
    if [ -d "models" ]; then
        mkdir -p "$BACKUP_DIR/models"
        tar -czf "$BACKUP_DIR/models/models_${DATE}.tar.gz" models/
        log_info "✅ Backed up models directory"
    elif [ -d "ai/models" ]; then
        mkdir -p "$BACKUP_DIR/models"
        tar -czf "$BACKUP_DIR/models/models_${DATE}.tar.gz" ai/models/
        log_info "✅ Backed up AI models directory"
    else
        log_warn "⚠️ Models directory not found"
    fi
    
    # Backup ensemble weights if exists
    if [ -f "models/ensemble_weights.json" ]; then
        cp "models/ensemble_weights.json" "$BACKUP_DIR/models/ensemble_weights_${DATE}.json"
    fi
}

# Backup logs
backup_logs() {
    log_info "📝 Backing up logs..."
    
    if [ -d "logs" ]; then
        mkdir -p "$BACKUP_DIR/logs"
        tar -czf "$BACKUP_DIR/logs/logs_${DATE}.tar.gz" logs/
        log_info "✅ Backed up logs directory"
    else
        log_warn "⚠️ Logs directory not found"
    fi
}

# Backup configuration files
backup_configs() {
    log_info "⚙️ Backing up configuration files..."
    
    mkdir -p "$BACKUP_DIR/configs"
    
    # Backup important config files
    CONFIGS=(
        "docker-compose.yml"
        "Dockerfile"
        ".env"
        "requirements.txt"
        "backend/requirements.txt"
    )
    
    for config in "${CONFIGS[@]}"; do
        if [ -f "$config" ]; then
            cp "$config" "$BACKUP_DIR/configs/"
            log_info "✅ Backed up: $config"
        fi
    done
}

# Backup backend code (version control)
backup_code() {
    log_info "💻 Backing up backend code..."
    
    if [ -d "backend" ]; then
        mkdir -p "$BACKUP_DIR/code"
        tar -czf "$BACKUP_DIR/code/backend_${DATE}.tar.gz" \
            --exclude="node_modules" \
            --exclude="__pycache__" \
            --exclude="*.pyc" \
            --exclude=".git" \
            backend/
        log_info "✅ Backed up backend code"
    fi
}

# Clean old backups
clean_old_backups() {
    log_info "🧹 Cleaning old backups (older than $RETENTION_DAYS days)..."
    
    find "$BACKUP_DIR" -type f -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
    find "$BACKUP_DIR" -type f -name "*_${DATE}" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
    
    log_info "✅ Old backups cleaned"
}

# Compress everything into one archive
create_final_backup() {
    log_info "📦 Creating final backup archive..."
    
    FINAL_ARCHIVE="$BACKUP_DIR/full_backup_${DATE}.tar.gz"
    tar -czf "$FINAL_ARCHIVE" \
        --exclude="$BACKUP_DIR" \
        databases/ models/ logs/ configs/ code/ 2>/dev/null || true
    
    if [ -f "$FINAL_ARCHIVE" ]; then
        SIZE=$(du -h "$FINAL_ARCHIVE" | cut -f1)
        log_info "✅ Final backup created: $FINAL_ARCHIVE ($SIZE)"
    fi
}

# Upload to S3 (optional)
upload_to_s3() {
    if [ -z "$S3_BUCKET" ]; then
        log_warn "⚠️ S3_BUCKET not set, skipping S3 upload"
        return 0
    fi
    
    log_info "☁️ Uploading to S3..."
    
    if command -v aws &> /dev/null; then
        aws s3 cp "$FINAL_ARCHIVE" "s3://$S3_BUCKET/backups/" || log_error "S3 upload failed"
    else
        log_warn "⚠️ AWS CLI not installed, skipping S3 upload"
    fi
}

# Backup summary report
backup_summary() {
    log_info "📊 Backup Summary Report"
    echo "========================"
    echo "Backup Date: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "Backup Directory: $BACKUP_DIR"
    echo ""
    
    # Count files
    DB_COUNT=$(find "$BACKUP_DIR/databases" -type f 2>/dev/null | wc -l || echo "0")
    MODEL_COUNT=$(find "$BACKUP_DIR/models" -type f 2>/dev/null | wc -l || echo "0")
    LOG_COUNT=$(find "$BACKUP_DIR/logs" -type f 2>/dev/null | wc -l || echo "0")
    CONFIG_COUNT=$(find "$BACKUP_DIR/configs" -type f 2>/dev/null | wc -l || echo "0")
    
    echo "Databases backed up: $DB_COUNT"
    echo "Model files backed up: $MODEL_COUNT"
    echo "Log files backed up: $LOG_COUNT"
    echo "Config files backed up: $CONFIG_COUNT"
    echo "========================"
}

# Main execution
main() {
    log_info "🚀 Starting daily backup process..."
    
    # Check if we're in the project root
    if [ ! -f "docker-compose.yml" ]; then
        log_error "❌ Please run this script from the project root directory"
        exit 1
    fi
    
    # Run backup steps
    backup_databases
    backup_models
    backup_logs
    backup_configs
    backup_code
    
    # Create final archive
    create_final_backup
    
    # Clean old backups
    clean_old_backups
    
    # Upload to S3 (if configured)
    upload_to_s3
    
    # Show summary
    backup_summary
    
    log_info "✅ Daily backup completed successfully!"
}

# Error handling
trap 'log_error "❌ Backup failed!"; exit 1' ERR

# Run main function
main "$@"
