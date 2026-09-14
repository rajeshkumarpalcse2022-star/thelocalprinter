"use client";

import { useCallback, useEffect, useState } from "react";

export function useUserLocation({ defaultLocation = "Hyderabad" } = {}) {
  const [location, setLocation] = useState(defaultLocation);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const detectLocation = useCallback(async () => {
    if (typeof window === "undefined" || !navigator.geolocation) return;
    setLoading(true);
    setError(null);

    try {
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        })
      );
      const { latitude, longitude } = pos.coords;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await res.json();
      const city =
        data.address.city ||
        data.address.town ||
        data.address.state_district ||
        defaultLocation;
      setLocation(city);
    } catch (err) {
      setError(err.message || "Location access denied");
    } finally {
      setLoading(false);
    }
  }, [defaultLocation]);

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  return { location, loading, error, detectLocation };
}
