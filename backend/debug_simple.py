"""
Simple debug script to test the final integrator method call
"""

import pandas as pd
import numpy as np

# Test data
data = pd.DataFrame({
    'feature1': np.random.randn(100),
    'feature2': np.random.randn(100),
    'target': np.random.randn(100)
})

print("Test data shape:", data.shape)
print("Columns:", data.columns.tolist())
print("Target column:", 'target' in data.columns)

try:
    # Import and create integrator
    from final_100_accuracy_integrator import Final100AccuracyIntegrator
    integrator = Final100AccuracyIntegrator()
    print("✅ Integrator created successfully")
    
    # Try to call the method
    print("\n🔍 Trying to call final_accuracy_optimization...")
    results = integrator.final_accuracy_optimization(data, 'target', max_iterations=1)
    print("✅ Method call successful")
    
    if results:
        print(f"Final accuracy: {results['final_accuracy']*100:.1f}%")
    else:
        print("No results returned")
        
except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
