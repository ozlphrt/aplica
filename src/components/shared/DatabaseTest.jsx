/**
 * Database Test Component
 * Simple component to test database loading and queries
 */
import { useEffect, useState } from 'react';
import { initDatabase, getAllSchools, searchSchools, getSchool } from '../../lib/database';
import { useDatabase } from '../../stores/databaseStore';
import LoadingSpinner from './LoadingSpinner';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import DatabaseStats from './DatabaseStats';

export default function DatabaseTest() {
  const { db, loading, error, setDatabase, setLoading, setError } = useDatabase();
  const [schools, setSchools] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [testResults, setTestResults] = useState(null);

  useEffect(() => {
    loadDatabase();
  }, []);

  async function loadDatabase() {
    try {
      setLoading(true);
      setError(null);
      const database = await initDatabase();
      setDatabase(database);
      
      // Test query
      const testSchools = await getAllSchools(10);
      setSchools(testSchools);
      setTestResults({
        success: true,
        message: `Database loaded! Found ${testSchools.length} schools.`,
        sampleCount: testSchools.length
      });
    } catch (err) {
      setError(err.message);
      setTestResults({
        success: false,
        message: `Error: ${err.message}`
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    if (!searchTerm.trim()) return;
    
    try {
      setLoading(true);
      const results = await searchSchools(searchTerm, 10);
      setSchools(results);
      setTestResults({
        success: true,
        message: `Found ${results.length} schools matching "${searchTerm}"`
      });
    } catch (err) {
      setError(err.message);
      setTestResults({
        success: false,
        message: `Search error: ${err.message}`
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading && !db) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-white/70">Loading database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Database Statistics */}
      <DatabaseStats />
      
      <Card glassmorphic={true}>
        <CardHeader>
          <h2 className="text-2xl font-bold text-white">Database Test</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status */}
          <div className="p-4 rounded-lg bg-white/10">
            <p className="text-white/90">
              <strong>Status:</strong>{' '}
              {db ? (
                <span className="text-green-400">✓ Database Loaded</span>
              ) : error ? (
                <span className="text-red-400">✗ {error}</span>
              ) : (
                <span className="text-yellow-400">Loading...</span>
              )}
            </p>
            {testResults && (
              <p className="mt-2 text-white/80">
                {testResults.message}
              </p>
            )}
          </div>

          {/* Search */}
          <div className="flex gap-2">
            <Input
              glassmorphic={true}
              placeholder="Search schools by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button 
              variant="primary" 
              onClick={handleSearch}
              disabled={loading || !db}
            >
              Search
            </Button>
          </div>

          {/* Results */}
          {schools.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">
                Results ({schools.length}):
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {schools.map((school) => (
                  <div
                    key={school.unitid}
                    className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-white">{school.name}</h4>
                        <p className="text-sm text-white/70">
                          {school.city}, {school.state}
                        </p>
                      </div>
                      <div className="text-right text-sm text-white/60">
                        {school.admit_rate !== null && (
                          <p>Admit: {(school.admit_rate * 100).toFixed(1)}%</p>
                        )}
                        {school.cost_attendance !== null && (
                          <p>Cost: ${school.cost_attendance?.toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {schools.length === 0 && db && !loading && (
            <p className="text-white/60 text-center py-8">
              No schools found. Try searching or loading all schools.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

