#!/bin/bash

# Mr. Sina Python Services Setup and Run Script

echo "🧠 Mr. Sina Brain MRI Processing Service Setup"
echo "=============================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "requirements.txt" ]; then
    echo "❌ requirements.txt not found. Make sure you're in the python_services directory."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install requirements
echo "📥 Installing Python dependencies..."
pip install -r requirements.txt

# Check PyTorch installation
echo "🔍 Checking PyTorch installation..."
python3 -c "import torch; print(f'PyTorch version: {torch.__version__}'); print(f'CUDA available: {torch.cuda.is_available()}')"

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "🚀 Starting Mr. Sina Brain MRI Processing Service..."
echo "   - Service will run on: http://localhost:8001"
echo "   - Health check: http://localhost:8001/health"
echo "   - API docs: http://localhost:8001/docs"
echo ""

# Start the service
python3 main.py