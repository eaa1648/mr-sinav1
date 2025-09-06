#!/usr/bin/env python3
"""
Setup script for the Brain MRI Processor environment
This script helps ensure all dependencies are properly installed
and the virtual environment is correctly configured.
"""

import os
import sys
import subprocess
import venv
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("Warning: Python 3.8 or higher is recommended")
        print(f"Current version: {sys.version}")
        return False
    return True

def create_virtual_environment(venv_path="venv"):
    """Create a virtual environment if it doesn't exist"""
    if not os.path.exists(venv_path):
        print(f"Creating virtual environment at {venv_path}...")
        venv.create(venv_path, with_pip=True)
        print("Virtual environment created successfully!")
        return True
    else:
        print(f"Virtual environment already exists at {venv_path}")
        return False

def install_dependencies(venv_path="venv"):
    """Install required dependencies"""
    requirements_file = "requirements.txt"
    
    if not os.path.exists(requirements_file):
        print(f"Error: {requirements_file} not found!")
        return False
    
    # Determine the path to pip in the virtual environment
    if sys.platform == "win32":
        pip_path = os.path.join(venv_path, "Scripts", "pip")
    else:
        pip_path = os.path.join(venv_path, "bin", "pip")
    
    try:
        print("Installing dependencies...")
        subprocess.check_call([pip_path, "install", "-r", requirements_file])
        print("Dependencies installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error installing dependencies: {e}")
        return False

def verify_installation(venv_path="venv"):
    """Verify that all required packages are installed"""
    required_packages = [
        "torch", "torchvision", "numpy", "cv2", "PIL", 
        "nibabel", "pydicom", "scipy", "fastapi", "uvicorn"
    ]
    
    # Determine the path to python in the virtual environment
    if sys.platform == "win32":
        python_path = os.path.join(venv_path, "Scripts", "python")
    else:
        python_path = os.path.join(venv_path, "bin", "python")
    
    print("Verifying installation...")
    for package in required_packages:
        try:
            subprocess.check_call([python_path, "-c", f"import {package}"])
            print(f"✓ {package} is available")
        except subprocess.CalledProcessError:
            print(f"✗ {package} is not available")
            return False
    
    print("All required packages are available!")
    return True

def setup_vscode_config():
    """Setup VS Code configuration for better IDE support"""
    vscode_dir = ".vscode"
    if not os.path.exists(vscode_dir):
        os.makedirs(vscode_dir)
    
    settings_content = {
        "python.defaultInterpreterPath": "./venv/bin/python" if sys.platform != "win32" else "./venv/Scripts/python.exe",
        "python.terminal.activateEnvironment": True,
        "python.linting.enabled": True,
        "python.linting.pylintEnabled": False,
        "python.linting.flake8Enabled": True,
        "python.formatting.provider": "black",
        "python.analysis.typeCheckingMode": "basic"
    }
    
    settings_file = os.path.join(vscode_dir, "settings.json")
    import json
    with open(settings_file, "w") as f:
        json.dump(settings_content, f, indent=2)
    
    print("VS Code configuration updated!")

def main():
    """Main setup function"""
    print("=== Brain MRI Processor Environment Setup ===")
    
    # Check Python version
    if not check_python_version():
        response = input("Continue anyway? (y/n): ")
        if response.lower() != 'y':
            return
    
    # Create virtual environment
    venv_created = create_virtual_environment()
    
    # Install dependencies
    if install_dependencies():
        print("\nInstallation completed successfully!")
        
        # Verify installation
        if verify_installation():
            print("\nEnvironment is ready for use!")
            
            # Setup VS Code config
            setup_vscode_config()
            
            print("\nTo activate the virtual environment, run:")
            if sys.platform == "win32":
                print("  venv\\Scripts\\activate")
            else:
                print("  source venv/bin/activate")
            
            print("\nTo run the service, use:")
            print("  python main.py")
        else:
            print("\nSome packages failed to install. Please check the errors above.")
    else:
        print("\nFailed to install dependencies.")

if __name__ == "__main__":
    main()