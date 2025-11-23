/**
 * Database Stats Component
 * Shows statistics about the loaded database
 */
import { useEffect, useState } from 'react';
import { query } from '../../lib/database';
import { Card, CardHeader, CardContent } from '../ui/card';

export default function DatabaseStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        // Get total count
        const countResult = await query('SELECT COUNT(*) as total FROM schools');
        const total = countResult[0]?.total || 0;

        // Get schools with admit rate
        const admitRateResult = await query(
          'SELECT COUNT(*) as count FROM schools WHERE admit_rate IS NOT NULL'
        );
        const withAdmitRate = admitRateResult[0]?.count || 0;

        // Get schools with cost data
        const costResult = await query(
          'SELECT COUNT(*) as count FROM schools WHERE cost_attendance IS NOT NULL'
        );
        const withCost = costResult[0]?.count || 0;

        // Get average completeness
        const completenessResult = await query(
          'SELECT AVG(completeness_score) as avg FROM schools'
        );
        const avgCompleteness = completenessResult[0]?.avg || 0;

        setStats({
          total,
          withAdmitRate,
          withCost,
          avgCompleteness: Math.round(avgCompleteness * 10) / 10
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <Card glassmorphic={true}>
        <CardContent className="text-center py-4">
          <p className="text-white/70">Loading database statistics...</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Card glassmorphic={true}>
      <CardHeader>
        <h3 className="text-lg font-semibold text-white">Database Statistics</h3>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-2xl font-bold text-white">{stats.total.toLocaleString()}</p>
            <p className="text-sm text-white/70">Total Schools</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats.withAdmitRate.toLocaleString()}</p>
            <p className="text-sm text-white/70">With Admit Rate</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats.withCost.toLocaleString()}</p>
            <p className="text-sm text-white/70">With Cost Data</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats.avgCompleteness}%</p>
            <p className="text-sm text-white/70">Avg Completeness</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

