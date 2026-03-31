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
      {taf && taf.fcsts && (
        <div style={styles.tafDecoded}>
          {taf.fcsts.map((f, i) => (
            <TafPeriod key={i} fcst={f} />
          ))}
        </div>
      )}
    </div>
  );
}

function formatUtc(epoch) {
  if (!epoch) return '';
  const d = new Date(epoch * 1000);
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const hh = String(d.getUTCHours()).padStart(2, '0');
  return `${dd}/${hh}Z`;
}

function describeClouds(clouds) {
  if (!clouds || clouds.length === 0) return null;
  return clouds
    .filter((c) => c.cover && c.cover !== 'NSC' && c.cover !== 'CLR')
    .map((c) => {
      const base = c.base != null ? ` ${c.base} ft` : '';
      const type = c.type ? ` (${c.type})` : '';
      return `${c.cover}${base}${type}`;
    })
    .join(', ');
}

function describeWx(wxString) {
  const wx = {
    BR: 'Mist', FG: 'Fog', HZ: 'Haze', RA: 'Rain', SN: 'Snow',
    DZ: 'Drizzle', TS: 'Thunderstorm', SH: 'Showers', GR: 'Hail',
    FZRA: 'Freezing rain', FZFG: 'Freezing fog', TSRA: 'Thunderstorm + rain',
    '+RA': 'Heavy rain', '-RA': 'Light rain', '+SN': 'Heavy snow', '-SN': 'Light snow',
    '+TSRA': 'Heavy thunderstorm', SHRA: 'Rain showers', '-SHRA': 'Light showers',
  };
  return wx[wxString] || wxString;
}

function wxSeverityColor(fcst) {
  if (fcst.wxString && /TS|FZ|SN/.test(fcst.wxString)) return '#ef4444';
  if (fcst.wxString && /FG/.test(fcst.wxString)) return '#ef4444';
  if (fcst.visib && fcst.visib !== '' && fcst.visib !== '6+' && parseFloat(fcst.visib) < 5000) return '#ef4444';
  if (fcst.probability >= 40) return '#f97316';
  if (fcst.probability >= 30) return '#facc15';
  if (fcst.fcstChange === 'TEMPO') return '#3b82f6';
  if (fcst.fcstChange === 'BECMG') return '#a78bfa';
  return '#334155';
}

function TafPeriod({ fcst }) {
  const from = formatUtc(fcst.timeFrom);
  const to = formatUtc(fcst.timeTo);
  const clouds = describeClouds(fcst.clouds);
  const isCavok = fcst.clouds?.some((c) => c.cover === 'NSC') && (!fcst.visib || fcst.visib === '6+');
  const borderColor = wxSeverityColor(fcst);

  const changeLabel = fcst.fcstChange || 'BASE';
  const probLabel = fcst.probability ? `PROB${fcst.probability}` : '';
  const header = [probLabel, changeLabel].filter(Boolean).join(' ');

  return (
    <div style={{ ...styles.tafPeriod, borderLeftColor: borderColor }}>
      <div style={styles.tafHeader}>
        <span style={{ ...styles.tafChange, background: borderColor }}>{header}</span>
        <span style={styles.tafTime}>{from} — {to}</span>
      </div>
      <div style={styles.tafChips}>
        {isCavok && <Chip label="Sky" value="CAVOK" color="#4ade80" />}
        {fcst.wdir != null && <Chip label="Wind" value={`${fcst.wdir}° / ${fcst.wspd} kn`} />}
        {fcst.wgst != null && <Chip label="Gust" value={`${fcst.wgst} kn`} color="#f97316" />}
        {fcst.visib && fcst.visib !== '' && fcst.visib !== '6+' && (
          <Chip label="Vis" value={`${fcst.visib} m`} color={parseFloat(fcst.visib) < 1000 ? '#ef4444' : '#facc15'} />
        )}
        {fcst.wxString && <Chip label="Wx" value={describeWx(fcst.wxString)} color="#ef4444" />}
        {clouds && <Chip label="Clouds" value={clouds} />}
        {fcst.temp && fcst.temp.length > 0 && fcst.temp.map((t, i) => (
          <Chip key={i} label={t.type === 'TX' ? 'Max' : 'Min'} value={`${t.value}°C`} color={t.type === 'TX' ? '#f97316' : '#3b82f6'} />
        ))}
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
  tafDecoded: {
    marginTop: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  tafPeriod: {
    borderLeft: '3px solid #334155',
    paddingLeft: 10,
    paddingTop: 4,
    paddingBottom: 4,
  },
  tafHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  tafChange: {
    fontSize: 10,
    fontWeight: 800,
    color: '#fff',
    padding: '2px 8px',
    borderRadius: 4,
    letterSpacing: 0.5,
  },
  tafTime: {
    fontSize: 11,
    color: '#64748b',
    fontFamily: 'monospace',
  },
  tafChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 5,
  },
};
