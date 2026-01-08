import { useEffect } from "react";
import { useMap } from "react-map-gl/mapbox";

interface MapControllerProps {
  targetZone: string | null;
  userLocation?: { lat: number; lng: number } | null;
}

const ZONES: Record<string, { center: [number, number]; zoom: number }> = {
  global: { center: [32.0, 30.0], zoom: 2 },
  suez: { center: [32.265, 30.5852], zoom: 10 },
  rotterdam: { center: [4.0, 51.95], zoom: 11 },
  singapore: { center: [103.85, 1.25], zoom: 11 },
  dover: { center: [1.35, 51.0], zoom: 10 },
  panama: { center: [-79.55, 8.95], zoom: 10 },
  la: { center: [-118.25, 33.7], zoom: 10 },
  hormuz: { center: [56.5, 26.6], zoom: 9 },
};

export default function MapController({
  targetZone,
  userLocation,
}: MapControllerProps) {
  const { current: map } = useMap();

  useEffect(() => {
    if (!map) return;

    // If targetZone is "local" and we have user location, fly to user
    if (targetZone === "local" && userLocation) {
      map.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 10,
        duration: 2000,
        essential: true,
      });
      return;
    }

    // Otherwise, use preset zones
    if (targetZone && ZONES[targetZone]) {
      const { center, zoom } = ZONES[targetZone];
      map.flyTo({
        center: center,
        zoom: zoom,
        duration: 2000,
        essential: true,
      });
    }
  }, [targetZone, map, userLocation]);

  return null;
}
