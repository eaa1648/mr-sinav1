"""
Verification script to ensure all components are properly set up
"""

import sys
import os

def verify_virtual_environment():
    """Verify that we're in the correct virtual environment"""
    venv_path = os.path.join(os.path.dirname(__file__), 'venv')
    if os.path.exists(venv_path):
        print("✅ Virtual environment found")
        return True
    else:
        print("❌ Virtual environment not found")
        return False

def verify_python_packages():
    """Verify that all required Python packages are installed"""
    required_packages = [
        'streamlit',
        'pandas',
        'plotly',
        'numpy',
        'scikit-learn',
        'xgboost',
        'torch',
        'fastapi'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            if package == 'scikit-learn':
                import sklearn
            else:
                __import__(package)
            print(f"✅ {package} imported successfully")
        except ImportError:
            print(f"❌ {package} not found")
            missing_packages.append(package)
    
    return len(missing_packages) == 0

def verify_clinical_apps():
    """Verify that clinical app modules can be imported"""
    clinical_apps = [
        'ilac',
        'hasta_gidisat',
        'analiz_raporlama',
        'klinik_app',
        'model_egitimi',
        'veri_hazirla'
    ]
    
    sys.path.append(os.path.join(os.path.dirname(__file__), 'clinical_app'))
    
    failed_imports = []
    
    for app in clinical_apps:
        try:
            __import__(app)
            print(f"✅ {app}.py imported successfully")
        except Exception as e:
            print(f"❌ {app}.py import failed: {e}")
            failed_imports.append(app)
    
    return len(failed_imports) == 0

def verify_mr_processing_files():
    """Verify that MR processing integration files exist"""
    required_files = [
        'analiz_yoneticisi_nihai.sh',
        'freesurfer_processor.py'
    ]
    
    missing_files = []
    
    for file in required_files:
        file_path = os.path.join(os.path.dirname(__file__), file)
        if os.path.exists(file_path):
            print(f"✅ {file} found")
        else:
            print(f"❌ {file} not found")
            missing_files.append(file)
    
    return len(missing_files) == 0

def main():
    """Main verification function"""
    print("🔍 Verifying Mr. Sina project setup...\n")
    
    # Check virtual environment
    print("1. Checking virtual environment...")
    venv_ok = verify_virtual_environment()
    print()
    
    # Check Python packages
    print("2. Checking Python packages...")
    packages_ok = verify_python_packages()
    print()
    
    # Check clinical apps
    print("3. Checking clinical app imports...")
    clinical_ok = verify_clinical_apps()
    print()
    
    # Check MR processing files
    print("4. Checking MR processing integration files...")
    mr_processing_ok = verify_mr_processing_files()
    print()
    
    # Summary
    print("📋 SUMMARY")
    print(f"Virtual Environment: {'✅ OK' if venv_ok else '❌ FAILED'}")
    print(f"Python Packages: {'✅ OK' if packages_ok else '❌ FAILED'}")
    print(f"Clinical Apps: {'✅ OK' if clinical_ok else '❌ FAILED'}")
    print(f"MR Processing Files: {'✅ OK' if mr_processing_ok else '❌ FAILED'}")
    
    overall_success = venv_ok and packages_ok and clinical_ok and mr_processing_ok
    
    if overall_success:
        print("\n🎉 All verifications passed! The setup is ready to use.")
        return True
    else:
        print("\n❌ Some verifications failed. Please check the errors above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)