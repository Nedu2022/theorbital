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

  const getStatusColor = (status: number): [number, number, number] => {
    switch (status) {
      case 0:
        return [0, 255, 157];
      case 1:
        return [251, 191, 36];
      case 5:
        return [59, 130, 246];
      default:
        return [148, 163, 184];
    }
  };

  const layers = [
    new ScatterplotLayer<MergedShip>({
      id: "ship-dots",
      data: ships,
      pickable: true,
      opacity: 1,
      stroked: true,
      filled: true,
      radiusScale: 1,
      radiusMinPixels: 6, // Much larger minimum
      radiusMaxPixels: 30,
      lineWidthMinPixels: 2,
      getPosition: (d) => [d.lng, d.lat],
      getRadius: (d) => (d.sog > 1 ? 300 : 150),
      // Bright fill color based on status
      getFillColor: (d) => {
        switch (d.status) {
          case 0:
            return [0, 255, 157, 220]; // Green - Moving
          case 1:
            return [251, 191, 36, 220]; // Yellow - Stopped
          case 5:
            return [59, 130, 246, 220]; // Blue - Docked
          default:
            return [0, 255, 255, 200]; // Cyan - Unknown
        }
      },
      getLineColor: () => [255, 255, 255, 255], // White border
      onClick: ({ object }) => object && onSelectShip(object),
      transitions: {
        getPosition: 1000,
        getLineColor: 300,
        getRadius: 300,
      },
      // @ts-ignore
      getRowId: (d) => d.mmsi,
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
      getSize: 24,
      getColor: [255, 255, 255, 255],
      getAngle: 0,
      getTextAnchor: "middle",
      getAlignmentBaseline: "center",
      fontFamily: "Share Tech Mono, monospace",
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
