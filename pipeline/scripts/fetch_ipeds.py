"""
Download and process IPEDS datasets.

Downloads IPEDS datasets for:
- HD (Directory information)
- ADM (Admissions)
- SFA (Student Financial Aid)
- GR (Graduation Rates)
- C_A (Completions by program)

Processes and merges with Scorecard data on UNITID.
Saves merged data to pipeline/processed/
"""

import pandas as pd
import requests
from pathlib import Path
import zipfile
import io

# Output directories
SCRIPT_DIR = Path(__file__).parent
RAW_DIR = SCRIPT_DIR.parent / "raw"
PROCESSED_DIR = SCRIPT_DIR.parent / "processed"
RAW_DIR.mkdir(exist_ok=True)
PROCESSED_DIR.mkdir(exist_ok=True)

# IPEDS data portal base URL
IPEDS_BASE_URL = "https://nces.ed.gov/ipeds/datacenter/data"

def download_ipeds_file(dataset, year="2023"):
    """
    Download IPEDS dataset file.
    
    Args:
        dataset: Dataset code (e.g., 'HD', 'ADM', 'SFA')
        year: Data year (default: 2023)
    
    Returns:
        pandas.DataFrame: Loaded data
    """
    print(f"Downloading IPEDS {dataset} for year {year}...")
    
    # IPEDS file naming convention
    filename = f"{dataset}{year[-2:]}.zip"
    url = f"{IPEDS_BASE_URL}/{filename}"
    
    try:
        response = requests.get(url, timeout=60)
        response.raise_for_status()
        
        # Extract ZIP file
        with zipfile.ZipFile(io.BytesIO(response.content)) as zip_file:
            # Find the CSV file inside
            csv_files = [f for f in zip_file.namelist() if f.endswith('.csv')]
            if not csv_files:
                print(f"  No CSV file found in {filename}")
                return None
            
            csv_file = csv_files[0]
            with zip_file.open(csv_file) as f:
                df = pd.read_csv(f, encoding='latin-1', low_memory=False)
            
            print(f"  Loaded {len(df)} records")
            return df
            
    except requests.exceptions.RequestException as e:
        print(f"  Error downloading {dataset}: {e}")
        return None
    except Exception as e:
        print(f"  Error processing {dataset}: {e}")
        return None

def fetch_ipeds_data():
    """
    Download and process all required IPEDS datasets.
    
    Returns:
        dict: Dictionary of DataFrames keyed by dataset name
    """
    datasets = {
        'HD': 'Directory Information',
        'ADM': 'Admissions',
        'SFA': 'Student Financial Aid',
        'GR': 'Graduation Rates',
        'C_A': 'Completions by Program'
    }
    
    ipeds_data = {}
    
    for dataset_code, description in datasets.items():
        print(f"\nProcessing {dataset_code} - {description}...")
        df = download_ipeds_file(dataset_code)
        
        if df is not None:
            # Save raw data
            raw_file = RAW_DIR / f"ipeds_{dataset_code.lower()}.csv"
            df.to_csv(raw_file, index=False)
            print(f"  Saved raw data to {raw_file}")
            
            ipeds_data[dataset_code] = df
    
    return ipeds_data

def process_and_merge(ipeds_data):
    """
    Process IPEDS data and prepare for merging with Scorecard data.
    
    Args:
        ipeds_data: Dictionary of IPEDS DataFrames
    
    Returns:
        pandas.DataFrame: Merged IPEDS data
    """
    print("\nProcessing and merging IPEDS data...")
    
    # Start with HD (Directory) as base - contains UNITID
    if 'HD' not in ipeds_data:
        print("Error: HD dataset required as base")
        return None
    
    merged = ipeds_data['HD'].copy()
    
    # Merge other datasets on UNITID
    for dataset_code, df in ipeds_data.items():
        if dataset_code == 'HD':
            continue
        
        if 'UNITID' in df.columns:
            print(f"  Merging {dataset_code}...")
            merged = merged.merge(df, on='UNITID', how='left', suffixes=('', f'_{dataset_code}'))
        else:
            print(f"  Warning: {dataset_code} missing UNITID column")
    
    # Save processed data
    processed_file = PROCESSED_DIR / "ipeds_merged.csv"
    merged.to_csv(processed_file, index=False)
    print(f"  Saved merged data to {processed_file}")
    
    return merged

if __name__ == "__main__":
    ipeds_data = fetch_ipeds_data()
    
    if ipeds_data:
        merged = process_and_merge(ipeds_data)
        print(f"\nMerged IPEDS data shape: {merged.shape}")
        print(f"Columns: {list(merged.columns[:10])}...")  # Show first 10 columns
    else:
        print("\nNo IPEDS data retrieved")

