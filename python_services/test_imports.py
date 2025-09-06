#!/usr/bin/env python3
"""
Test script to verify that all required imports work correctly
"""

print("Testing imports...")

# Test FastAPI imports
try:
    from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
    print("✓ FastAPI core imports - SUCCESS")
except ImportError as e:
    print(f"✗ FastAPI core imports - FAILED: {e}")

# Test CORSMiddleware import
try:
    from fastapi.middleware.cors import CORSMiddleware
    print("✓ CORSMiddleware import - SUCCESS")
except ImportError as e:
    print(f"✗ CORSMiddleware import - FAILED: {e}")

# Test uvicorn import
try:
    import uvicorn
    print("✓ Uvicorn import - SUCCESS")
except ImportError as e:
    print(f"✗ Uvicorn import - FAILED: {e}")

# Test other imports
try:
    import os
    import json
    import tempfile
    import logging
    from typing import Dict, List, Optional
    print("✓ Standard library imports - SUCCESS")
except ImportError as e:
    print(f"✗ Standard library imports - FAILED: {e}")

print("Import test completed.")

def test_imports():
    """Test all required imports"""
    imports = [
        ("torch", "PyTorch"),
        ("torch.nn", "PyTorch NN"),
        ("torchvision.transforms", "TorchVision Transforms"),
        ("torchvision.models", "TorchVision Models"),
        ("numpy", "NumPy"),
        ("cv2", "OpenCV"),
        ("PIL", "Pillow"),
        ("nibabel", "NiBabel"),
        ("pydicom", "PyDICOM"),
        ("scipy", "SciPy"),
        ("scipy.ndimage", "SciPy ndimage"),
        ("fastapi", "FastAPI"),
        ("uvicorn", "Uvicorn")
    ]
    
    print("Testing imports...")
    print("=" * 50)
    
    failed_imports = []
    
    for import_name, display_name in imports:
        try:
            __import__(import_name)
            print(f"✓ {display_name} ({import_name}) - OK")
        except ImportError as e:
            print(f"✗ {display_name} ({import_name}) - FAILED: {e}")
            failed_imports.append(import_name)
    
    print("=" * 50)
    
    if failed_imports:
        print(f"Failed imports: {', '.join(failed_imports)}")
        print("\nTo fix these issues, install the missing packages:")
        print("pip install torch torchvision numpy opencv-python pillow nibabel pydicom scipy fastapi uvicorn")
        return False
    else:
        print("All imports successful!")
        return True

def test_local_imports():
    """Test imports from local modules"""
    print("\nTesting local imports...")
    print("=" * 50)
    
    try:
        from brain_mri_processor import BrainMRIProcessor
        print("✓ BrainMRIProcessor - OK")
        return True
    except ImportError as e:
        print(f"✗ BrainMRIProcessor - FAILED: {e}")
        return False

if __name__ == "__main__":
    success1 = test_imports()
    success2 = test_local_imports()
    
    if success1 and success2:
        print("\n🎉 All tests passed! Environment is ready.")
    else:
        print("\n❌ Some tests failed. Please check the errors above.")