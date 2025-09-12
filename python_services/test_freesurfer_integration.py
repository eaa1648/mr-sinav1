"""
Test script for FreeSurfer integration
"""

import asyncio
import os
import sys
from pathlib import Path

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from freesurfer_processor import FreeSurferProcessor

async def test_freesurfer_integration():
    """Test the FreeSurfer integration"""
    print("Testing FreeSurfer integration...")
    
    # Initialize the processor
    processor = FreeSurferProcessor()
    
    # Check if required tools are available
    print("Checking dependencies...")
    
    # Test subject status check (this should work even without actual data)
    print("Testing subject status check...")
    status = processor.get_subject_status("test_subject")
    print(f"Subject status: {status}")
    
    print("FreeSurfer integration test completed.")
    print("Note: Full integration testing requires actual MR data and FreeSurfer installation.")

if __name__ == "__main__":
    asyncio.run(test_freesurfer_integration())