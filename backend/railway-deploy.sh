#!/bin/bash
# Railway Deployment Script for BIST AI Smart Trader

set -e

echo "🚀 BIST AI Smart Trader - Railway Deployment"
echo "=" * 50

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI not found${NC}"
    echo -e "${BLUE}Installing Railway CLI...${NC}"
    npm install -g @railway/cli
fi

# Login to Railway (if not already logged in)
echo -e "${BLUE}🔐 Checking Railway authentication...${NC}"
if ! railway whoami &> /dev/null; then
    echo -e "${YELLOW}Please login to Railway:${NC}"
    railway login
fi

# Get current project info
PROJECT_NAME="bist-ai-smart-trader"
echo -e "${BLUE}📊 Project: ${PROJECT_NAME}${NC}"

# Function to deploy to environment
deploy_to_environment() {
    local env=$1
    echo -e "${BLUE}🚀 Deploying to ${env}...${NC}"
    
    # Switch to environment
    railway environment $env
    
    # Add environment variables
    if [ "$env" = "production" ]; then
        railway variables set DEBUG=false
        railway variables set LOG_LEVEL=INFO
        railway variables set PYTHONPATH=/app
        railway variables set PYTHONUNBUFFERED=1
        railway variables set PYTHONDONTWRITEBYTECODE=1
    else
        railway variables set DEBUG=true
        railway variables set LOG_LEVEL=DEBUG
        railway variables set PYTHONPATH=/app
        railway variables set PYTHONUNBUFFERED=1
    fi
    
    # Deploy
    echo -e "${BLUE}📦 Building and deploying...${NC}"
    railway up --detach
    
    # Wait for deployment
    echo -e "${YELLOW}⏳ Waiting for deployment to complete...${NC}"
    sleep 60
    
    # Get deployment URL
    DEPLOY_URL=$(railway domain 2>/dev/null || echo "")
    
    if [ -n "$DEPLOY_URL" ]; then
        echo -e "${GREEN}✅ Deployment successful!${NC}"
        echo -e "${GREEN}🔗 URL: https://${DEPLOY_URL}${NC}"
        
        # Test deployment
        echo -e "${BLUE}🧪 Testing deployment...${NC}"
        if curl -s -f "https://${DEPLOY_URL}/health" > /dev/null; then
            echo -e "${GREEN}✅ Health check passed${NC}"
        else
            echo -e "${RED}❌ Health check failed${NC}"
            return 1
        fi
        
        # Test additional endpoints
        if curl -s -f "https://${DEPLOY_URL}/metrics" > /dev/null; then
            echo -e "${GREEN}✅ Metrics endpoint working${NC}"
        else
            echo -e "${YELLOW}⚠️ Metrics endpoint not responding${NC}"
        fi
        
    else
        echo -e "${RED}❌ Could not get deployment URL${NC}"
        return 1
    fi
}

# Main deployment logic
case "${1:-production}" in
    "staging")
        echo -e "${YELLOW}📝 Deploying to STAGING environment${NC}"
        deploy_to_environment "staging"
        ;;
    "production")
        echo -e "${GREEN}🌟 Deploying to PRODUCTION environment${NC}"
        
        # Confirm production deployment
        echo -e "${YELLOW}⚠️ You are about to deploy to PRODUCTION${NC}"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            deploy_to_environment "production"
        else
            echo -e "${YELLOW}📛 Production deployment cancelled${NC}"
            exit 0
        fi
        ;;
    "both")
        echo -e "${BLUE}🎯 Deploying to both environments${NC}"
        deploy_to_environment "staging"
        echo -e "${BLUE}💤 Waiting before production...${NC}"
        sleep 30
        deploy_to_environment "production"
        ;;
    *)
        echo -e "${RED}❌ Invalid environment: $1${NC}"
        echo -e "${BLUE}Usage: $0 [staging|production|both]${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${BLUE}📊 You can monitor your deployment at: https://railway.app${NC}"
