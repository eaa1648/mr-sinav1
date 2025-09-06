#!/bin/bash

# Brain MRI Processor Runner Script
# This script activates the virtual environment and runs the brain MRI processor

echo "Brain MRI Processor - Environment Setup"
echo "========================================"

# Change to the script directory
cd "$(dirname "$0")"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Virtual environment not found. Creating one..."
    python3 -m venv venv
    echo "Virtual environment created."
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Check if requirements are installed
if ! python -c "import torch, torchvision, numpy, cv2, nibabel, pydicom" 2>/dev/null; then
    echo "Installing required dependencies..."
    pip install -r requirements.txt
    echo "Dependencies installed."
fi

# Run the brain MRI processor
echo "Starting Brain MRI Processor..."
python brain_mri_processor.py

echo "Process completed."