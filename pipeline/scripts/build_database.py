"""
Create SQLite database with schema from DATA_SCHEMA.md.

Reads data from pipeline/raw/scorecard_data.csv
Creates tables: schools, programs, major_categories, database_metadata
Calculates completeness_score for each school
Adds indexes for performance
Saves to pipeline/output/colleges_v2024_11.db
"""

import sqlite3
import pandas as pd
from pathlib import Path
from datetime import datetime
import sys

# Directories
SCRIPT_DIR = Path(__file__).parent
RAW_DIR = SCRIPT_DIR.parent / "raw"
OUTPUT_DIR = SCRIPT_DIR.parent / "output"
OUTPUT_DIR.mkdir(exist_ok=True)

# Database version
VERSION = "2024_11"
DB_NAME = f"colleges_v{VERSION}.db"
DB_PATH = OUTPUT_DIR / DB_NAME

def create_schema(conn):
    """Create database schema from DATA_SCHEMA.md."""
    print("Creating database schema...")
    
    cursor = conn.cursor()
    
    # Schools table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS schools (
            -- Identity
            unitid INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            city TEXT,
            state TEXT,
            url TEXT,
            latitude REAL,
            longitude REAL,
            
            -- Basic Characteristics
            control TEXT,
            size INTEGER,
            setting TEXT,
            locale_code INTEGER,
            religious_affiliation TEXT,
            historically_black BOOLEAN DEFAULT 0,
            tribal_college BOOLEAN DEFAULT 0,
            women_only BOOLEAN DEFAULT 0,
            men_only BOOLEAN DEFAULT 0,
            
            -- Admissions Statistics
            admit_rate REAL,
            yield_rate REAL,
            
            -- SAT Scores
            sat_math_25 INTEGER,
            sat_math_75 INTEGER,
            sat_ebrw_25 INTEGER,
            sat_ebrw_75 INTEGER,
            
            -- ACT Scores
            act_composite_25 INTEGER,
            act_composite_75 INTEGER,
            act_english_25 INTEGER,
            act_english_75 INTEGER,
            act_math_25 INTEGER,
            act_math_75 INTEGER,
            
            -- Testing Policy
            test_optional BOOLEAN DEFAULT 0,
            test_blind BOOLEAN DEFAULT 0,
            test_required BOOLEAN DEFAULT 1,
            
            -- Financial Data
            cost_attendance INTEGER,
            tuition_in_state INTEGER,
            tuition_out_state INTEGER,
            tuition_private INTEGER,
            room_board INTEGER,
            books_supplies INTEGER,
            other_expenses INTEGER,
            
            -- Net Price by Income Bracket
            net_price_0_30k INTEGER,
            net_price_30_48k INTEGER,
            net_price_48_75k INTEGER,
            net_price_75_110k INTEGER,
            net_price_110k_plus INTEGER,
            
            -- Financial Aid Availability
            meets_full_need BOOLEAN DEFAULT 0,
            pct_need_met REAL,
            pct_receiving_aid REAL,
            pct_receiving_fed_loans REAL,
            pct_receiving_pell REAL,
            
            -- Merit Aid
            avg_merit_aid INTEGER,
            pct_receiving_merit REAL,
            merit_aid_available BOOLEAN DEFAULT 1,
            
            -- Academic Outcomes
            retention_rate REAL,
            graduation_rate_4yr REAL,
            graduation_rate_6yr REAL,
            
            -- Career Outcomes
            median_earnings_6yr INTEGER,
            median_earnings_10yr INTEGER,
            employment_rate REAL,
            
            -- Academic Resources
            student_faculty_ratio INTEGER,
            pct_faculty_fulltime REAL,
            pct_classes_under_20 REAL,
            pct_classes_over_50 REAL,
            
            -- Student Body Demographics
            pct_women REAL,
            pct_white REAL,
            pct_black REAL,
            pct_hispanic REAL,
            pct_asian REAL,
            pct_international REAL,
            pct_first_generation REAL,
            
            -- Campus Life
            campus_housing_available BOOLEAN DEFAULT 1,
            pct_students_on_campus REAL,
            greek_life_available BOOLEAN,
            pct_in_greek_life REAL,
            ncaa_division TEXT,
            
            -- Special Designations
            research_university BOOLEAN DEFAULT 0,
            liberal_arts_college BOOLEAN DEFAULT 0,
            land_grant BOOLEAN DEFAULT 0,
            
            -- Data Quality Metadata
            data_year INTEGER,
            completeness_score REAL,
            last_updated TEXT,
            
            CHECK (admit_rate IS NULL OR (admit_rate >= 0 AND admit_rate <= 1)),
            CHECK (completeness_score IS NULL OR (completeness_score >= 0 AND completeness_score <= 100))
        )
    """)
    
    # Programs table (empty for now, will be populated from IPEDS later)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS programs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            unitid INTEGER NOT NULL,
            cip_code TEXT NOT NULL,
            cip_2digit TEXT,
            cip_4digit TEXT,
            cip_6digit TEXT,
            program_name TEXT NOT NULL,
            program_category TEXT,
            degree_level TEXT,
            annual_completions INTEGER,
            program_length_years INTEGER,
            distance_education BOOLEAN DEFAULT 0,
            
            FOREIGN KEY (unitid) REFERENCES schools(unitid) ON DELETE CASCADE
        )
    """)
    
    # Major categories lookup table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS major_categories (
            cip_code TEXT PRIMARY KEY,
            category_name TEXT NOT NULL,
            description TEXT,
            common_careers TEXT,
            avg_starting_salary INTEGER,
            growth_outlook TEXT
        )
    """)
    
    # Database metadata table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS database_metadata (
            key TEXT PRIMARY KEY,
            value TEXT
        )
    """)
    
    # Create indexes
    print("Creating indexes...")
    indexes = [
        "CREATE INDEX IF NOT EXISTS idx_schools_state ON schools(state)",
        "CREATE INDEX IF NOT EXISTS idx_schools_control ON schools(control)",
        "CREATE INDEX IF NOT EXISTS idx_schools_size ON schools(size)",
        "CREATE INDEX IF NOT EXISTS idx_schools_admit_rate ON schools(admit_rate)",
        "CREATE INDEX IF NOT EXISTS idx_schools_setting ON schools(setting)",
        "CREATE INDEX IF NOT EXISTS idx_schools_cost ON schools(cost_attendance)",
        "CREATE INDEX IF NOT EXISTS idx_programs_unitid ON programs(unitid)",
        "CREATE INDEX IF NOT EXISTS idx_programs_cip2 ON programs(cip_2digit)",
    ]
    
    for index_sql in indexes:
        cursor.execute(index_sql)
    
    conn.commit()
    print("✓ Schema created successfully")

def map_scorecard_to_schema(row):
    """Map College Scorecard API fields to database schema."""
    # Map ownership codes to control
    ownership_map = {
        1: 'Public',
        2: 'Private nonprofit',
        3: 'Private for-profit'
    }
    
    # Map locale codes to setting
    locale_map = {
        11: 'City',
        12: 'City',
        13: 'City',
        21: 'Suburb',
        22: 'Suburb',
        23: 'Suburb',
        31: 'Town',
        32: 'Town',
        33: 'Town',
        41: 'Rural',
        42: 'Rural',
        43: 'Rural'
    }
    
    # Helper to safely get value from CSV row (flat column names)
    def get_value(key, default=None):
        # CSV columns are flat like "school.name", so access directly
        if key in row:
            value = row[key]
            # Handle pandas NaN values
            if pd.isna(value):
                return default
            return value
        return default
    
    # Map net price - prioritize private if available, fallback to public
    def get_net_price(income_key):
        private_key = f'latest.cost.net_price.private.by_income_level.{income_key}'
        public_key = f'latest.cost.net_price.public.by_income_level.{income_key}'
        private_val = get_value(private_key)
        public_val = get_value(public_key)
        return private_val if private_val is not None else public_val
    
    mapped = {
        'unitid': get_value('id'),
        'name': get_value('school.name'),
        'city': get_value('school.city'),
        'state': get_value('school.state'),
        'url': get_value('school.school_url'),
        'latitude': get_value('location.lat'),
        'longitude': get_value('location.lon'),
        'control': ownership_map.get(get_value('latest.school.ownership')),
        'size': get_value('latest.student.size'),
        'locale_code': get_value('latest.school.locale'),
        'setting': locale_map.get(get_value('latest.school.locale')),
        'admit_rate': get_value('latest.admissions.admission_rate.overall'),
        'sat_math_25': None,  # API doesn't provide 25th/75th, only midpoint
        'sat_math_75': None,
        'sat_ebrw_25': None,
        'sat_ebrw_75': None,
        'act_composite_25': None,
        'act_composite_75': None,
        'act_english_25': None,
        'act_english_75': None,
        'act_math_25': None,
        'act_math_75': None,
        'cost_attendance': get_value('latest.cost.attendance.academic_year'),
        'tuition_in_state': get_value('latest.cost.tuition.in_state'),
        'tuition_out_state': get_value('latest.cost.tuition.out_of_state'),
        'tuition_private': get_value('latest.cost.tuition.out_of_state'),  # Use out-of-state for private
        'net_price_0_30k': get_net_price('0-30000'),
        'net_price_30_48k': get_net_price('30001-48000'),
        'net_price_48_75k': get_net_price('48001-75000'),
        'net_price_75_110k': get_net_price('75001-110000'),
        'net_price_110k_plus': get_net_price('110001-plus'),
        'retention_rate': get_value('latest.student.retention_rate.four_year.full_time'),
        'graduation_rate_4yr': get_value('latest.completion.completion_rate_4yr_150nt'),
        'graduation_rate_6yr': get_value('latest.completion.completion_rate_6yr_150nt'),
        'median_earnings_6yr': get_value('latest.earnings.6_yrs_after_entry.median'),
        'median_earnings_10yr': get_value('latest.earnings.10_yrs_after_entry.median'),
        'data_year': 2023,  # Latest available data year
        'last_updated': datetime.now().isoformat(),
    }
    
    return mapped

def calculate_completeness_score(row):
    """Calculate completeness score for a school (0-100)."""
    weights = {
        'hasAdmitRate': 10,
        'hasSATScores': 10,
        'hasACTScores': 5,
        'hasTestPolicy': 5,
        'hasYieldRate': 5,
        'hasAdmissionFactors': 5,
        'hasCostData': 10,
        'hasNetPrices': 15,
        'hasMeritAidInfo': 5,
        'hasRetentionRate': 5,
        'hasGraduationRates': 10,
        'hasEarningsData': 5,
        'hasFacultyRatio': 3,
        'hasClassSizes': 3,
        'hasProgramData': 4,
    }
    
    score = 0
    
    if pd.notna(row.get('admit_rate')):
        score += weights['hasAdmitRate']
    if pd.notna(row.get('sat_math_25')) and pd.notna(row.get('sat_math_75')):
        score += weights['hasSATScores']
    if pd.notna(row.get('act_composite_25')) and pd.notna(row.get('act_composite_75')):
        score += weights['hasACTScores']
    if pd.notna(row.get('cost_attendance')):
        score += weights['hasCostData']
    if any(pd.notna(row.get(f'net_price_{bracket}')) for bracket in ['0_30k', '30_48k', '48_75k', '75_110k', '110k_plus']):
        score += weights['hasNetPrices']
    if pd.notna(row.get('retention_rate')):
        score += weights['hasRetentionRate']
    if pd.notna(row.get('graduation_rate_4yr')) or pd.notna(row.get('graduation_rate_6yr')):
        score += weights['hasGraduationRates']
    if pd.notna(row.get('median_earnings_6yr')) or pd.notna(row.get('median_earnings_10yr')):
        score += weights['hasEarningsData']
    
    return round(score)

def populate_database(conn, df):
    """Populate database with data from DataFrame."""
    print("\nPopulating database...")
    
    cursor = conn.cursor()
    
    # Convert DataFrame rows to dictionaries and map to schema
    schools_data = []
    skipped_count = 0
    for idx, row in df.iterrows():
        # Convert pandas Series to dict for easier access
        row_dict = row.to_dict()
        mapped = map_scorecard_to_schema(row_dict)
        
        # Skip schools without required fields (name is NOT NULL)
        if not mapped.get('name') or pd.isna(mapped.get('name')) or not mapped.get('unitid') or pd.isna(mapped.get('unitid')):
            skipped_count += 1
            if skipped_count <= 3:  # Show first 3 skipped for debugging
                print(f"  ⚠ Skipping school at index {idx}: name={mapped.get('name')}, unitid={mapped.get('unitid')}")
            continue
        
        # Calculate completeness score
        mapped['completeness_score'] = calculate_completeness_score(mapped)
        
        schools_data.append(mapped)
    
    if skipped_count > 0:
        print(f"⚠ Skipped {skipped_count} schools missing required fields (name or unitid)")
    
    # Insert schools
    print(f"Inserting {len(schools_data)} schools...")
    insert_sql = """
        INSERT INTO schools (
            unitid, name, city, state, url, latitude, longitude,
            control, size, setting, locale_code,
            admit_rate,
            cost_attendance, tuition_in_state, tuition_out_state, tuition_private,
            net_price_0_30k, net_price_30_48k, net_price_48_75k,
            net_price_75_110k, net_price_110k_plus,
            retention_rate, graduation_rate_4yr, graduation_rate_6yr,
            median_earnings_6yr, median_earnings_10yr,
            data_year, completeness_score, last_updated
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    
    for school in schools_data:
        try:
            cursor.execute(insert_sql, (
                school['unitid'], school['name'], school['city'], school['state'],
                school['url'], school['latitude'], school['longitude'],
                school['control'], school['size'], school['setting'], school['locale_code'],
                school['admit_rate'],
                school['cost_attendance'], school['tuition_in_state'],
                school['tuition_out_state'], school['tuition_private'],
                school['net_price_0_30k'], school['net_price_30_48k'],
                school['net_price_48_75k'], school['net_price_75_110k'],
                school['net_price_110k_plus'],
                school['retention_rate'], school['graduation_rate_4yr'],
                school['graduation_rate_6yr'],
                school['median_earnings_6yr'], school['median_earnings_10yr'],
                school['data_year'], school['completeness_score'], school['last_updated']
            ))
        except Exception as e:
            print(f"⚠ Warning: Failed to insert school {school.get('unitid')}: {e}")
            continue
    
    # Insert metadata
    avg_completeness = pd.Series([s['completeness_score'] for s in schools_data]).mean()
    if pd.isna(avg_completeness):
        avg_completeness = 0.0
    
    cursor.execute("""
        INSERT OR REPLACE INTO database_metadata VALUES
        ('version', ?),
        ('build_date', ?),
        ('total_schools', ?),
        ('avg_completeness', ?)
    """, (
        VERSION,
        datetime.now().isoformat(),
        len(schools_data),
        float(avg_completeness)
    ))
    
    conn.commit()
    print(f"✓ Inserted {len(schools_data)} schools")

def build_database():
    """Main function to build the database."""
    print("=" * 60)
    print(f"Building Database: {DB_NAME}")
    print("=" * 60)
    
    # Check for input file
    input_file = RAW_DIR / "scorecard_data.csv"
    if not input_file.exists():
        print(f"❌ Error: Input file not found: {input_file}")
        print("   Please run fetch_scorecard.py first")
        sys.exit(1)
    
    # Load data
    print(f"\nLoading data from: {input_file}")
    try:
        df = pd.read_csv(input_file)
        print(f"✓ Loaded {len(df)} schools")
    except Exception as e:
        print(f"❌ Error loading data: {e}")
        sys.exit(1)
    
    # Remove existing database if it exists
    if DB_PATH.exists():
        print(f"\n⚠ Removing existing database: {DB_NAME}")
        DB_PATH.unlink()
    
    # Create database connection
    conn = sqlite3.connect(DB_PATH)
    
    try:
        # Create schema
        create_schema(conn)
        
        # Populate data
        populate_database(conn, df)
        
        # Optimize database
        print("\nOptimizing database...")
        conn.execute("VACUUM")
        conn.execute("ANALYZE")
        
        # Print summary statistics
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM schools")
        total_schools = cursor.fetchone()[0]
        
        cursor.execute("SELECT AVG(completeness_score) FROM schools")
        avg_completeness_result = cursor.fetchone()[0]
        avg_completeness = float(avg_completeness_result) if avg_completeness_result is not None else 0.0
        
        cursor.execute("SELECT COUNT(*) FROM schools WHERE admit_rate IS NOT NULL")
        schools_with_admit_rate = cursor.fetchone()[0] or 0
        
        cursor.execute("SELECT COUNT(*) FROM schools WHERE cost_attendance IS NOT NULL")
        schools_with_cost = cursor.fetchone()[0] or 0
        
        print("\n" + "=" * 60)
        print("Summary Statistics")
        print("=" * 60)
        print(f"Total schools: {total_schools:,}")
        print(f"Average completeness score: {avg_completeness:.1f}")
        if total_schools > 0:
            admit_rate_pct = (schools_with_admit_rate / total_schools * 100) if total_schools > 0 else 0.0
            cost_pct = (schools_with_cost / total_schools * 100) if total_schools > 0 else 0.0
            print(f"Schools with admit rate: {schools_with_admit_rate:,} ({admit_rate_pct:.1f}%)")
            print(f"Schools with cost data: {schools_with_cost:,} ({cost_pct:.1f}%)")
        else:
            print("Schools with admit rate: 0 (0.0%)")
            print("Schools with cost data: 0 (0.0%)")
        print(f"\n✓ Database created successfully: {DB_PATH}")
        print(f"  File size: {DB_PATH.stat().st_size / 1024 / 1024:.2f} MB")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error building database: {e}")
        sys.exit(1)
    finally:
        conn.close()

if __name__ == "__main__":
    try:
        build_database()
    except KeyboardInterrupt:
        print("\n\n⚠ Interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
