#!/usr/bin/env python3
"""
Test script to verify that all dependencies for brain_mri_processor.py are working correctly
"""

def test_imports():
    """Test all required imports"""
    print("Testing imports...")
    
    try:
        import torch  # type: ignore
        import torch.nn as nn  # type: ignore
        import torchvision.transforms as transforms  # type: ignore
        from torchvision.models import resnet50, ResNet50_Weights  # type: ignore
        print("✅ PyTorch imports successful")
    except ImportError as e:
        print(f"❌ PyTorch import failed: {e}")
        return False
    
    try:
        import numpy as np  # type: ignore
        print("✅ NumPy import successful")
    except ImportError as e:
        print(f"❌ NumPy import failed: {e}")
        return False
    
    try:
        import cv2  # type: ignore
        print("✅ OpenCV import successful")
    except ImportError as e:
        print(f"❌ OpenCV import failed: {e}")
        return False
    
    try:
        from PIL import Image  # type: ignore
        print("✅ PIL import successful")
    except ImportError as e:
        print(f"❌ PIL import failed: {e}")
        return False
    
    try:
        import nibabel as nib  # type: ignore
        print("✅ NiBabel import successful")
    except ImportError as e:
        print(f"❌ NiBabel import failed: {e}")
        return False
    
    try:
        import pydicom  # type: ignore
        print("✅ PyDICOM import successful")
    except ImportError as e:
        print(f"❌ PyDICOM import failed: {e}")
        return False
    
    try:
        import fastapi  # type: ignore
        import uvicorn  # type: ignore
        print("✅ FastAPI imports successful")
    except ImportError as e:
        print(f"❌ FastAPI import failed: {e}")
        return False
    
    return True

def test_brain_mri_processor():
    """Test the BrainMRIProcessor class"""
    print("\nTesting BrainMRIProcessor...")
    
    try:
        from brain_mri_processor import BrainMRIProcessor
        processor = BrainMRIProcessor()
        print("✅ BrainMRIProcessor initialized successfully")
        
        # Test basic functionality
        import numpy as np  # type: ignore
        test_image = np.random.randint(0, 255, (256, 256, 128), dtype=np.uint8)
        slices = processor.extract_brain_slices(test_image, num_slices=5)
        print(f"✅ Brain slice extraction works (extracted {len(slices)} slices)")
        
        features = processor.extract_features(slices)
        print("✅ Feature extraction works")
        
        return True
        
    except Exception as e:
        print(f"❌ BrainMRIProcessor test failed: {e}")
        return False

def main():
    """Main test function"""
    print("=" * 60)
    print("Brain MRI Processor - Dependency Test")
    print("=" * 60)
    
    # Test imports
    imports_ok = test_imports()
    
    if not imports_ok:
        print("\n❌ Import tests failed. Please install missing dependencies.")
        print("Run: python setup_environment.py")
        return False
    
    # Test BrainMRIProcessor
    processor_ok = test_brain_mri_processor()
    
    if not processor_ok:
        print("\n❌ BrainMRIProcessor tests failed.")
        return False
    
    print("\n" + "=" * 60)
    print("✅ ALL TESTS PASSED!")
    print("✅ Brain MRI Processor is ready to use!")
    print("=" * 60)
    
    print("\nNext steps:")
    print("1. To start the MRI processing service: python main.py")
    print("2. The service will be available at: http://localhost:8000")
    print("3. API documentation at: http://localhost:8000/docs")
    
    return True

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)