"""
Simple test to isolate the Series error
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

try:
    # Simulate the exact error
    target_column = 'target'
    
    # Feature ve target ayır
    X = data.drop([target_column], axis=1, errors='ignore')
    y = data[target_column].values  # Convert to numpy array
    
    # Numeric kolonları seç
    numeric_cols = X.select_dtypes(include=[np.number]).columns.tolist()
    X = X[numeric_cols].values  # Convert to numpy array
    
    # NaN değerleri ffill/bfill ile doldur
    X = pd.DataFrame(X, columns=numeric_cols)
    X = X.ffill().bfill()
    
    # Hala NaN varsa 0 ile doldur
    X = X.fillna(0)
    
    print("✅ Data preparation successful")
    print("X shape:", X.shape)
    print("y shape:", y.shape)
    
    # Now try to use X and y in a simple operation
    print("X type:", type(X))
    print("y type:", type(y))
    
    # Try to access X and y
    print("X first row:", X.iloc[0].values)
    print("y first value:", y[0])
    
    # Try to create a simple model
    from sklearn.ensemble import RandomForestRegressor
    model = RandomForestRegressor(n_estimators=10, random_state=42)
    model.fit(X, y)
    print("✅ Model training successful")
    
except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
