#!/usr/bin/env python3
"""
Freemium Model - Premium özellik kilidi ve abonelik yönetimi
"""

import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from enum import Enum

class SubscriptionTier(Enum):
    """Abonelik seviyeleri"""
    FREE = "free"
    BASIC = "basic"
    PREMIUM = "premium"
    PRO = "pro"
    GOD_MODE = "god_mode"

class FeatureAccess(Enum):
    """Özellik erişim seviyeleri"""
    FREE_ONLY = "free_only"
    BASIC_PLUS = "basic_plus"
    PREMIUM_PLUS = "premium_plus"
    PRO_ONLY = "pro_only"
    GOD_ONLY = "god_only"

class FreemiumModel:
    """Freemium model - Premium özellik kilidi ve abonelik yönetimi"""
    
    def __init__(self):
        self.subscription_tiers = {
            SubscriptionTier.FREE: {
                "name": "Ücretsiz",
                "price": 0,
                "currency": "TRY",
                "duration_days": 0,
                "features": [
                    "temel_sinyaller",
                    "temel_teknik_analiz",
                    "temel_portfolio",
                    "temel_watchlist"
                ],
                "limits": {
                    "max_signals_per_day": 10,
                    "max_watchlists": 1,
                    "max_portfolios": 1,
                    "max_alerts": 5,
                    "api_calls_per_day": 100,
                    "backtest_runs_per_month": 3,
                    "real_time_data_minutes": 30
                }
            },
            SubscriptionTier.BASIC: {
                "name": "Temel",
                "price": 29.99,
                "currency": "TRY",
                "duration_days": 30,
                "features": [
                    "temel_sinyaller",
                    "temel_teknik_analiz",
                    "temel_portfolio",
                    "temel_watchlist",
                    "gelişmiş_sinyaller",
                    "email_destek"
                ],
                "limits": {
                    "max_signals_per_day": 50,
                    "max_watchlists": 3,
                    "max_portfolios": 2,
                    "max_alerts": 20,
                    "api_calls_per_day": 500,
                    "backtest_runs_per_month": 10,
                    "real_time_data_minutes": 120
                }
            },
            SubscriptionTier.PREMIUM: {
                "name": "Premium",
                "price": 99.99,
                "currency": "TRY",
                "duration_days": 30,
                "features": [
                    "temel_sinyaller",
                    "temel_teknik_analiz",
                    "temel_portfolio",
                    "temel_watchlist",
                    "gelişmiş_sinyaller",
                    "email_destek",
                    "ai_modelleri",
                    "sentiment_analiz",
                    "xai_açıklamalar",
                    "backtesting",
                    "makro_rejim",
                    "priority_destek"
                ],
                "limits": {
                    "max_signals_per_day": 200,
                    "max_watchlists": 10,
                    "max_portfolios": 5,
                    "max_alerts": 100,
                    "api_calls_per_day": 2000,
                    "backtest_runs_per_month": 50,
                    "real_time_data_minutes": 480
                }
            },
            SubscriptionTier.PRO: {
                "name": "Profesyonel",
                "price": 299.99,
                "currency": "TRY",
                "duration_days": 30,
                "features": [
                    "temel_sinyaller",
                    "temel_teknik_analiz",
                    "temel_portfolio",
                    "temel_watchlist",
                    "gelişmiş_sinyaller",
                    "email_destek",
                    "ai_modelleri",
                    "sentiment_analiz",
                    "xai_açıklamalar",
                    "backtesting",
                    "makro_rejim",
                    "priority_destek",
                    "sosyal_trading",
                    "paper_trading",
                    "crypto_trading",
                    "eğitim_modülü",
                    "api_erişimi",
                    "white_label"
                ],
                "limits": {
                    "max_signals_per_day": 1000,
                    "max_watchlists": 50,
                    "max_portfolios": 20,
                    "max_alerts": 500,
                    "api_calls_per_day": 10000,
                    "backtest_runs_per_month": 200,
                    "real_time_data_minutes": 1440
                }
            },
            SubscriptionTier.GOD_MODE: {
                "name": "God Mode",
                "price": 0,
                "currency": "TRY",
                "duration_days": 365,
                "features": [
                    "unlimited_signals",
                    "unlimited_watchlists",
                    "unlimited_portfolios",
                    "unlimited_alerts",
                    "unlimited_api_calls",
                    "unlimited_backtest_runs",
                    "unlimited_real_time_data",
                    "all_premium_features",
                    "god_mode_exclusive"
                ],
                "limits": {
                    "max_signals_per_day": 999999,
                    "max_watchlists": 999,
                    "max_portfolios": 999,
                    "max_alerts": 999999,
                    "api_calls_per_day": 999999,
                    "backtest_runs_per_month": 999999,
                    "real_time_data_minutes": 999999
                }
            }
        }
        
        self.feature_access = {
            "temel_sinyaller": FeatureAccess.FREE_ONLY,
            "temel_teknik_analiz": FeatureAccess.FREE_ONLY,
            "temel_portfolio": FeatureAccess.FREE_ONLY,
            "temel_watchlist": FeatureAccess.FREE_ONLY,
            "gelişmiş_sinyaller": FeatureAccess.BASIC_PLUS,
            "email_destek": FeatureAccess.BASIC_PLUS,
            "ai_modelleri": FeatureAccess.PREMIUM_PLUS,
            "sentiment_analiz": FeatureAccess.PREMIUM_PLUS,
            "xai_açıklamalar": FeatureAccess.PREMIUM_PLUS,
            "backtesting": FeatureAccess.PREMIUM_PLUS,
            "makro_rejim": FeatureAccess.PREMIUM_PLUS,
            "priority_destek": FeatureAccess.PREMIUM_PLUS,
            "sosyal_trading": FeatureAccess.PRO_ONLY,
            "paper_trading": FeatureAccess.PRO_ONLY,
            "crypto_trading": FeatureAccess.PRO_ONLY,
            "eğitim_modülü": FeatureAccess.PRO_ONLY,
            "api_erişimi": FeatureAccess.PRO_ONLY,
            "white_label": FeatureAccess.PRO_ONLY,
            "unlimited_signals": FeatureAccess.GOD_ONLY,
            "unlimited_watchlists": FeatureAccess.GOD_ONLY,
            "unlimited_portfolios": FeatureAccess.GOD_ONLY,
            "unlimited_alerts": FeatureAccess.GOD_ONLY,
            "unlimited_api_calls": FeatureAccess.GOD_ONLY,
            "unlimited_backtest_runs": FeatureAccess.GOD_ONLY,
            "unlimited_real_time_data": FeatureAccess.GOD_ONLY,
            "all_premium_features": FeatureAccess.GOD_ONLY,
            "god_mode_exclusive": FeatureAccess.GOD_ONLY
        }
        
        # Demo kullanıcılar
        self.demo_users = {
            "demo@test.com": {
                "id": "demo_user_001",
                "email": "demo@test.com",
                "name": "Demo User",
                "subscription": SubscriptionTier.FREE,
                "subscription_start": datetime.now().isoformat(),
                "subscription_end": (datetime.now() + timedelta(days=30)).isoformat(),
                "usage_stats": {
                    "signals_today": 5,
                    "api_calls_today": 25,
                    "backtest_runs_this_month": 1,
                    "real_time_minutes_used": 15
                }
            },
            "premium@test.com": {
                "id": "premium_user_001",
                "email": "premium@test.com",
                "name": "Premium User",
                "subscription": SubscriptionTier.PREMIUM,
                "subscription_start": datetime.now().isoformat(),
                "subscription_end": (datetime.now() + timedelta(days=30)).isoformat(),
                "usage_stats": {
                    "signals_today": 45,
                    "api_calls_today": 180,
                    "backtest_runs_this_month": 12,
                    "real_time_minutes_used": 120
                }
            },
            "god@test.com": {
                "id": "god_user_001",
                "email": "god@test.com",
                "name": "God Mode User",
                "subscription": SubscriptionTier.GOD_MODE,
                "subscription_start": datetime.now().isoformat(),
                "subscription_end": (datetime.now() + timedelta(days=365)).isoformat(),
                "usage_stats": {
                    "signals_today": 999,
                    "api_calls_today": 9999,
                    "backtest_runs_this_month": 999,
                    "real_time_minutes_used": 9999
                }
            }
        }
    
    def get_subscription_tiers(self) -> Dict[str, Any]:
        """Abonelik seviyelerini getir"""
        return {
            "tiers": {
                tier.value: {
                    "name": data["name"],
                    "price": data["price"],
                    "currency": data["currency"],
                    "duration_days": data["duration_days"],
                    "features": data["features"],
                    "limits": data["limits"]
                }
                for tier, data in self.subscription_tiers.items()
            },
            "feature_access": {
                feature: access.value
                for feature, access in self.feature_access.items()
            }
        }
    
    def check_feature_access(self, user_email: str, feature: str) -> Dict[str, Any]:
        """Kullanıcının özelliğe erişimini kontrol et"""
        try:
            user = self.demo_users.get(user_email)
            if not user:
                return {
                    "has_access": False,
                    "reason": "User not found",
                    "subscription": "unknown"
                }
            
            user_tier = user["subscription"]
            feature_access_level = self.feature_access.get(feature)
            
            if not feature_access_level:
                return {
                    "has_access": False,
                    "reason": "Feature not found",
                    "subscription": user_tier.value
                }
            
            # Erişim kontrolü
            has_access = self._check_tier_access(user_tier, feature_access_level)
            
            return {
                "has_access": has_access,
                "reason": "Access granted" if has_access else "Subscription required",
                "subscription": user_tier.value,
                "required_tier": self._get_required_tier(feature_access_level),
                "feature": feature
            }
            
        except Exception as e:
            return {
                "has_access": False,
                "reason": f"Error: {str(e)}",
                "subscription": "unknown"
            }
    
    def _check_tier_access(self, user_tier: SubscriptionTier, feature_access: FeatureAccess) -> bool:
        """Tier erişim kontrolü"""
        if feature_access == FeatureAccess.FREE_ONLY:
            return True
        elif feature_access == FeatureAccess.BASIC_PLUS:
            return user_tier in [SubscriptionTier.BASIC, SubscriptionTier.PREMIUM, SubscriptionTier.PRO, SubscriptionTier.GOD_MODE]
        elif feature_access == FeatureAccess.PREMIUM_PLUS:
            return user_tier in [SubscriptionTier.PREMIUM, SubscriptionTier.PRO, SubscriptionTier.GOD_MODE]
        elif feature_access == FeatureAccess.PRO_ONLY:
            return user_tier in [SubscriptionTier.PRO, SubscriptionTier.GOD_MODE]
        elif feature_access == FeatureAccess.GOD_ONLY:
            return user_tier == SubscriptionTier.GOD_MODE
        else:
            return False
    
    def _get_required_tier(self, feature_access: FeatureAccess) -> str:
        """Gerekli tier'ı getir"""
        if feature_access == FeatureAccess.FREE_ONLY:
            return "free"
        elif feature_access == FeatureAccess.BASIC_PLUS:
            return "basic"
        elif feature_access == FeatureAccess.PREMIUM_PLUS:
            return "premium"
        elif feature_access == FeatureAccess.PRO_ONLY:
            return "pro"
        elif feature_access == FeatureAccess.GOD_ONLY:
            return "god_mode"
        else:
            return "unknown"
    
    def check_usage_limits(self, user_email: str, limit_type: str) -> Dict[str, Any]:
        """Kullanım limitlerini kontrol et"""
        try:
            user = self.demo_users.get(user_email)
            if not user:
                return {
                    "within_limit": False,
                    "reason": "User not found",
                    "current_usage": 0,
                    "limit": 0
                }
            
            user_tier = user["subscription"]
            usage_stats = user["usage_stats"]
            limits = self.subscription_tiers[user_tier]["limits"]
            
            # Limit kontrolü
            if limit_type == "signals_per_day":
                current = usage_stats["signals_today"]
                limit = limits["max_signals_per_day"]
            elif limit_type == "api_calls_per_day":
                current = usage_stats["api_calls_today"]
                limit = limits["api_calls_per_day"]
            elif limit_type == "backtest_runs_per_month":
                current = usage_stats["backtest_runs_this_month"]
                limit = limits["backtest_runs_per_month"]
            elif limit_type == "real_time_minutes":
                current = usage_stats["real_time_minutes_used"]
                limit = limits["real_time_data_minutes"]
            else:
                return {
                    "within_limit": False,
                    "reason": "Unknown limit type",
                    "current_usage": 0,
                    "limit": 0
                }
            
            within_limit = current < limit
            
            return {
                "within_limit": within_limit,
                "reason": "Within limit" if within_limit else "Limit exceeded",
                "current_usage": current,
                "limit": limit,
                "usage_percentage": (current / limit * 100) if limit > 0 else 0,
                "subscription": user_tier.value
            }
            
        except Exception as e:
            return {
                "within_limit": False,
                "reason": f"Error: {str(e)}",
                "current_usage": 0,
                "limit": 0
            }
    
    def get_user_subscription(self, user_email: str) -> Dict[str, Any]:
        """Kullanıcının abonelik bilgilerini getir"""
        try:
            user = self.demo_users.get(user_email)
            if not user:
                return {
                    "error": "User not found",
                    "subscription": "unknown"
                }
            
            user_tier = user["subscription"]
            tier_data = self.subscription_tiers[user_tier]
            
            return {
                "user_email": user_email,
                "subscription": user_tier.value,
                "subscription_name": tier_data["name"],
                "price": tier_data["price"],
                "currency": tier_data["currency"],
                "duration_days": tier_data["duration_days"],
                "features": tier_data["features"],
                "limits": tier_data["limits"],
                "subscription_start": user["subscription_start"],
                "subscription_end": user["subscription_end"],
                "usage_stats": user["usage_stats"],
                "is_active": True,  # Demo için her zaman aktif
                "days_remaining": self._calculate_days_remaining(user["subscription_end"])
            }
            
        except Exception as e:
            return {
                "error": f"Error: {str(e)}",
                "subscription": "unknown"
            }
    
    def _calculate_days_remaining(self, subscription_end: str) -> int:
        """Kalan gün sayısını hesapla"""
        try:
            end_date = datetime.fromisoformat(subscription_end)
            remaining = (end_date - datetime.now()).days
            return max(0, remaining)
        except:
            return 0
    
    def upgrade_subscription(self, user_email: str, new_tier: SubscriptionTier) -> Dict[str, Any]:
        """Abonelik yükseltme"""
        try:
            user = self.demo_users.get(user_email)
            if not user:
                return {
                    "success": False,
                    "error": "User not found"
                }
            
            current_tier = user["subscription"]
            new_tier_data = self.subscription_tiers[new_tier]
            
            # Tier yükseltme kontrolü
            if self._is_tier_upgrade(current_tier, new_tier):
                # Demo için abonelik güncelle
                user["subscription"] = new_tier
                user["subscription_start"] = datetime.now().isoformat()
                user["subscription_end"] = (datetime.now() + timedelta(days=new_tier_data["duration_days"])).isoformat()
                
                return {
                    "success": True,
                    "message": f"Subscription upgraded to {new_tier_data['name']}",
                    "old_tier": current_tier.value,
                    "new_tier": new_tier.value,
                    "new_features": new_tier_data["features"],
                    "new_limits": new_tier_data["limits"],
                    "subscription_end": user["subscription_end"]
                }
            else:
                return {
                    "success": False,
                    "error": "Invalid tier upgrade",
                    "current_tier": current_tier.value,
                    "requested_tier": new_tier.value
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Error: {str(e)}"
            }
    
    def _is_tier_upgrade(self, current_tier: SubscriptionTier, new_tier: SubscriptionTier) -> bool:
        """Tier yükseltme kontrolü"""
        tier_order = [
            SubscriptionTier.FREE,
            SubscriptionTier.BASIC,
            SubscriptionTier.PREMIUM,
            SubscriptionTier.PRO,
            SubscriptionTier.GOD_MODE
        ]
        
        current_index = tier_order.index(current_tier)
        new_index = tier_order.index(new_tier)
        
        return new_index > current_index
    
    def get_upgrade_recommendations(self, user_email: str) -> Dict[str, Any]:
        """Yükseltme önerileri"""
        try:
            user = self.demo_users.get(user_email)
            if not user:
                return {
                    "error": "User not found",
                    "recommendations": []
                }
            
            current_tier = user["subscription"]
            usage_stats = user["usage_stats"]
            current_limits = self.subscription_tiers[current_tier]["limits"]
            
            recommendations = []
            
            # Kullanım bazlı öneriler
            if usage_stats["signals_today"] >= current_limits["max_signals_per_day"] * 0.8:
                recommendations.append({
                    "type": "usage_limit",
                    "feature": "signals_per_day",
                    "current_usage": usage_stats["signals_today"],
                    "limit": current_limits["max_signals_per_day"],
                    "recommendation": "Upgrade to get more daily signals"
                })
            
            if usage_stats["api_calls_today"] >= current_limits["api_calls_per_day"] * 0.8:
                recommendations.append({
                    "type": "usage_limit",
                    "feature": "api_calls_per_day",
                    "current_usage": usage_stats["api_calls_today"],
                    "limit": current_limits["api_calls_per_day"],
                    "recommendation": "Upgrade to get more API calls"
                })
            
            if usage_stats["backtest_runs_this_month"] >= current_limits["backtest_runs_per_month"] * 0.8:
                recommendations.append({
                    "type": "usage_limit",
                    "feature": "backtest_runs_per_month",
                    "current_usage": usage_stats["backtest_runs_this_month"],
                    "limit": current_limits["backtest_runs_per_month"],
                    "recommendation": "Upgrade to get more backtest runs"
                })
            
            # Tier bazlı öneriler
            if current_tier == SubscriptionTier.FREE:
                recommendations.append({
                    "type": "feature_access",
                    "feature": "ai_modelleri",
                    "recommendation": "Upgrade to Premium to access AI models"
                })
            
            if current_tier in [SubscriptionTier.FREE, SubscriptionTier.BASIC]:
                recommendations.append({
                    "type": "feature_access",
                    "feature": "sosyal_trading",
                    "recommendation": "Upgrade to Pro to access social trading"
                })
            
            return {
                "success": True,
                "current_tier": current_tier.value,
                "recommendations": recommendations,
                "total_recommendations": len(recommendations)
            }
            
        except Exception as e:
            return {
                "error": f"Error: {str(e)}",
                "recommendations": []
            }
    
    def get_subscription_analytics(self) -> Dict[str, Any]:
        """Abonelik analitiği"""
        try:
            total_users = len(self.demo_users)
            tier_distribution = {}
            total_revenue = 0
            
            for user in self.demo_users.values():
                tier = user["subscription"].value
                tier_distribution[tier] = tier_distribution.get(tier, 0) + 1
                
                tier_data = self.subscription_tiers[user["subscription"]]
                total_revenue += tier_data["price"]
            
            return {
                "success": True,
                "total_users": total_users,
                "tier_distribution": tier_distribution,
                "total_revenue": total_revenue,
                "average_revenue_per_user": total_revenue / total_users if total_users > 0 else 0,
                "conversion_rate": {
                    "free_to_basic": 0.15,  # Demo veri
                    "basic_to_premium": 0.25,
                    "premium_to_pro": 0.10
                },
                "churn_rate": 0.05,  # Demo veri
                "lifetime_value": {
                    "free": 0,
                    "basic": 29.99,
                    "premium": 99.99,
                    "pro": 299.99,
                    "god_mode": 0
                }
            }
            
        except Exception as e:
            return {
                "error": f"Error: {str(e)}",
                "success": False
            }
