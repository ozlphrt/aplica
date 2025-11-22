"""
Run the complete Aplica data pipeline.

This script runs all pipeline steps in sequence:
1. Fetch data from College Scorecard API
2. Build SQLite database
"""

import subprocess
import sys
from pathlib import Path

def run_command(cmd, description):
    """Run a command and handle errors."""
    print("\n" + "=" * 60)
    print(f"Step: {description}")
    print("=" * 60)
    
    result = subprocess.run(cmd, shell=True, capture_output=False)
    
    if result.returncode != 0:
        print(f"\n❌ Error in {description}")
        sys.exit(1)
    
    return result

def main():
    """Run the complete pipeline."""
    print("=" * 60)
    print("Aplica Data Pipeline")
    print("=" * 60)
    
    script_dir = Path(__file__).parent
    scripts_dir = script_dir / "scripts"
    
    # Step 1: Fetch Scorecard data
    run_command(
        f'python "{scripts_dir / "fetch_scorecard.py"}"',
        "Fetch College Scorecard Data"
    )
    
    # Step 2: Build database
    run_command(
        f'python "{scripts_dir / "build_database.py"}"',
        "Build SQLite Database"
    )
    
    print("\n" + "=" * 60)
    print("✓ Pipeline completed successfully!")
    print("=" * 60)
    print(f"\nDatabase ready: pipeline/output/colleges_v2024_11.db")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠ Pipeline interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Pipeline failed: {e}")
        sys.exit(1)

