import React from 'react';
import { distanceNM } from '../utils/weather';

export default function FlightInfo({ departure, arrival }) {
  if (!departure || !arrival) return null;

  const dist = distanceNM(departure.lat, departure.lon, arrival.lat, arrival.lon);
  const bearing = calculateBearing(departure.lat, departure.lon, arrival.lat, arrival.lon);

  return (
    <div style={styles.container}>
      <div style={styles.row}>
        <InfoBox label="Distance" value={`${Math.round(dist)} NM`} />
        <InfoBox label="Heading" value={`${Math.round(bearing)}°`} />
        <InfoBox label="Est. Time (120 kn)" value={formatTime(dist / 120)} />
        <InfoBox label="Est. Time (250 kn)" value={formatTime(dist / 250)} />
        <InfoBox label="Est. Time (450 kn)" value={formatTime(dist / 450)} />
      </div>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div style={styles.box}>
      <div style={styles.boxLabel}>{label}</div>
      <div style={styles.boxValue}>{value}</div>
    </div>
  );
}

function calculateBearing(lat1, lon1, lat2, lon2) {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const la1 = (lat1 * Math.PI) / 180;
  const la2 = (lat2 * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos(la2);
  const x = Math.cos(la1) * Math.sin(la2) - Math.sin(la1) * Math.cos(la2) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function formatTime(hours) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
}

const styles = {
  container: { marginBottom: 20 },
  row: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
  },
  box: {
    background: '#111827',
    border: '1px solid #1e293b',
    borderRadius: 10,
    padding: '10px 16px',
    flex: 1,
    minWidth: 110,
    textAlign: 'center',
  },
  boxLabel: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: '#475569',
    marginBottom: 4,
  },
  boxValue: {
    fontSize: 18,
    fontWeight: 800,
    color: '#e0e6ed',
    fontFamily: 'monospace',
  },
};
