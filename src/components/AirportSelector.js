import React, { useState, useRef, useEffect } from 'react';
import airports from '../data/airports';

export default function AirportSelector({ label, value, onChange }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef();

  const selected = airports.find((a) => a.icao === value);

  const filtered = query.length > 0
    ? airports.filter(
        (a) =>
          a.icao.toLowerCase().includes(query.toLowerCase()) ||
          a.name.toLowerCase().includes(query.toLowerCase()) ||
          a.city.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : airports.slice(0, 8);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div style={{ position: 'relative', flex: 1, minWidth: 220 }} ref={ref}>
      <label style={styles.label}>{label}</label>
      <div
        style={styles.inputWrap}
        onClick={() => setOpen(true)}
      >
        {selected && !open ? (
          <span style={styles.selected}>
            <strong>{selected.icao}</strong> — {selected.city}
          </span>
        ) : (
          <input
            style={styles.input}
            placeholder="Search ICAO, city or name..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            autoFocus={open}
          />
        )}
      </div>
      {open && (
        <ul style={styles.dropdown}>
          {filtered.map((a) => (
            <li
              key={a.icao}
              style={{
                ...styles.item,
                background: a.icao === value ? 'rgba(59,130,246,0.2)' : 'transparent',
              }}
              onClick={() => {
                onChange(a.icao);
                setQuery('');
                setOpen(false);
              }}
            >
              <span style={styles.icao}>{a.icao}</span>
              <span style={styles.city}>{a.city}</span>
              <span style={styles.name}>{a.name}</span>
            </li>
          ))}
          {filtered.length === 0 && (
            <li style={{ ...styles.item, color: '#64748b' }}>No airports found</li>
          )}
        </ul>
      )}
    </div>
  );
}

const styles = {
  label: {
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#64748b',
    marginBottom: 6,
  },
  inputWrap: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 8,
    padding: '10px 14px',
    cursor: 'text',
    minHeight: 42,
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#e0e6ed',
    fontSize: 14,
    width: '100%',
  },
  selected: {
    color: '#e0e6ed',
    fontSize: 14,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 260,
    overflowY: 'auto',
    zIndex: 1000,
    listStyle: 'none',
    padding: 4,
  },
  item: {
    padding: '8px 12px',
    borderRadius: 6,
    cursor: 'pointer',
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    fontSize: 13,
    transition: 'background 0.15s',
  },
  icao: {
    fontWeight: 700,
    color: '#60a5fa',
    fontFamily: 'monospace',
    minWidth: 50,
  },
  city: {
    color: '#e0e6ed',
    fontWeight: 600,
    minWidth: 90,
  },
  name: {
    color: '#94a3b8',
    fontSize: 12,
  },
};
