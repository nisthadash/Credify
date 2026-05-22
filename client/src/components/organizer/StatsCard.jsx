import React from 'react';

export default function StatsCard({ icon, label, value, color = 'var(--primary)', trend }) {
  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{
        width: '44px', height: '44px', borderRadius: '12px',
        background: `${color}18`, border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '22px', color: color,
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>
          {label}
        </p>
        <p style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text)', lineHeight: 1 }}>
          {value}
        </p>
        {trend && (
          <p style={{ fontSize: '12px', color: 'var(--success)', marginTop: '6px' }}>
            {trend}
          </p>
        )}
      </div>
    </div>
  );
}
