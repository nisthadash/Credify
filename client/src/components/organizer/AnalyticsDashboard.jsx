import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import { TrendingUp, Users, Award, Percent, RefreshCw, AlertCircle } from 'lucide-react';
import apiFetch from '../../services/api.js';

const TIER_COLORS_CHART = {
  'event pass':    '#93c5fd',
  'participant':   '#a5b4fc',
  'finalist':      '#d8b4fe',
  'winner':        '#f9a8d4',
  'mentor':        '#86efac',
  'participant badge':  '#a5b4fc',
  'finalist badge':     '#d8b4fe',
  'winner certificate': '#f9a8d4',
  'mentor badge':       '#86efac',
};
const DEFAULT_COLORS = ['#818cf8', '#34d399', '#fb923c', '#f472b6', '#38bdf8'];

const StatCard = ({ icon: Icon, label, value, color, suffix = '' }) => (
  <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
    <div style={{ width: 38, height: 38, borderRadius: 9, background: `${color}20`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
      <Icon size={18} />
    </div>
    <div>
      <p style={{ fontSize: '11px', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, marginBottom: '3px' }}>{label}</p>
      <p style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'var(--font-display)', lineHeight: 1 }}>
        {value}{suffix}
      </p>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 10, padding: '10px 14px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        fontSize: '13px'
      }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color, fontWeight: 700 }}>
            {entry.name}: <span style={{ color: '#fff' }}>{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsDashboard({ eventId }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const fetchAnalytics = async () => {
    if (!eventId) return;
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch(`/analytics/${eventId}`);
      if (res && res.success) {
        setData(res.data);
      } else {
        setError(res?.message || 'Failed to load analytics.');
      }
    } catch (err) {
      setError('Could not connect to analytics service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, [eventId]);

  if (!eventId) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <TrendingUp size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
        <p style={{ fontSize: '14px' }}>Select an event to view analytics.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw size={28} style={{ margin: '0 auto 12px', opacity: 0.5, animation: 'spin 1s linear infinite' }} />
        <p style={{ fontSize: '13px' }}>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <AlertCircle size={28} style={{ margin: '0 auto 12px', color: '#f87171', opacity: 0.7 }} />
        <p style={{ fontSize: '13px', color: '#f87171' }}>{error}</p>
        <button onClick={fetchAnalytics} className="btn btn-ghost btn-sm" style={{ marginTop: '16px', gap: '6px' }}>
          <RefreshCw size={13} /> Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  // Prepare pie data from tierBreakdown
  const tierPieData = Object.entries(data.tierBreakdown || {}).map(([tier, count]) => ({
    name: tier || 'Unknown',
    value: count,
  }));

  // Whitelist vs Claimed bar data
  const conversionData = [
    { name: 'Whitelisted', value: data.totalWhitelisted, fill: '#818cf8' },
    { name: 'Claimed', value: data.totalClaimed, fill: '#34d399' },
  ];

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={17} style={{ color: 'var(--primary)' }} /> Event Analytics
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Real-time claim activity and conversion insights.</p>
        </div>
        <button onClick={fetchAnalytics} className="btn btn-ghost btn-sm" style={{ gap: '6px' }}>
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
        <StatCard icon={Users}     label="Whitelisted"    value={data.totalWhitelisted} color="#818cf8" />
        <StatCard icon={Award}     label="Claimed"        value={data.totalClaimed}     color="#34d399" />
        <StatCard icon={Percent}   label="Conversion"     value={data.conversionRate}   color="#fb923c" suffix="%" />
        <StatCard icon={TrendingUp} label="Tier Variants" value={Object.keys(data.tierBreakdown || {}).length} color="#38bdf8" />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>

        {/* Claims Over Time */}
        <div className="card" style={{ padding: '20px' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
            Claims Over Time
          </p>
          {data.claimsOverTime && data.claimsOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data.claimsOverTime} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="claimsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--text-subtle)', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: 'var(--text-subtle)', fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="claims" name="Claims" stroke="#818cf8" strokeWidth={2} fill="url(#claimsGradient)" dot={{ fill: '#818cf8', strokeWidth: 0, r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No claim data yet.
            </div>
          )}
        </div>

        {/* Whitelist vs Claimed */}
        <div className="card" style={{ padding: '20px' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
            Whitelist → Claim Conversion
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={conversionData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-subtle)', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: 'var(--text-subtle)', fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]}>
                {conversionData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tier Breakdown Pie */}
        {tierPieData.length > 0 && (
          <div className="card" style={{ padding: '20px' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
              Tier Breakdown
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={tierPieData}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {tierPieData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={TIER_COLORS_CHART[entry.name?.toLowerCase()] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', color: 'var(--text-muted)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
