const EARTH_RADIUS_KM = 6371;

/** Escape user text used inside $regex so ( ) [ ] + * cannot change meaning. */
const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Great-circle distance in km. */
const haversineKm = (lat1, lon1, lat2, lon2) => {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/** Distance rounded to 0.1 km. */
const distanceKm = (lat, lng, pointLat, pointLng) =>
  Math.round(haversineKm(lat, lng, pointLat, pointLng) * 10) / 10;

/**
 * True when a usable geo query was supplied (lat + lng + radius > 0).
 * Mutates `query` with the bounding-box pre-filter on lat/lng fields.
 */
const applyGeoBounds = (query, lat, lng, radius, latField, lngField) => {
  const useGeo = lat !== null && lng !== null && radius > 0;
  if (!useGeo) return false;
  const latRad = (lat * Math.PI) / 180;
  const deltaLat = (radius / EARTH_RADIUS_KM) * (180 / Math.PI);
  const deltaLng = deltaLat / Math.cos(latRad);
  query[latField] = { $gte: lat - deltaLat, $lte: lat + deltaLat };
  query[lngField] = { $gte: lng - deltaLng, $lte: lng + deltaLng };
  return true;
};

/** The token a location display string carries as "the city" (before a comma). */
const cityToken = (value) =>
  (String(value).split(",")[0] || "").trim() || String(value).trim();

module.exports = {
  escapeRegex,
  haversineKm,
  distanceKm,
  applyGeoBounds,
  cityToken,
};
