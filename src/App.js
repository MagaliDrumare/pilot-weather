import React, { useState, useCallback, useEffect, Suspense, lazy } from 'react';
import airports from './data/airports';
import AirportSelector from './components/AirportSelector';
import FlightInfo from './components/FlightInfo';
import WeatherStrip from './components/WeatherStrip';
import MetarPanel from './components/MetarPanel';
import {
  getRouteWaypoints,
  fetchRouteWeather,
  resolveWaypointNames,
  fetchMetarBatch,
  fetchTafBatch,
} from './utils/weather';

const FlightMap = lazy(() => import('./components/FlightMap'));

export default function App() {
  const [depIcao, setDepIcao] = useState('LFPG');
  const [arrIcao, setArrIcao] = useState('EGLL');
  const [waypoints, setWaypoints] = useState([]);
  const [waypointWeather, setWaypointWeather] = useState([]);
  const [depMetar, setDepMetar] = useState(null);
  const [arrMetar, setArrMetar] = useState(null);
  const [depTaf, setDepTaf] = useState(null);
  const [arrTaf, setArrTaf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const departure = airports.find((a) => a.icao === depIcao);
  const arrival = airports.find((a) => a.icao === arrIcao);

  const fetchBriefing = useCallback(async () => {
    if (!departure || !arrival) return;
    setLoading(true);
    setError(null);

    try {
      const wps = getRouteWaypoints(departure, arrival, 5);
      setWaypoints(wps);

      const icaos = [departure.icao, arrival.icao];
      const [wxResults, resolvedWps, metarMap, tafMap] = await Promise.all([
        fetchRouteWeather(wps),
        resolveWaypointNames(wps),
        fetchMetarBatch(icaos),
        fetchTafBatch(icaos),
      ]);

      setWaypoints(resolvedWps);
      setWaypointWeather(wxResults);
      setDepMetar(metarMap[departure.icao] || null);
      setArrMetar(metarMap[arrival.icao] || null);
      setDepTaf(tafMap[departure.icao] || null);
      setArrTaf(tafMap[arrival.icao] || null);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Briefing fetch failed:', err);
      setError('Failed to load weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [departure, arrival]);

  // Auto-fetch when both airports are selected
  useEffect(() => {
    if (depIcao && arrIcao && depIcao !== arrIcao) {
      fetchBriefing();
    }
  }, [depIcao, arrIcao, fetchBriefing]);

  return (
    <div style={styles.app}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <span style={{ fontSize: 24 }}>{'\u2708'}</span>
          <span style={styles.logoText}>Pilot Weather Briefing</span>
        </div>
        {lastUpdate && (
          <span style={styles.updated}>
            Updated {lastUpdate.toLocaleTimeString()}
          </span>
        )}
      </header>

      {/* Airport selection */}
      <div style={styles.selectors}>
        <AirportSelector
          label="Departure"
          value={depIcao}
          onChange={setDepIcao}
        />
        <div style={styles.arrow}>{'\u2192'}</div>
        <AirportSelector
          label="Arrival"
          value={arrIcao}
          onChange={setArrIcao}
        />
        {depIcao && arrIcao && (
          <button style={styles.refreshBtn} onClick={fetchBriefing} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div style={styles.errorBanner}>
          {error}
          <button
            style={styles.errorDismiss}
            onClick={() => setError(null)}
          >
            {'\u2715'}
          </button>
        </div>
      )}

      {/* Flight info bar */}
      {departure && arrival && (
        <FlightInfo departure={departure} arrival={arrival} />
      )}

      {/* Map */}
      <Suspense fallback={<div style={{ height: 420, background: '#111827', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>Loading map...</div>}>
        <FlightMap waypoints={waypoints} waypointWeather={waypointWeather} />
      </Suspense>

      {/* Weather strip */}
      <WeatherStrip
        waypoints={waypoints}
        waypointWeather={waypointWeather}
        loading={loading}
      />

      {/* METAR / TAF panel */}
      <MetarPanel
        depMetar={depMetar}
        arrMetar={arrMetar}
        depTaf={depTaf}
        arrTaf={arrTaf}
        depIcao={depIcao}
        arrIcao={arrIcao}
      />

      {/* Footer */}
      <footer style={styles.footer}>
        Weather data from Open-Meteo & aviationweather.gov | Not for operational use
      </footer>
    </div>
  );
}

const styles = {
  app: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '20px 24px 40px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottom: '1px solid #1e293b',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 800,
    background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  updated: {
    fontSize: 12,
    color: '#475569',
  },
  selectors: {
    display: 'flex',
    gap: 16,
    alignItems: 'flex-end',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  arrow: {
    fontSize: 22,
    color: '#475569',
    paddingBottom: 10,
  },
  refreshBtn: {
    background: '#1e40af',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '10px 20px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    height: 42,
    whiteSpace: 'nowrap',
  },
  errorBanner: {
    background: '#7f1d1d',
    color: '#fca5a5',
    padding: '10px 16px',
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 16,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: '1px solid #991b1b',
  },
  errorDismiss: {
    background: 'none',
    border: 'none',
    color: '#fca5a5',
    fontSize: 16,
    cursor: 'pointer',
    padding: '0 4px',
  },
  footer: {
    marginTop: 32,
    textAlign: 'center',
    fontSize: 11,
    color: '#334155',
    borderTop: '1px solid #1e293b',
    paddingTop: 16,
  },
};
