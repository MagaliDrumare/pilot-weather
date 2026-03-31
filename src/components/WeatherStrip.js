import React from 'react';
import { decodeWeatherCode, getFlightCategory } from '../utils/weather';

function WeatherIcon({ code }) {
  const icons = {
    clear: '\u2600\uFE0F',
    clouds: '\u2601\uFE0F',
    fog: '\uD83C\uDF2B\uFE0F',
    rain: '\uD83C\uDF27\uFE0F',
    snow: '\u2744\uFE0F',
    storm: '\u26A1',
  };
  const decoded = decodeWeatherCode(code);
  return <span style={{ fontSize: 28 }}>{icons[decoded.icon] || '\u2753'}</span>;
}

function WindArrow({ direction }) {
  return (
    <span
      style={{
        display: 'inline-block',
        transform: `rotate(${direction}deg)`,
        fontSize: 18,
        lineHeight: 1,
      }}
    >
      {'\u2191'}
    </span>
  );
}

function WeatherStrip({ waypoints, waypointWeather, loading }) {
  if (!waypoints || waypoints.length === 0) return null;

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Route Weather Strip</h3>
      {loading ? (
        <div style={styles.loading}>Loading weather data...</div>
      ) : (
        <div style={styles.strip}>
          {/* Connection line */}
          <div style={styles.line} />
          {waypoints.map((wp, i) => {
            const wx = waypointWeather[i];
            const decoded = wx ? decodeWeatherCode(wx.weather_code) : null;
            const cat = wx ? getFlightCategory(wx.visibility, wx.cloud_cover) : null;

            return (
              <div key={i} style={styles.point}>
                {/* Dot */}
                <div
                  style={{
                    ...styles.dot,
                    width: wp.isAirport ? 16 : 10,
                    height: wp.isAirport ? 16 : 10,
                    background: cat ? cat.color : '#475569',
                    boxShadow: cat ? `0 0 8px ${cat.color}66` : 'none',
                  }}
                />
                {/* Label */}
                <div
                  style={{ ...styles.label, fontWeight: wp.isAirport ? 700 : 400 }}
                  title={wp.tooltip || wp.label}
                >
                  {wp.label}
                </div>
                {/* Weather card */}
                {wx ? (
                  <div style={styles.card}>
                    {cat && (
                      <div
                        style={{
                          ...styles.cat,
                          background: cat.color,
                        }}
                      >
                        {cat.cat}
                      </div>
                    )}
                    <WeatherIcon code={wx.weather_code} />
                    <div style={styles.temp}>{Math.round(wx.temperature_2m)}°C</div>
                    <div style={styles.wind}>
                      <WindArrow direction={wx.wind_direction_10m} />
                      <span>{Math.round(wx.wind_speed_10m)} kn</span>
                    </div>
                    <div style={styles.detail}>
                      QNH {Math.round(wx.pressure_msl)}
                    </div>
                    <div style={styles.detail}>
                      Cloud {wx.cloud_cover}%
                    </div>
                    {wx.visibility != null && (
                      <div style={styles.detail}>
                        Vis {(wx.visibility / 1000).toFixed(0)} km
                      </div>
                    )}
                    {decoded && (
                      <div style={{ ...styles.detail, color: decoded.color }}>
                        {decoded.text}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ ...styles.card, color: '#475569' }}>No data</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default React.memo(WeatherStrip);

const styles = {
  container: {
    marginTop: 24,
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#64748b',
    marginBottom: 16,
  },
  strip: {
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative',
    padding: '0 10px',
    overflowX: 'auto',
    gap: 8,
  },
  line: {
    position: 'absolute',
    top: 7,
    left: 30,
    right: 30,
    height: 2,
    background: 'linear-gradient(90deg, #3b82f6, #60a5fa, #3b82f6)',
    opacity: 0.4,
    zIndex: 0,
  },
  point: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
    flex: 1,
    minWidth: 90,
  },
  dot: {
    borderRadius: '50%',
    border: '2px solid #fff',
    marginBottom: 6,
  },
  label: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 8,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  card: {
    background: '#111827',
    borderRadius: 10,
    padding: '10px 8px',
    textAlign: 'center',
    fontSize: 12,
    minWidth: 85,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    border: '1px solid #1e293b',
  },
  cat: {
    color: '#fff',
    fontWeight: 800,
    fontSize: 11,
    padding: '2px 10px',
    borderRadius: 4,
    letterSpacing: 1,
  },
  temp: {
    fontSize: 18,
    fontWeight: 700,
    color: '#e0e6ed',
  },
  wind: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    color: '#94a3b8',
    fontSize: 12,
  },
  detail: {
    color: '#64748b',
    fontSize: 11,
  },
  loading: {
    textAlign: 'center',
    color: '#475569',
    padding: 40,
  },
};
