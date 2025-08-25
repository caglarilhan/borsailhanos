"""
Debug Final Integrator step by step
"""

import numpy as np
import pandas as pd

# Test data
data = pd.DataFrame({
    'feature1': np.random.randn(100),
    'feature2': np.random.randn(100),
    'feature3': np.random.randn(100),
    'target': np.random.randn(100)
})

print("Test data shape:", data.shape)
print("Columns:", data.columns.tolist())

try:
    # Step 1: Data preparation
    print("\n🔍 Step 1: Data preparation...")
    target_column = 'target'
    
    # Veri temizleme
    data_clean = data.copy()
    print("  Data copy successful")
    
    # NaN değerleri temizle
    data_clean = data_clean.dropna()
    print("  Dropna successful")
    
    # Infinite değerleri temizle
    data_clean = data_clean.replace([np.inf, -np.inf], np.nan)
    data_clean = data_clean.dropna()
    print("  Infinite cleanup successful")
    
    # Target kolonu kontrolü
    if target_column not in data_clean.columns:
        print(f"❌ Hedef kolon bulunamadı: {target_column}")
        exit(1)
    print("  Target column check successful")
    
    # Feature ve target ayır
    X = data_clean.drop([target_column], axis=1, errors='ignore')
    y = data_clean[target_column].values  # Convert to numpy array
    print("  Feature/target separation successful")
    
    # Numeric kolonları seç
    numeric_cols = X.select_dtypes(include=[np.number]).columns.tolist()
    X = X[numeric_cols]
    print("  Numeric column selection successful")
    
    # NaN değerleri ffill/bfill ile doldur
    X = X.ffill().bfill()
    print("  Ffill/bfill successful")
    
    # Hala NaN varsa 0 ile doldur
    X = X.fillna(0)
    print("  Final fillna successful")
    
    # Convert to numpy array
    X = X.values
    print("  Convert to numpy successful")
    
    print(f"✅ Data preparation successful: X={X.shape}, y={y.shape}")
    
    # Step 2: Try to import and use Final100AccuracyIntegrator
    print("\n🔍 Step 2: Import Final100AccuracyIntegrator...")
    
    try:
        from final_100_accuracy_integrator import Final100AccuracyIntegrator
        print("  Import successful")
        
        # Create instance
        integrator = Final100AccuracyIntegrator()
        print("  Instance creation successful")
        
        # Try to call the method
        print("\n🔍 Step 3: Call final_accuracy_optimization...")
        results = integrator.final_accuracy_optimization(data, 'target', max_iterations=1)
        print("  Method call successful")
        
        if results:
            print(f"✅ Final accuracy: {results['final_accuracy']*100:.1f}%")
        else:
            print("⚠️ No results returned")
            
    except Exception as e:
        print(f"❌ Error in Final100AccuracyIntegrator: {str(e)}")
        import traceback
        traceback.print_exc()
    
except Exception as e:
    print(f"❌ Error in data preparation: {str(e)}")
    import traceback
    traceback.print_exc()
