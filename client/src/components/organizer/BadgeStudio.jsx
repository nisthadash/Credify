import React, { useState, useRef, useCallback } from 'react';
import { Palette, Type, Image as ImageIcon, Download, RefreshCw, CheckCircle2, Layers } from 'lucide-react';

const TEMPLATES = [
  { id: 'hexagon', label: 'Hexagon',       bg: 'linear-gradient(135deg,#1e1b4b,#312e81)',  accent: '#818cf8' },
  { id: 'shield',  label: 'Shield',        bg: 'linear-gradient(135deg,#052e16,#14532d)',  accent: '#4ade80' },
  { id: 'circuit', label: 'Circuit',       bg: 'linear-gradient(135deg,#0c0a09,#292524)',  accent: '#fb923c' },
  { id: 'cosmos',  label: 'Cosmos',        bg: 'linear-gradient(135deg,#0f172a,#1e3a5f)',  accent: '#38bdf8' },
  { id: 'flame',   label: 'Flame',         bg: 'linear-gradient(135deg,#431407,#7c2d12)',  accent: '#fb923c' },
  { id: 'royal',   label: 'Royal Gold',    bg: 'linear-gradient(135deg,#1c1007,#3b2205)',  accent: '#fbbf24' },
];

const TIER_OPTIONS = ['Event Pass', 'Participant', 'Finalist', 'Winner', 'Mentor'];

const BadgePreview = ({ template, badgeText, subText, accentColor, logoDataUrl }) => {
  const tpl = TEMPLATES.find(t => t.id === template) || TEMPLATES[0];
  const accent = accentColor || tpl.accent;

  return (
    <div style={{
      width: '280px',
      height: '280px',
      borderRadius: '20px',
      background: tpl.bg,
      border: `2px solid ${accent}40`,
      boxShadow: `0 0 40px ${accent}30, 0 20px 60px rgba(0,0,0,0.6)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      gap: '10px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.35s ease',
      flexShrink: 0,
    }}>
      {/* Glow ring */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(circle at 50% 20%, ${accent}15 0%, transparent 70%)`,
        pointerEvents: 'none'
      }} />
      {/* Corner accents */}
      <div style={{ position: 'absolute', top: 12, left: 12, width: 16, height: 16, borderTop: `2px solid ${accent}`, borderLeft: `2px solid ${accent}`, borderRadius: '3px 0 0 0' }} />
      <div style={{ position: 'absolute', top: 12, right: 12, width: 16, height: 16, borderTop: `2px solid ${accent}`, borderRight: `2px solid ${accent}`, borderRadius: '0 3px 0 0' }} />
      <div style={{ position: 'absolute', bottom: 12, left: 12, width: 16, height: 16, borderBottom: `2px solid ${accent}`, borderLeft: `2px solid ${accent}`, borderRadius: '0 0 0 3px' }} />
      <div style={{ position: 'absolute', bottom: 12, right: 12, width: 16, height: 16, borderBottom: `2px solid ${accent}`, borderRight: `2px solid ${accent}`, borderRadius: '0 0 3px 0' }} />

      {/* Logo or icon */}
      {logoDataUrl ? (
        <img src={logoDataUrl} alt="logo" style={{ width: 64, height: 64, objectFit: 'contain', borderRadius: 8 }} />
      ) : (
        <div style={{
          width: 64, height: 64, borderRadius: 12,
          background: `${accent}20`, border: `1.5px solid ${accent}50`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '28px'
        }}>
          🏆
        </div>
      )}

      {/* Badge text */}
      <div style={{ textAlign: 'center', zIndex: 1 }}>
        <p style={{
          fontSize: '15px', fontWeight: 800, color: '#fff',
          fontFamily: 'var(--font-display)', letterSpacing: '0.04em',
          lineHeight: 1.2, marginBottom: '4px',
          textShadow: `0 0 20px ${accent}80`
        }}>
          {badgeText || 'Badge Title'}
        </p>
        <p style={{
          fontSize: '11px', color: accent, fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-display)'
        }}>
          {subText || 'Event Name'}
        </p>
      </div>

      {/* Bottom label */}
      <div style={{
        position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
        background: `${accent}18`, border: `1px solid ${accent}35`,
        borderRadius: 20, padding: '3px 12px',
        fontSize: '9px', color: accent, fontWeight: 700,
        letterSpacing: '0.15em', textTransform: 'uppercase',
        fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap'
      }}>
        CREDIFY · ON-CHAIN VERIFIED
      </div>
    </div>
  );
};

export default function BadgeStudio({ activeEvent, onSave }) {
  const [template, setTemplate]       = useState('hexagon');
  const [badgeText, setBadgeText]     = useState('');
  const [subText, setSubText]         = useState(activeEvent?.title || '');
  const [accentColor, setAccentColor] = useState('');
  const [logoDataUrl, setLogoDataUrl] = useState('');
  const [tier, setTier]               = useState('Participant');
  const [saved, setSaved]             = useState(false);
  const logoInputRef = useRef();

  const currentTpl = TEMPLATES.find(t => t.id === template) || TEMPLATES[0];
  const effectiveAccent = accentColor || currentTpl.accent;

  const handleLogoUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogoDataUrl(ev.target.result);
    reader.readAsDataURL(file);
  }, []);

  const handleSave = () => {
    const config = { template, badgeText, subText, accentColor: effectiveAccent, logoDataUrl, tier };
    if (onSave) onSave(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    setTemplate('hexagon');
    setBadgeText('');
    setSubText(activeEvent?.title || '');
    setAccentColor('');
    setLogoDataUrl('');
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={17} style={{ color: 'var(--primary)' }} /> Badge Studio
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Design a custom badge for this event. The config is saved and used when generating metadata.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'flex-start' }}>

        {/* Controls */}
        <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Template */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
              <Layers size={12} style={{ marginRight: 5 }} />Template Style
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {TEMPLATES.map(tpl => (
                <button
                  key={tpl.id}
                  onClick={() => setTemplate(tpl.id)}
                  style={{
                    padding: '10px 6px',
                    borderRadius: '8px',
                    border: template === tpl.id ? `2px solid ${tpl.accent}` : '2px solid transparent',
                    background: tpl.bg,
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: template === tpl.id ? tpl.accent : 'rgba(255,255,255,0.6)',
                    transition: 'all 0.2s ease',
                    boxShadow: template === tpl.id ? `0 0 12px ${tpl.accent}40` : 'none',
                  }}
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              <Type size={12} style={{ marginRight: 5 }} />Badge Text
            </label>
            <input
              type="text" className="input-field"
              value={badgeText}
              onChange={e => setBadgeText(e.target.value)}
              placeholder="e.g. Hackathon Winner"
              style={{ fontSize: '13px' }}
            />
            <input
              type="text" className="input-field"
              value={subText}
              onChange={e => setSubText(e.target.value)}
              placeholder="e.g. HackMumbai 3.0"
              style={{ fontSize: '13px' }}
            />
          </div>

          {/* Tier */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              Default Tier
            </label>
            <select className="input-field" value={tier} onChange={e => setTier(e.target.value)} style={{ fontSize: '13px' }}>
              {TIER_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Accent Color */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              <Palette size={12} style={{ marginRight: 5 }} />Accent Color
            </label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input type="color" value={accentColor || currentTpl.accent} onChange={e => setAccentColor(e.target.value)}
                style={{ width: 44, height: 36, borderRadius: 8, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', padding: '2px' }} />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{accentColor || currentTpl.accent}</span>
              {accentColor && (
                <button onClick={() => setAccentColor('')} style={{ fontSize: '11px', color: 'var(--text-subtle)', background: 'none', border: 'none', cursor: 'pointer' }}>Reset</button>
              )}
            </div>
          </div>

          {/* Logo Upload */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              <ImageIcon size={12} style={{ marginRight: 5 }} />Event Logo (optional)
            </label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={() => logoInputRef.current?.click()}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '12px' }}
              >
                <ImageIcon size={13} /> {logoDataUrl ? 'Change Logo' : 'Upload Logo'}
              </button>
              {logoDataUrl && (
                <button onClick={() => setLogoDataUrl('')} style={{ fontSize: '11px', color: 'var(--text-subtle)', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
              )}
              <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button onClick={handleSave} className="btn btn-primary" style={{ flex: 1, gap: '6px' }}>
              {saved ? <><CheckCircle2 size={14} /> Saved!</> : <><Download size={14} /> Save Design</>}
            </button>
            <button onClick={handleReset} className="btn btn-ghost" style={{ gap: '6px' }}>
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Live Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Live Preview</p>
          <BadgePreview
            template={template}
            badgeText={badgeText}
            subText={subText}
            accentColor={accentColor}
            logoDataUrl={logoDataUrl}
          />
          <p style={{ fontSize: '11px', color: 'var(--text-subtle)', textAlign: 'center', maxWidth: '200px' }}>
            This preview reflects how the badge will appear in the wallet.
          </p>
        </div>
      </div>
    </div>
  );
}
