import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { dashboardApi } from '../services/api';
import toast from 'react-hot-toast';
import './Reports.css';

const COLORS = ['#f57f17', '#1565c0', '#2e7d32'];

export default function Reports() {
  const [weekly, setWeekly] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [distribution, setDistribution] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const [weeklyRes, monthlyRes, distRes] = await Promise.all([
        dashboardApi.weeklyReport(),
        dashboardApi.monthlyReport(),
        dashboardApi.statusDistribution(),
      ]);
      setWeekly(weeklyRes.data);
      setMonthly(monthlyRes.data);
      setDistribution(distRes.data);
    } catch (err) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading reports...</div>;

  return (
    <div className="reports-page">
      <h1 className="page-title">Reports</h1>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Weekly Task Completion</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weekly?.dailyStats || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="total" fill="#e0e0e0" name="Total" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" fill="#1a237e" name="Completed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Task Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distribution}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="count"
                nameKey="status"
                label={({ status, count }) => `${status}: ${count}`}
              >
                {distribution.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card full-width">
          <h3>Monthly Productivity Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthly?.weeklyStats || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} unit="%" />
              <Tooltip formatter={(value) => `${value}%`} />
              <Line type="monotone" dataKey="productivityPercentage" stroke="#7c4dff" strokeWidth={3} name="Productivity" dot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
