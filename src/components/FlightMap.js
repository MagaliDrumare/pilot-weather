import React from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { decodeWeatherCode, getFlightCategory } from '../utils/weather';

// Custom marker icons
function createIcon(color, size = 14) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};border:2px solid #fff;
      box-shadow:0 0 6px ${color}88;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function airportIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:22px;height:22px;border-radius:50%;
      background:#3b82f6;border:3px solid #fff;
      box-shadow:0 0 10px #3b82f688;
      display:flex;align-items:center;justify-content:center;
      font-size:11px;color:#fff;font-weight:bold;
    ">&#9992;</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

function FlightMap({ waypoints, waypointWeather }) {
  if (!waypoints || waypoints.length < 2) {
    return (
      <div style={styles.placeholder}>
        Select departure and arrival airports to see the route map
      </div>
    );
  }

  const positions = waypoints.map((w) => [w.lat, w.lon]);
  const center = [
    (waypoints[0].lat + waypoints[waypoints.length - 1].lat) / 2,
    (waypoints[0].lon + waypoints[waypoints.length - 1].lon) / 2,
  ];

  return (
    <div style={styles.mapWrap}>
      <MapContainer
        center={center}
        zoom={5}
        style={{ height: '100%', width: '100%', borderRadius: 12 }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        <Polyline
          positions={positions}
          pathOptions={{ color: '#60a5fa', weight: 3, dashArray: '8 6', opacity: 0.7 }}
        />
        {waypoints.map((wp, i) => {
          const wx = waypointWeather[i];
          const decoded = wx ? decodeWeatherCode(wx.weather_code) : null;
          const cat = wx ? getFlightCategory(wx.visibility, wx.cloud_cover) : null;
          const icon = wp.isAirport
            ? airportIcon()
            : createIcon(cat ? cat.color : '#94a3b8');

          return (
            <Marker key={i} position={[wp.lat, wp.lon]} icon={icon}>
              <Tooltip direction="top" offset={[0, -10]} permanent={wp.isAirport}>
                <span style={{ fontWeight: 700 }}>{wp.label}</span>
                {wp.tooltip && wp.tooltip !== wp.label && (
                  <span style={{ display: 'block', fontSize: 10, opacity: 0.7 }}>{wp.tooltip}</span>
                )}
              </Tooltip>
              {wx && (
                <Popup>
                  <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                    <strong>{wp.label}</strong>
                    {cat && (
                      <span style={{
                        marginLeft: 8, padding: '2px 8px', borderRadius: 4,
                        background: cat.color, color: '#fff', fontWeight: 700, fontSize: 11,
                      }}>
                        {cat.cat}
                      </span>
                    )}
                    <br />
                    {decoded && <span>{decoded.text}</span>}<br />
                    Temp: {wx.temperature_2m}°C<br />
                    Wind: {Math.round(wx.wind_speed_10m)} kn @ {wx.wind_direction_10m}°<br />
                    Cloud cover: {wx.cloud_cover}%<br />
                    QNH: {Math.round(wx.pressure_msl)} hPa
                    {wx.visibility != null && <><br />Vis: {(wx.visibility / 1000).toFixed(1)} km</>}
                  </div>
                </Popup>
              )}
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default React.memo(FlightMap);

const styles = {
  mapWrap: {
    height: 420,
    borderRadius: 12,
    overflow: 'hidden',
    border: '1px solid #1e293b',
  },
  placeholder: {
    height: 420,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#111827',
    borderRadius: 12,
    color: '#475569',
    fontSize: 15,
    border: '1px dashed #334155',
  },
};
