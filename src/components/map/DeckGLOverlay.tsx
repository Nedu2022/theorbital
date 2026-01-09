import { useControl } from "react-map-gl/mapbox";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { IconLayer, PolygonLayer, TextLayer } from "@deck.gl/layers";
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

// Ship icon as data URL (simple boat shape pointing up)
const SHIP_ICON = `data:image/svg+xml;base64,${btoa(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <polygon points="16,2 26,28 16,22 6,28" fill="#00ff9d" stroke="white" stroke-width="2"/>
</svg>
`)}`;

const SHIP_ICON_YELLOW = `data:image/svg+xml;base64,${btoa(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <polygon points="16,2 26,28 16,22 6,28" fill="#fbbf24" stroke="white" stroke-width="2"/>
</svg>
`)}`;

const SHIP_ICON_BLUE = `data:image/svg+xml;base64,${btoa(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <polygon points="16,2 26,28 16,22 6,28" fill="#3b82f6" stroke="white" stroke-width="2"/>
</svg>
`)}`;

const ICON_MAPPING = {
  moving: { x: 0, y: 0, width: 32, height: 32, mask: false },
  stopped: { x: 0, y: 0, width: 32, height: 32, mask: false },
  docked: { x: 0, y: 0, width: 32, height: 32, mask: false },
};

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

  const getShipIcon = (status: number): string => {
    switch (status) {
      case 0:
        return SHIP_ICON; // Green - Moving
      case 1:
        return SHIP_ICON_YELLOW; // Yellow - Stopped
      case 5:
        return SHIP_ICON_BLUE; // Blue - Docked
      default:
        return SHIP_ICON; // Default green
    }
  };

  const layers = [
    new IconLayer<MergedShip>({
      id: "ship-icons",
      data: ships,
      pickable: true,
      getPosition: (d) => [d.lng, d.lat],
      getIcon: (d) => ({
        url: getShipIcon(d.status),
        width: 32,
        height: 32,
        anchorY: 16,
      }),
      getSize: 24,
      sizeMinPixels: 12,
      sizeMaxPixels: 40,
      getAngle: (d) => 360 - (d.heading || 0), // Rotate based on heading
      onClick: ({ object }) => object && onSelectShip(object),
      transitions: {
        getPosition: 1000,
        getAngle: 500,
      },
    }),

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

    new TextLayer({
      id: "port-names",
      data: MAJOR_PORTS,
      pickable: false,
      getPosition: (d) => [d.lng, d.lat],
      getText: (d) => d.name,
      getSize: 14,
      getColor: [255, 255, 255, 200],
      getAngle: 0,
      getTextAnchor: "middle",
      getAlignmentBaseline: "center",
      fontFamily: "Inter, sans-serif",
      fontWeight: "600",
      outlineColor: [0, 0, 0, 200],
      outlineWidth: 2,
    }),
  ];

  overlay.setProps({ layers });

  return null;
}
