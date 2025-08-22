#!/bin/bash
# SSL Certificate Setup Script for BIST AI Smart Trader

echo "🔒 SSL Certificate Setup for BIST AI Smart Trader"
echo "================================================"

# Create SSL directory
mkdir -p /etc/letsencrypt/live/bistai.com

# Generate self-signed certificates for development
if [ "$1" == "dev" ]; then
    echo "📄 Generating self-signed certificates for development..."
    
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/bistai.key \
        -out ssl/bistai.crt \
        -subj "/C=TR/ST=Istanbul/L=Istanbul/O=BIST AI/OU=Trading/CN=localhost"
    
    echo "✅ Self-signed certificates generated:"
    echo "   - ssl/bistai.key"
    echo "   - ssl/bistai.crt"
fi

# Production Let's Encrypt setup
if [ "$1" == "prod" ]; then
    echo "🌐 Setting up Let's Encrypt for production..."
    
    # Install certbot if not available
    if ! command -v certbot &> /dev/null; then
        echo "Installing certbot..."
        apt-get update
        apt-get install -y certbot python3-certbot-nginx
    fi
    
    # Domain name
    DOMAIN=${2:-bistai.com}
    EMAIL=${3:-admin@bistai.com}
    
    # Get certificate
    certbot certonly --standalone \
        --preferred-challenges http \
        --email $EMAIL \
        --agree-tos \
        --no-eff-email \
        -d $DOMAIN
    
    # Copy certificates to ssl directory
    cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ssl/bistai.crt
    cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ssl/bistai.key
    
    echo "✅ Let's Encrypt certificates installed for $DOMAIN"
    
    # Setup auto-renewal
    echo "Setting up auto-renewal..."
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    
    echo "✅ Auto-renewal configured"
fi

# Set correct permissions
chmod 600 ssl/bistai.key
chmod 644 ssl/bistai.crt

echo "🔒 SSL setup completed!"
echo ""
echo "Usage:"
echo "  Development: ./ssl-setup.sh dev"
echo "  Production:  ./ssl-setup.sh prod [domain] [email]"
echo ""
echo "Example:"
echo "  ./ssl-setup.sh prod bistai.com admin@bistai.com"
