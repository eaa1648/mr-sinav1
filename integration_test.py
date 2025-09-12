"""
Integration test to verify all services are working together
"""

import requests
import time

def test_services():
    print("Running integration test...")
    
    # Test 1: Check if Next.js frontend is running
    try:
        response = requests.get('http://localhost:3001', timeout=5)
        if response.status_code == 200:
            print("✅ Next.js frontend is running")
        else:
            print(f"❌ Next.js frontend returned status code: {response.status_code}")
    except Exception as e:
        print(f"❌ Next.js frontend is not accessible: {e}")
    
    # Test 2: Check if Python service is running
    try:
        response = requests.get('http://localhost:8001/health', timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'healthy':
                print("✅ Python service is running and healthy")
            else:
                print(f"❌ Python service health check failed: {data}")
        else:
            print(f"❌ Python service returned status code: {response.status_code}")
    except Exception as e:
        print(f"❌ Python service is not accessible: {e}")
    
    # Test 3: Check FreeSurfer endpoints
    try:
        response = requests.get('http://localhost:8001/', timeout=5)
        if response.status_code == 200:
            data = response.json()
            if 'FreeSurfer' in str(data):
                print("✅ FreeSurfer endpoints are available")
            else:
                print("⚠️  Python service is running but may not have FreeSurfer capabilities")
        else:
            print(f"❌ Python service info endpoint returned status code: {response.status_code}")
    except Exception as e:
        print(f"❌ Could not access Python service info endpoint: {e}")
    
    print("Integration test completed.")

if __name__ == "__main__":
    test_services()