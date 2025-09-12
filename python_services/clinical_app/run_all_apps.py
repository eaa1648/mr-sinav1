import subprocess
import sys
import os
from pathlib import Path

def run_all_apps():
    """Run all clinical applications simultaneously"""
    
    # Get the current directory
    current_dir = Path(__file__).parent
    
    # Initialize data files if they don't exist
    init_script = current_dir / "initialize_clinical_data.py"
    if init_script.exists():
        print("Initializing clinical data files...")
        subprocess.run([sys.executable, str(init_script)])
    
    # Run all Streamlit apps
    apps = [
        "klinik_app.py",
        "hasta_gidisat.py",
        "ilac.py",
        "analiz_raporlama.py"
    ]
    
    processes = []
    
    for app in apps:
        app_path = current_dir / app
        if app_path.exists():
            print(f"Starting {app}...")
            # Run each app on a different port
            port = 8501 + apps.index(app)
            process = subprocess.Popen([
                sys.executable, "-m", "streamlit", "run", 
                str(app_path), "--server.port", str(port)
            ])
            processes.append((process, app, port))
            print(f"{app} started on port {port}")
        else:
            print(f"Warning: {app} not found")
    
    print("\nAll applications started:")
    for _, app, port in processes:
        print(f"  - {app}: http://localhost:{port}")
    
    print("\nPress Ctrl+C to stop all applications")
    
    try:
        # Wait for all processes
        for process, _, _ in processes:
            process.wait()
    except KeyboardInterrupt:
        print("\nStopping all applications...")
        for process, _, _ in processes:
            process.terminate()
        print("All applications stopped.")

if __name__ == "__main__":
    run_all_apps()