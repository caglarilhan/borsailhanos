"""
Debug script to find the Series error
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

# Try to reproduce the error
try:
    # Simulate the error
    target_column = 'target'
    
    # Feature ve target ayır
    X = data.drop([target_column], axis=1, errors='ignore')
    y = data[target_column].values  # Convert to numpy array
    
    # Numeric kolonları seç
    numeric_cols = X.select_dtypes(include=[np.number]).columns.tolist()
    X = X[numeric_cols].values  # Convert to numpy array
    
    # NaN değerleri ffill/bfill ile doldur
    X = pd.DataFrame(X, columns=numeric_cols)
    X = X.fillna(method='ffill').fillna(method='bfill')
    
    # Hala NaN varsa 0 ile doldur
    X = X.fillna(0)
    
    print("✅ Data preparation successful")
    print("X shape:", X.shape)
    print("y shape:", y.shape)
    
except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
