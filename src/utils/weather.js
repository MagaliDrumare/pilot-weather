import airports from '../data/airports';

const AVWX_BASE = '/api/avwx';

function fetchWithTimeout(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(id));
}

// Batch METAR — proxied via /api/avwx to avoid CORS
export async function fetchMetarBatch(icaos) {
  try {
    const ids = icaos.join(',');
    const res = await fetchWithTimeout(`${AVWX_BASE}/metar?ids=${ids}&format=json&taf=false`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const map = {};
    if (Array.isArray(data)) {
      data.forEach((m) => { if (m.icaoId) map[m.icaoId] = m; });
    }
    return map;
  } catch (err) {
    console.warn('METAR fetch failed:', err.message);
    return {};
  }
}

// Batch TAF
export async function fetchTafBatch(icaos) {
  try {
    const ids = icaos.join(',');
    const res = await fetchWithTimeout(`${AVWX_BASE}/taf?ids=${ids}&format=json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const map = {};
    if (Array.isArray(data)) {
      data.forEach((t) => { if (t.icaoId) map[t.icaoId] = t; });
    }
    return map;
  } catch (err) {
    console.warn('TAF fetch failed:', err.message);
    return {};
  }
}

// Batch route weather via Open-Meteo
export async function fetchRouteWeather(waypoints) {
  try {
    const lats = waypoints.map((w) => w.lat.toFixed(4)).join(',');
    const lons = waypoints.map((w) => w.lon.toFixed(4)).join(',');
    const res = await fetchWithTimeout(
      `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}` +
      `&current=temperature_2m,wind_speed_10m,wind_direction_10m,weather_code,cloud_cover,visibility,pressure_msl` +
      `&wind_speed_unit=kn&timezone=auto`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data)) return data.map((d) => d.current || null);
    return [data.current || null];
  } catch (err) {
    console.warn('Route weather failed:', err.message);
    return waypoints.map(() => null);
  }
}

// Tier 2: find nearest airport within threshold
function nearestAirportLabel(lat, lon, thresholdNM = 50) {
  let best = null;
  let bestDist = Infinity;
  for (const ap of airports) {
    const d = distanceNM(lat, lon, ap.lat, ap.lon);
    if (d < bestDist) {
      bestDist = d;
      best = ap;
    }
  }
  if (best && bestDist < thresholdNM) {
    return { label: `nr. ${best.city}`, tooltip: `${best.name} (${Math.round(bestDist)} NM)` };
  }
  return null;
}

// Tier 3: BigDataCloud reverse geocode with localStorage cache
const geoCache = (() => {
  try {
    return JSON.parse(localStorage.getItem('geo_cache') || '{}');
  } catch { return {}; }
})();

function geoCacheKey(lat, lon) {
  return `${lat.toFixed(2)},${lon.toFixed(2)}`;
}

async function reverseGeocode(lat, lon) {
  const key = geoCacheKey(lat, lon);
  if (geoCache[key]) return geoCache[key];
  try {
    const res = await fetchWithTimeout(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
      5000
    );
    if (!res.ok) return null;
    const data = await res.json();
    const name = data.city || data.locality || data.principalSubdivision || null;
    if (name) {
      geoCache[key] = { label: name, tooltip: `${name}, ${data.countryName || ''}` };
      try { localStorage.setItem('geo_cache', JSON.stringify(geoCache)); } catch {}
    }
    return geoCache[key] || null;
  } catch {
    return null;
  }
}

// Generate waypoints along the route (Tier 1 + Tier 2 sync)
export function getRouteWaypoints(dep, arr, count = 5) {
  const points = [];
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const lat = dep.lat + t * (arr.lat - dep.lat);
    const lon = dep.lon + t * (arr.lon - dep.lon);

    if (i === 0 || i === count) {
      // Tier 1: airport endpoints get ICAO + city
      const ap = i === 0 ? dep : arr;
      points.push({
        lat, lon,
        label: `${ap.icao} \u00B7 ${ap.city}`,
        tooltip: ap.name,
        isAirport: true,
        icao: ap.icao,
        geoResolved: true,
      });
    } else {
      // Tier 2: nearest airport lookup
      const near = nearestAirportLabel(lat, lon);
      points.push({
        lat, lon,
        label: near ? near.label : `WPT${i}`,
        tooltip: near ? near.tooltip : `${lat.toFixed(2)}N ${lon.toFixed(2)}E`,
        isAirport: false,
        icao: null,
        geoResolved: !!near,
      });
    }
  }
  return points;
}

// Tier 3: async resolution for unresolved waypoints
export async function resolveWaypointNames(waypoints) {
  const resolved = [...waypoints];
  const promises = resolved.map(async (wp, i) => {
    if (wp.geoResolved || wp.isAirport) return;
    const geo = await reverseGeocode(wp.lat, wp.lon);
    if (geo) {
      resolved[i] = { ...wp, label: geo.label, tooltip: geo.tooltip, geoResolved: true };
    }
  });
  await Promise.all(promises);
  return resolved;
}

export function decodeWeatherCode(code) {
  const map = {
    0: { text: 'Clear sky', icon: 'clear', color: '#4ade80' },
    1: { text: 'Mainly clear', icon: 'clear', color: '#4ade80' },
    2: { text: 'Partly cloudy', icon: 'clouds', color: '#facc15' },
    3: { text: 'Overcast', icon: 'clouds', color: '#f97316' },
    45: { text: 'Fog', icon: 'fog', color: '#ef4444' },
    48: { text: 'Freezing fog', icon: 'fog', color: '#ef4444' },
    51: { text: 'Light drizzle', icon: 'rain', color: '#facc15' },
    53: { text: 'Moderate drizzle', icon: 'rain', color: '#f97316' },
    55: { text: 'Dense drizzle', icon: 'rain', color: '#ef4444' },
    61: { text: 'Slight rain', icon: 'rain', color: '#facc15' },
    63: { text: 'Moderate rain', icon: 'rain', color: '#f97316' },
    65: { text: 'Heavy rain', icon: 'rain', color: '#ef4444' },
    66: { text: 'Freezing rain (light)', icon: 'rain', color: '#ef4444' },
    67: { text: 'Freezing rain (heavy)', icon: 'rain', color: '#dc2626' },
    71: { text: 'Slight snow', icon: 'snow', color: '#facc15' },
    73: { text: 'Moderate snow', icon: 'snow', color: '#f97316' },
    75: { text: 'Heavy snow', icon: 'snow', color: '#ef4444' },
    77: { text: 'Snow grains', icon: 'snow', color: '#f97316' },
    80: { text: 'Slight showers', icon: 'rain', color: '#facc15' },
    81: { text: 'Moderate showers', icon: 'rain', color: '#f97316' },
    82: { text: 'Violent showers', icon: 'rain', color: '#ef4444' },
    85: { text: 'Snow showers (slight)', icon: 'snow', color: '#facc15' },
    86: { text: 'Snow showers (heavy)', icon: 'snow', color: '#ef4444' },
    95: { text: 'Thunderstorm', icon: 'storm', color: '#dc2626' },
    96: { text: 'Thunderstorm + hail', icon: 'storm', color: '#dc2626' },
    99: { text: 'Thunderstorm + heavy hail', icon: 'storm', color: '#dc2626' },
  };
  return map[code] || { text: 'Unknown', icon: 'clear', color: '#94a3b8' };
}

export function getFlightCategory(visibility, cloudCover) {
  if (visibility != null && visibility < 1600) return { cat: 'LIFR', color: '#dc2626' };
  if (visibility != null && visibility < 5000) return { cat: 'IFR', color: '#ef4444' };
  if (cloudCover != null && cloudCover > 85) return { cat: 'MVFR', color: '#3b82f6' };
  if (visibility != null && visibility < 8000) return { cat: 'MVFR', color: '#3b82f6' };
  return { cat: 'VFR', color: '#4ade80' };
}

export function distanceNM(lat1, lon1, lat2, lon2) {
  const R = 3440.065;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
