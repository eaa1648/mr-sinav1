"""
Test script to verify that all clinical application modules can be imported without errors
"""

def test_imports():
    """Test importing all clinical application modules"""
    modules = [
        "klinik_app",
        "hasta_gidisat", 
        "ilac",
        "analiz_raporlama",
        "model_egitimi",
        "veri_hazirla",
        "initialize_clinical_data"
    ]
    
    failed_imports = []
    
    for module in modules:
        try:
            __import__(module)
            print(f"✓ {module} imported successfully")
        except ImportError as e:
            print(f"✗ Failed to import {module}: {e}")
            failed_imports.append(module)
        except Exception as e:
            print(f"✗ Error importing {module}: {e}")
            failed_imports.append(module)
    
    if failed_imports:
        print(f"\nFailed to import {len(failed_imports)} modules: {', '.join(failed_imports)}")
        return False
    else:
        print(f"\nAll {len(modules)} modules imported successfully!")
        return True

if __name__ == "__main__":
    success = test_imports()
    exit(0 if success else 1)