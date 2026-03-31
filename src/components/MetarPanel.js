import React from 'react';

export default function MetarPanel({ depMetar, arrMetar, depTaf, arrTaf, depIcao, arrIcao, depName, arrName }) {
  return (
    <div style={styles.container}>
      <h3 style={styles.title}>METAR / TAF</h3>
      <div style={styles.grid}>
        <MetarCard label={`DEP ${depIcao}`} name={depName} metar={depMetar} taf={depTaf} />
        <MetarCard label={`ARR ${arrIcao}`} name={arrName} metar={arrMetar} taf={arrTaf} />
      </div>
    </div>
  );
}

function MetarCard({ label, name, metar, taf }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardLabel}>
        {label}
        {name && <span style={styles.airportName}> — {name}</span>}
      </div>
      <div style={styles.section}>
        <span style={styles.tag}>METAR</span>
        <pre style={styles.raw}>
          {metar ? metar.rawOb : 'Loading...'}
        </pre>
      </div>
      {metar && (
        <div style={styles.decoded}>
          {metar.temp != null && <Chip label="Temp" value={`${metar.temp}°C`} />}
          {metar.dewp != null && <Chip label="Dewpt" value={`${metar.dewp}°C`} />}
          {metar.wdir != null && <Chip label="Wind" value={`${metar.wdir}° / ${metar.wspd} kn`} />}
          {metar.wgst != null && <Chip label="Gust" value={`${metar.wgst} kn`} color="#f97316" />}
          {metar.altim != null && <Chip label="QNH" value={`${Math.round(metar.altim)} hPa`} />}
          {metar.visib != null && <Chip label="Vis" value={`${metar.visib} SM`} />}
          {metar.fltCat && (
            <Chip
              label="Cat"
              value={metar.fltCat}
              color={
                metar.fltCat === 'VFR' ? '#4ade80' :
                metar.fltCat === 'MVFR' ? '#3b82f6' :
                metar.fltCat === 'IFR' ? '#ef4444' : '#dc2626'
              }
            />
          )}
        </div>
      )}
      <div style={{ ...styles.section, marginTop: 8 }}>
        <span style={styles.tag}>TAF</span>
        <pre style={styles.raw}>
          {taf ? taf.rawTAF : 'Loading...'}
        </pre>
      </div>
    </div>
  );
}

function Chip({ label, value, color }) {
  return (
    <span style={{ ...styles.chip, borderColor: color || '#334155' }}>
      <span style={styles.chipLabel}>{label}</span>
      <span style={{ color: color || '#e0e6ed' }}>{value}</span>
    </span>
  );
}

const styles = {
  container: { marginTop: 24 },
  title: {
    fontSize: 14,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#64748b',
    marginBottom: 16,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: 16,
  },
  card: {
    background: '#111827',
    borderRadius: 12,
    padding: 16,
    border: '1px solid #1e293b',
  },
  cardLabel: {
    fontWeight: 800,
    fontSize: 13,
    color: '#60a5fa',
    marginBottom: 10,
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  airportName: {
    fontWeight: 500,
    fontSize: 12,
    color: '#94a3b8',
    letterSpacing: 0,
    fontFamily: 'inherit',
  },
  section: { marginBottom: 4 },
  tag: {
    fontSize: 10,
    fontWeight: 700,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  raw: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#94a3b8',
    background: '#0a1628',
    padding: '8px 10px',
    borderRadius: 6,
    overflowX: 'auto',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    marginTop: 4,
  },
  decoded: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '3px 8px',
    borderRadius: 6,
    border: '1px solid #334155',
    fontSize: 11,
    background: '#0a1628',
  },
  chipLabel: {
    color: '#475569',
    fontWeight: 600,
  },
};
