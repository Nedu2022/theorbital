import { useMemo } from 'react';
import { MergedShip } from './useShipData';

export interface GeoZone {
    id: string;
    name: string;
    type: 'piracy' | 'war' | 'blockade';
    color: [number, number, number];
    polygon: [number, number][];
    description: string;
}

const RED_SEA_ZONE: GeoZone = {
    id: 'red-sea',
    name: 'Red Sea - High Risk Area',
    type: 'piracy',
    color: [255, 0, 0],
    description: 'Houthi controlled waters. High risk of drone attacks.',
    polygon: [
        [32.5, 29.9],
        [34.9, 29.5],
        [43.5, 12.6],
        [43.0, 12.4],
        [32.5, 29.9]
    ]
};

const GIBRALTAR_ZONE: GeoZone = {
    id: 'gibraltar',
    name: 'Strait of Gibraltar',
    type: 'blockade',
    color: [255, 165, 0],
    description: 'Potential choke point.',
    polygon: [
        [-6.0, 36.2],
        [-5.2, 36.2],
        [-5.2, 35.8],
        [-6.0, 35.8],
        [-6.0, 36.2]
    ]
};

function isPointInPolygon(point: [number, number], vs: [number, number][]) {
    const x = point[0], y = point[1];
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        const xi = vs[i][0], yi = vs[i][1];
        const xj = vs[j][0], yj = vs[j][1];
        const intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

export const useGeofencing = (ships: MergedShip[], activeSimulation: boolean) => {
    const zones = useMemo(() => [RED_SEA_ZONE, GIBRALTAR_ZONE], []);

    const impactedShips = useMemo(() => {
        if (!activeSimulation) return [];

        const impacted: { ship: MergedShip, zone: GeoZone }[] = [];

        ships.forEach(ship => {
            zones.forEach(zone => {
                if (isPointInPolygon([ship.lng, ship.lat], zone.polygon)) {
                    impacted.push({ ship, zone });
                }
            });
        });

        return impacted;
    }, [ships, activeSimulation, zones]);

    return {
        zones,
        impactedShips,
        riskLevel: impactedShips.length > 0 ? 'CRITICAL' : 'LOW'
    };
};
