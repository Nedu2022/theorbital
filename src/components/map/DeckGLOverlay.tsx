import { useEffect, useMemo } from "react";
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

function DeckGLOverlayInner({ props }: { props: DeckGLOverlayProps }) {
  const { ships, onSelectShip, zones = [], showZones = false } = props;

  const overlay = useControl<MapboxOverlay>(
    () => new MapboxOverlay({ interleaved: true }),
  );

  const layers = useMemo(() => {
    console.log("Rendering", ships.length, "ships");

    return [
      // Ship dots - bright colored circles
      new ScatterplotLayer<MergedShip>({
        id: "ships",
        data: ships,
        pickable: true,
        opacity: 1,
        stroked: true,
        filled: true,
        radiusMinPixels: 5,
        radiusMaxPixels: 25,
        lineWidthMinPixels: 1.5,
        getPosition: (d) => [d.lng, d.lat],
        getRadius: 200,
        getFillColor: (d) => {
          if (d.status === 0) return [0, 255, 100, 255]; // Green - Moving
          if (d.status === 1) return [255, 200, 50, 255]; // Yellow - Stopped
          if (d.status === 5) return [80, 150, 255, 255]; // Blue - Docked
          return [0, 220, 220, 255]; // Cyan - Unknown
        },
        getLineColor: [255, 255, 255, 200],
        onClick: ({ object }) => object && onSelectShip(object),
      }),

      // Crisis zones
      new PolygonLayer({
        id: "zones",
        data: zones,
        visible: showZones,
        stroked: true,
        filled: true,
        lineWidthMinPixels: 2,
        getPolygon: (d: GeoZone) => d.polygon,
        getFillColor: (d: GeoZone) =>
          [...d.color, 50] as [number, number, number, number],
        getLineColor: (d: GeoZone) =>
          [...d.color, 255] as [number, number, number, number],
      }),

      // Port labels
      new TextLayer({
        id: "ports",
        data: MAJOR_PORTS,
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
        fontSettings: { sdf: true },
      }),
    ];
  }, [ships, onSelectShip, zones, showZones]);

  useEffect(() => {
    overlay.setProps({ layers });
  }, [overlay, layers]);

  return null;
}

export default function DeckGLOverlay(props: DeckGLOverlayProps) {
  return <DeckGLOverlayInner props={props} />;
}
