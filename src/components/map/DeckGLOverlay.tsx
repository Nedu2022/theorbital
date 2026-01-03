import { useControl } from "react-map-gl/mapbox";
import { MapboxOverlay } from "@deck.gl/mapbox";
import {
  ScatterplotLayer,
  PathLayer,
  PolygonLayer,
  TextLayer,
} from "@deck.gl/layers";
import type { MergedShip } from "../../hooks/useShipData";
import type { GeoZone } from "../../hooks/useGeofencing";
import { MAJOR_PORTS } from "../../data/ports";

interface DeckGLOverlayProps {
  ships: MergedShip[];
  onSelectShip: (ship: MergedShip) => void;
  hoveredShipId?: string | null;
  zones?: GeoZone[];
  showZones?: boolean;
}

export default function DeckGLOverlay({
  ships,
  onSelectShip,
  hoveredShipId,
  zones = [],
  showZones = false,
}: DeckGLOverlayProps) {
  const overlay = useControl<MapboxOverlay>(
    () =>
      new MapboxOverlay({
        interleaved: true,
        layers: [],
      })
  );

  // Helper status color mapping
  const getStatusColor = (status: number): [number, number, number] => {
    switch (status) {
      case 0:
        return [0, 255, 157]; // Neon Green (Moving)
      case 1:
        return [251, 191, 36]; // Yellow (Anchored)
      case 5:
        return [59, 130, 246]; // Blue (Moored)
      default:
        return [148, 163, 184]; // Grey
    }
  };

  const layers = [
    // 2. Ship Dot (Core)
    new ScatterplotLayer<MergedShip>({
      id: "ship-dots",
      data: ships,
      pickable: true,
      opacity: 0.8,
      stroked: true,
      filled: true,
      radiusScale: 1,
      radiusMinPixels: 3,
      radiusMaxPixels: 20,
      lineWidthMinPixels: 1,
      getPosition: (d) => [d.lng, d.lat],
      getRadius: (d) => (d.sog > 1 ? 200 : 100), // Size in meters
      getFillColor: (d) => [0, 0, 0, 200], // Black center
      getLineColor: (d) => getStatusColor(d.status),
      onClick: ({ object }) => object && onSelectShip(object),
      transitions: {
        getPosition: 1000,
        getLineColor: 300,
        getRadius: 300,
      },
      // @ts-ignore
      getRowId: (d) => d.mmsi,
    }),

    // 3. Crisis Zones
    new PolygonLayer({
      id: "crisis-zones",
      data: zones,
      pickable: false,
      stroked: true,
      filled: true,
      wireframe: true,
      lineWidthMinPixels: 2,
      getPolygon: (d: GeoZone) => d.polygon,
      getFillColor: (d: GeoZone) =>
        [...d.color, 50] as [number, number, number, number],
      getLineColor: (d: GeoZone) =>
        [...d.color, 255] as [number, number, number, number],
      visible: showZones,
      transitions: {
        getFillColor: 300,
        getLineColor: 300,
      },
    }),

    // 4. Port Names (Text)
    new TextLayer({
      id: "port-names",
      data: MAJOR_PORTS,
      pickable: false,
      getPosition: (d) => [d.lng, d.lat],
      getText: (d) => d.name,
      getSize: 24,
      getColor: [255, 255, 255, 255],
      getAngle: 0,
      getTextAnchor: "middle",
      getAlignmentBaseline: "center",
      fontFamily: "Inter, system-ui, sans-serif",
      fontWeight: "bold",
      outlineColor: [0, 0, 0, 255],
      outlineWidth: 4,
      background: true,
      getBackgroundColor: [0, 0, 0, 160],
      backgroundPadding: [8, 6],
    }),
  ];

  overlay.setProps({ layers });

  return null;
}
