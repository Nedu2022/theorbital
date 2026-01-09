import { useControl } from "react-map-gl/mapbox";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { ScatterplotLayer, PolygonLayer, TextLayer } from "@deck.gl/layers";
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

  const layers = [
    // Ship markers - bright colored dots
    new ScatterplotLayer<MergedShip>({
      id: "ship-markers",
      data: ships,
      pickable: true,
      opacity: 1,
      stroked: true,
      filled: true,
      radiusScale: 1,
      radiusMinPixels: 5,
      radiusMaxPixels: 25,
      lineWidthMinPixels: 1.5,
      getPosition: (d) => [d.lng, d.lat],
      getRadius: 200,
      getFillColor: (d) => {
        // Green for moving, yellow for stopped, blue for docked
        switch (d.status) {
          case 0:
            return [0, 255, 100, 255]; // Bright green
          case 1:
            return [255, 200, 50, 255]; // Yellow
          case 5:
            return [80, 150, 255, 255]; // Blue
          default:
            return [0, 220, 220, 255]; // Cyan
        }
      },
      getLineColor: [255, 255, 255, 200],
      onClick: ({ object }) => object && onSelectShip(object),
      transitions: {
        getPosition: 800,
      },
      updateTriggers: {
        getFillColor: [ships.length],
      },
    }),

    // Crisis zones overlay
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
    }),

    // Port labels
    new TextLayer({
      id: "port-names",
      data: MAJOR_PORTS,
      pickable: false,
      getPosition: (d) => [d.lng, d.lat],
      getText: (d) => d.name,
      getSize: 13,
      getColor: [255, 255, 255, 180],
      getTextAnchor: "middle",
      getAlignmentBaseline: "center",
      fontFamily: "sans-serif",
      fontWeight: "600",
      outlineColor: [0, 0, 0, 200],
      outlineWidth: 2,
    }),
  ];

  overlay.setProps({ layers });

  return null;
}
