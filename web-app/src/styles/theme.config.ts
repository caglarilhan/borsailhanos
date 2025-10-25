/**
 * BIST AI Smart Trader - Institutional Theme v3.3
 * Kurumsal seviye görsel kimlik
 */

export const institutionalTheme = {
  // 🎨 Base Colors (Deep Graphite)
  colors: {
    // Backgrounds
    background: {
      primary: '#0B0C10',      // Derin antrasit
      secondary: '#1F1F2E',    // Kart arka planı (hafif mor alt ton)
      tertiary: '#2A2A3E',     // Hover states
      elevated: '#333347'      // Modal, dropdown
    },
    
    // Accent Colors
    accent: {
      primary: '#00E0FF',      // Electric Cyan (AI aktif)
      secondary: '#FFB600',    // Solar Gold (uyarılar)
      success: '#00FF88',      // Parlak yeşil (kazanç)
      danger: '#FF4444',       // Kırmızı (kayıp)
      warning: '#FFA500',      // Turuncu (dikkat)
      info: '#4A9EFF'          // Mavi (bilgi)
    },
    
    // Text
    text: {
      primary: '#FFFFFF',      // Ana metin
      secondary: '#B8B8D0',    // İkincil metin
      tertiary: '#8B8BA0',     // Yardımcı metin
      disabled: '#5A5A6E'      // Disabled state
    },
    
    // Borders & Dividers
    border: {
      default: '#2A2A3E',
      light: '#3A3A4E',
      heavy: '#4A4A5E'
    },
    
    // Gradients
    gradients: {
      primary: 'linear-gradient(90deg, #00FFFF 0%, #FFB600 100%)',
      success: 'linear-gradient(135deg, #00FF88 0%, #00E0FF 100%)',
      danger: 'linear-gradient(135deg, #FF4444 0%, #FF8844 100%)',
      neural: 'linear-gradient(180deg, #0B0C10 0%, #1F1F2E 100%)'
    }
  },
  
  // 📏 Spacing & Sizing
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem'    // 64px
  },
  
  // 🔤 Typography
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Menlo', 'monospace']
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '2rem',    // 32px
      '4xl': '2.5rem'   // 40px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },
  
  // 🎭 Effects
  effects: {
    blur: {
      glass: 'blur(16px)',
      modal: 'blur(8px)'
    },
    shadow: {
      sm: '0 2px 4px rgba(0, 224, 255, 0.1)',
      md: '0 4px 8px rgba(0, 224, 255, 0.15)',
      lg: '0 8px 16px rgba(0, 224, 255, 0.2)',
      xl: '0 16px 32px rgba(0, 224, 255, 0.25)',
      glow: '0 0 20px rgba(0, 224, 255, 0.3)'
    },
    borderRadius: {
      sm: '0.375rem',   // 6px
      md: '0.5rem',     // 8px
      lg: '0.75rem',    // 12px
      xl: '1rem',       // 16px
      '2xl': '1.5rem',  // 24px
      full: '9999px'
    }
  },
  
  // ⚡ Animations
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    easing: {
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
  }
};

// 🌓 Light Mode (Opsiyonel)
export const lightTheme = {
  colors: {
    background: {
      primary: '#FAFAFA',
      secondary: '#FFFFFF',
      tertiary: '#F5F5F5',
      elevated: '#EFEFEF'
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#4A4A4A',
      tertiary: '#7A7A7A',
      disabled: '#AAAAAA'
    }
    // ... (accent colors aynı kalır)
  }
};

export default institutionalTheme;
