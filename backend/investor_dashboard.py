#!/usr/bin/env python3
"""
📊 Investor Dashboard
PRD v2.0 - Demo dashboard for investors
"""

import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from datetime import datetime, timedelta
import requests
import json

st.set_page_config(
    page_title="BIST AI Smart Trader v2.0",
    page_icon="��",
    layout="wide"
)

def main():
    st.title("🚀 BIST AI Smart Trader v2.0")
    st.markdown("**PRD v2.0 - Yapay Zeka Destekli Yatırım Danışmanı**")
    
    # Sidebar
    st.sidebar.title("📊 Analiz Seçenekleri")
    
    analysis_type = st.sidebar.selectbox(
        "Analiz Türü",
        ["Kapsamlı Analiz", "Finansal Sıralama", "Portföy Optimizasyonu", "Pattern Analizi"]
    )
    
    symbol = st.sidebar.text_input("Hisse Sembolü", value="GARAN.IS")
    
    if analysis_type == "Kapsamlı Analiz":
        show_comprehensive_analysis(symbol)
    elif analysis_type == "Finansal Sıralama":
        show_financial_ranking()
    elif analysis_type == "Portföy Optimizasyonu":
        show_portfolio_optimization()
    elif analysis_type == "Pattern Analizi":
        show_pattern_analysis(symbol)

def show_comprehensive_analysis(symbol):
    st.header(f"📈 {symbol} Kapsamlı Analiz")
    
    # Demo data
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("TOPSIS Skor", "0.78", "0.05")
    
    with col2:
        st.metric("AI Tahmin", "+3.2%", "0.85 güven")
    
    with col3:
        st.metric("Sentiment", "Pozitif", "+15%")
    
    with col4:
        st.metric("Portfolio Ağırlık", "25%", "Önerilen")
    
    # Charts
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("📊 AI Ensemble Tahmini")
        
        models = ['LightGBM', 'LSTM', 'TimeGPT', 'Ensemble']
        predictions = [0.032, 0.028, 0.035, 0.032]
        
        fig = go.Figure(data=[
            go.Bar(x=models, y=predictions, marker_color=['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'])
        ])
        fig.update_layout(title="Model Tahminleri (%)", height=400)
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        st.subheader("🎯 Pattern Tespiti")
        
        patterns = ['EMA Cross', 'Bullish Engulfing', 'Gartley', 'Support Break']
        confidences = [0.85, 0.72, 0.68, 0.91]
        
        fig = go.Figure(data=[
            go.Scatter(x=patterns, y=confidences, mode='markers+lines', 
                      marker=dict(size=15, color=confidences, colorscale='Viridis'))
        ])
        fig.update_layout(title="Pattern Güven Skorları", height=400)
        st.plotly_chart(fig, use_container_width=True)
    
    # Detailed analysis
    st.subheader("🔍 Detaylı Analiz")
    
    tab1, tab2, tab3, tab4 = st.tabs(["Finansal", "Teknik", "Sentiment", "XAI"])
    
    with tab1:
        st.write("**Finansal Sağlık Skoru: 82/100**")
        metrics_df = pd.DataFrame({
            'Metrik': ['ROE', 'ROA', 'Debt/Equity', 'Current Ratio', 'PE Ratio'],
            'Değer': ['18.5%', '12.3%', '0.45', '1.85', '12.4'],
            'Sektör Ort.': ['15.2%', '10.1%', '0.62', '1.72', '14.2'],
            'Durum': ['Üstünde', 'Üstünde', 'İyi', 'İyi', 'İyi']
        })
        st.dataframe(metrics_df)
    
    with tab2:
        st.write("**Teknik İndikatörler**")
        indicators_df = pd.DataFrame({
            'İndikatör': ['RSI', 'MACD', 'Bollinger', 'Volume'],
            'Değer': [65.2, 'Pozitif', 'Üst Band', 'Yüksek'],
            'Sinyal': ['Nötr', 'Al', 'Sat', 'Al']
        })
        st.dataframe(indicators_df)
    
    with tab3:
        st.write("**Sentiment Analizi**")
        st.write("📰 **Son Haberler:** 12 pozitif, 3 negatif, 2 nötr")
        st.write("🎭 **Genel Sentiment:** +0.65 (Güçlü Pozitif)")
        st.write("📈 **Haber Etkisi:** %85 güven ile pozitif trend")
    
    with tab4:
        st.write("**XAI Açıklama**")
        st.write("🤖 **Bu sinyal neden öneriliyor?**")
        st.write("• %40 - Teknik analiz (EMA kesişimi)")
        st.write("• %30 - Finansal sağlık (Güçlü ROE)")
        st.write("• %20 - Sentiment (Pozitif haberler)")
        st.write("• %10 - Piyasa momentum")

def show_financial_ranking():
    st.header("🏆 Finansal Sıralama (Grey TOPSIS)")
    
    ranking_df = pd.DataFrame({
        'Sıra': [1, 2, 3, 4, 5],
        'Sembol': ['ASELS.IS', 'GARAN.IS', 'SISE.IS', 'AKBNK.IS', 'EREGL.IS'],
        'TOPSIS Skor': [0.892, 0.847, 0.823, 0.789, 0.756],
        'Finansal Sağlık': [95, 88, 85, 82, 78],
        'ROE (%)': [22.4, 18.5, 16.8, 15.2, 14.1],
        'Debt/Equity': [0.25, 0.45, 0.38, 0.52, 0.68]
    })
    
    st.dataframe(ranking_df, use_container_width=True)
    
    # TOPSIS Score chart
    fig = px.bar(ranking_df, x='Sembol', y='TOPSIS Skor', 
                 title="TOPSIS Sıralama Skorları",
                 color='TOPSIS Skor', color_continuous_scale='Viridis')
    st.plotly_chart(fig, use_container_width=True)

def show_portfolio_optimization():
    st.header("🎯 Portföy Optimizasyonu (RL Agent)")
    
    portfolio_df = pd.DataFrame({
        'Sembol': ['ASELS.IS', 'GARAN.IS', 'SISE.IS', 'AKBNK.IS', 'YKBNK.IS'],
        'Önerilen Ağırlık (%)': [30, 25, 20, 15, 10],
        'Mevcut Ağırlık (%)': [20, 30, 15, 20, 15],
        'Aksiyon': ['ARTTIR', 'AZALT', 'ARTTIR', 'AZALT', 'AZALT'],
        'Beklenen Getiri (%)': [8.5, 6.2, 7.8, 5.9, 4.3],
        'Risk Skoru': [0.35, 0.28, 0.32, 0.31, 0.42]
    })
    
    st.dataframe(portfolio_df, use_container_width=True)
    
    # Portfolio allocation pie chart
    fig = px.pie(portfolio_df, values='Önerilen Ağırlık (%)', names='Sembol',
                 title="Önerilen Portföy Dağılımı")
    st.plotly_chart(fig, use_container_width=True)

def show_pattern_analysis(symbol):
    st.header(f"📊 {symbol} Pattern Analizi")
    
    patterns_df = pd.DataFrame({
        'Pattern': ['EMA Cross Bullish', 'Bullish Engulfing', 'Gartley Bullish', 'Support Breakout'],
        'Güven': [0.85, 0.72, 0.68, 0.91],
        'Giriş': [214.50, 213.80, 215.20, 214.00],
        'Stop Loss': [210.20, 209.50, 211.80, 210.50],
        'Take Profit': [220.80, 219.40, 221.60, 220.00],
        'Risk/Reward': [1.5, 1.5, 1.6, 1.4]
    })
    
    st.dataframe(patterns_df, use_container_width=True)
    
    # Pattern confidence chart
    fig = px.bar(patterns_df, x='Pattern', y='Güven',
                 title="Pattern Güven Skorları",
                 color='Güven', color_continuous_scale='RdYlGn')
    st.plotly_chart(fig, use_container_width=True)

if __name__ == "__main__":
    main()
