# Aplica Data Pipeline

Scripts to fetch and process college data from College Scorecard API.

## Setup

```bash
cd pipeline
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Usage

```bash
# Step 1: Fetch data from College Scorecard API
python scripts/fetch_scorecard.py

# Step 2: Build SQLite database
python scripts/build_database.py
```

Output: `output/colleges_v2024_11.db` ready for use in app.
