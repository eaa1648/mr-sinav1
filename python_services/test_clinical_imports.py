"""
Test script to verify clinical app imports
"""

import sys
import os

# Add the clinical_app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'clinical_app'))

def test_imports():
    """Test importing all clinical app modules"""
    try:
        # Test importing each clinical app module
        import ilac
        print("✓ ilac.py imported successfully")
        
        import hasta_gidisat
        print("✓ hasta_gidisat.py imported successfully")
        
        import analiz_raporlama
        print("✓ analiz_raporlama.py imported successfully")
        
        import klinik_app
        print("✓ klinik_app.py imported successfully")
        
        import model_egitimi
        print("✓ model_egitimi.py imported successfully")
        
        import veri_hazirla
        print("✓ veri_hazirla.py imported successfully")
        
        print("\nAll clinical app modules imported successfully!")
        return True
        
    except Exception as e:
        print(f"Error importing clinical app modules: {e}")
        return False

if __name__ == "__main__":
    # Activate virtual environment paths
    venv_path = os.path.join(os.path.dirname(__file__), 'venv')
    if os.path.exists(venv_path):
        # Add virtual environment site-packages to path
        site_packages = os.path.join(venv_path, 'lib', 'python3.13', 'site-packages')
        if os.path.exists(site_packages):
            sys.path.insert(0, site_packages)
    
    success = test_imports()
    if success:
        print("\n✅ All clinical app imports are working correctly!")
    else:
        print("\n❌ There are issues with clinical app imports.")