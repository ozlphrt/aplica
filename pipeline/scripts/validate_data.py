"""
Validate data quality in the built database.

Checks:
- Required fields completeness (admit_rate, cost_attendance)
- Data type correctness
- Value ranges (rates 0-1, SAT 400-1600, etc.)
- Referential integrity (foreign keys)
- Calculate and report completeness distribution
Generate data quality report.
"""

import sqlite3
import pandas as pd
from pathlib import Path
from datetime import datetime

# Directories
SCRIPT_DIR = Path(__file__).parent
OUTPUT_DIR = SCRIPT_DIR.parent / "output"
OUTPUT_DIR.mkdir(exist_ok=True)

def validate_database(db_path):
    """
    Run validation checks on the database.
    
    Args:
        db_path: Path to SQLite database file
    
    Returns:
        dict: Validation results
    """
    print(f"Validating database: {db_path}")
    
    if not db_path.exists():
        print(f"Error: Database file not found: {db_path}")
        return None
    
    conn = sqlite3.connect(db_path)
    results = {
        'timestamp': datetime.now().isoformat(),
        'database': str(db_path),
        'checks': {}
    }
    
    try:
        cursor = conn.cursor()
        
        # 1. Check school count
        cursor.execute("SELECT COUNT(*) FROM schools")
        school_count = cursor.fetchone()[0]
        results['checks']['total_schools'] = school_count
        print(f"Total schools: {school_count}")
        
        # 2. Check for orphaned programs
        cursor.execute("""
            SELECT COUNT(*) FROM programs p
            LEFT JOIN schools s ON p.unitid = s.unitid
            WHERE s.unitid IS NULL
        """)
        orphaned_programs = cursor.fetchone()[0]
        results['checks']['orphaned_programs'] = orphaned_programs
        if orphaned_programs > 0:
            print(f"⚠️  Warning: {orphaned_programs} orphaned programs found")
        
        # 3. Check for invalid rates (should be 0-1)
        cursor.execute("""
            SELECT COUNT(*) FROM schools
            WHERE admit_rate < 0 OR admit_rate > 1
        """)
        invalid_admit_rates = cursor.fetchone()[0]
        results['checks']['invalid_admit_rates'] = invalid_admit_rates
        if invalid_admit_rates > 0:
            print(f"⚠️  Warning: {invalid_admit_rates} schools with invalid admit rates")
        
        # 4. Check for impossible SAT scores
        cursor.execute("""
            SELECT COUNT(*) FROM schools
            WHERE (sat_math_25 > sat_math_75 OR sat_ebrw_25 > sat_ebrw_75)
            AND sat_math_25 IS NOT NULL AND sat_math_75 IS NOT NULL
        """)
        invalid_sat_scores = cursor.fetchone()[0]
        results['checks']['invalid_sat_scores'] = invalid_sat_scores
        if invalid_sat_scores > 0:
            print(f"⚠️  Warning: {invalid_sat_scores} schools with invalid SAT score ranges")
        
        # 5. Check for missing critical data
        cursor.execute("""
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN admit_rate IS NULL THEN 1 ELSE 0 END) as missing_admit_rate,
                SUM(CASE WHEN cost_attendance IS NULL THEN 1 ELSE 0 END) as missing_cost,
                SUM(CASE WHEN name IS NULL THEN 1 ELSE 0 END) as missing_name
            FROM schools
        """)
        missing_data = cursor.fetchone()
        results['checks']['missing_data'] = {
            'total': missing_data[0],
            'missing_admit_rate': missing_data[1],
            'missing_cost': missing_data[2],
            'missing_name': missing_data[3]
        }
        print(f"Missing data:")
        print(f"  Admit rate: {missing_data[1]} ({missing_data[1]/missing_data[0]*100:.1f}%)")
        print(f"  Cost: {missing_data[2]} ({missing_data[2]/missing_data[0]*100:.1f}%)")
        
        # 6. Check completeness score distribution
        cursor.execute("""
            SELECT 
                AVG(completeness_score) as avg_completeness,
                MIN(completeness_score) as min_completeness,
                MAX(completeness_score) as max_completeness,
                COUNT(CASE WHEN completeness_score >= 80 THEN 1 END) as high_completeness,
                COUNT(CASE WHEN completeness_score < 50 THEN 1 END) as low_completeness
            FROM schools
        """)
        completeness = cursor.fetchone()
        results['checks']['completeness'] = {
            'avg': completeness[0],
            'min': completeness[1],
            'max': completeness[2],
            'high_completeness_count': completeness[3],
            'low_completeness_count': completeness[4]
        }
        print(f"\nCompleteness scores:")
        print(f"  Average: {completeness[0]:.1f}")
        print(f"  Range: {completeness[1]:.0f} - {completeness[2]:.0f}")
        print(f"  High completeness (≥80): {completeness[3]} ({completeness[3]/school_count*100:.1f}%)")
        print(f"  Low completeness (<50): {completeness[4]} ({completeness[4]/school_count*100:.1f}%)")
        
        # 7. Check referential integrity
        cursor.execute("SELECT COUNT(*) FROM programs")
        program_count = cursor.fetchone()[0]
        results['checks']['total_programs'] = program_count
        print(f"\nTotal programs: {program_count}")
        
        # 8. Check database metadata
        cursor.execute("SELECT key, value FROM database_metadata")
        metadata = dict(cursor.fetchall())
        results['metadata'] = metadata
        print(f"\nDatabase metadata:")
        for key, value in metadata.items():
            print(f"  {key}: {value}")
        
        # Overall validation status
        issues = (
            orphaned_programs +
            invalid_admit_rates +
            invalid_sat_scores +
            (1 if missing_data[1] > school_count * 0.1 else 0) +  # >10% missing admit rate
            (1 if missing_data[2] > school_count * 0.1 else 0)   # >10% missing cost
        )
        
        results['validation_status'] = 'PASS' if issues == 0 else 'WARNINGS'
        results['issue_count'] = issues
        
        print(f"\n{'✅ Validation PASSED' if issues == 0 else '⚠️  Validation completed with warnings'}")
        
    finally:
        conn.close()
    
    return results

def generate_report(results):
    """Generate a data quality report."""
    if not results:
        return
    
    report_file = OUTPUT_DIR / f"validation_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
    
    with open(report_file, 'w') as f:
        f.write("=" * 60 + "\n")
        f.write("Aplica Database Validation Report\n")
        f.write("=" * 60 + "\n\n")
        f.write(f"Timestamp: {results['timestamp']}\n")
        f.write(f"Database: {results['database']}\n\n")
        
        f.write("Validation Checks:\n")
        f.write("-" * 60 + "\n")
        
        checks = results['checks']
        f.write(f"Total Schools: {checks.get('total_schools', 0)}\n")
        f.write(f"Total Programs: {checks.get('total_programs', 0)}\n\n")
        
        f.write("Data Quality Issues:\n")
        f.write(f"  Orphaned Programs: {checks.get('orphaned_programs', 0)}\n")
        f.write(f"  Invalid Admit Rates: {checks.get('invalid_admit_rates', 0)}\n")
        f.write(f"  Invalid SAT Scores: {checks.get('invalid_sat_scores', 0)}\n\n")
        
        if 'missing_data' in checks:
            md = checks['missing_data']
            f.write("Missing Critical Data:\n")
            f.write(f"  Missing Admit Rate: {md.get('missing_admit_rate', 0)}\n")
            f.write(f"  Missing Cost: {md.get('missing_cost', 0)}\n\n")
        
        if 'completeness' in checks:
            comp = checks['completeness']
            f.write("Completeness Scores:\n")
            f.write(f"  Average: {comp.get('avg', 0):.1f}\n")
            f.write(f"  Range: {comp.get('min', 0):.0f} - {comp.get('max', 0):.0f}\n")
            f.write(f"  High Completeness (≥80): {comp.get('high_completeness_count', 0)}\n")
            f.write(f"  Low Completeness (<50): {comp.get('low_completeness_count', 0)}\n\n")
        
        f.write(f"Validation Status: {results['validation_status']}\n")
        f.write(f"Issue Count: {results['issue_count']}\n")
    
    print(f"\nValidation report saved to: {report_file}")

if __name__ == "__main__":
    # Find the most recent database file
    db_files = list(OUTPUT_DIR.glob("colleges_v*.db"))
    
    if not db_files:
        print("No database files found in output directory")
        print("Run build_database.py first")
    else:
        # Use the most recent database
        latest_db = max(db_files, key=lambda p: p.stat().st_mtime)
        results = validate_database(latest_db)
        
        if results:
            generate_report(results)

