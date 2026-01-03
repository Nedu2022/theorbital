import { useState, useEffect } from 'react';
import { useAISSocket } from './useAISSocket';

// Types for our maritime data
export type NavStatus = 0 | 1 | 5 | 15; // 0=Moving, 1=Anchored, 5=Moored, 15=undefined/default

export interface MergedShip {
    mmsi: string;
    lat: number;
    lng: number;
    heading: number;
    sog: number;
    status: NavStatus;
    timestamp: number;
    name?: string;
    type?: string;
    destination?: string;
    eta?: string;
    callSign?: string;
}

const AIS_API_KEY = process.env.NEXT_PUBLIC_AISSTREAM_API_KEY;

export const useShipData = (bbox?: [number, number, number, number]) => {
    // Proxy handles API key, no longer needed in browser
    const { messages, status: socketStatus, errorCode } = useAISSocket({
        bbox,
        enabled: true // Always enabled, proxy handles auth
    });

    const [ships, setShips] = useState<MergedShip[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
    const [latency, setLatency] = useState(0);

    // Sync connection status
    useEffect(() => {
        if (socketStatus === 'connected') {
            setConnectionStatus('connected');
        } else if (socketStatus === 'error') {
            setConnectionStatus('disconnected');
        } else if (socketStatus === 'disconnected') {
            setConnectionStatus('disconnected');
        } else {
            setConnectionStatus('connecting');
        }
    }, [socketStatus]);

    // Process incoming AIS messages
    useEffect(() => {
        if (messages.length === 0) return;

        setShips(currentShips => {
            const shipMap = new Map(currentShips.map(s => [s.mmsi, s]));
            let updated = false;

            // Process last 50 updates per render frame
            const recentMessages = messages.slice(-50);

            recentMessages.forEach(msg => {
                // Defensive checks
                if (!msg.MetaData) return;

                const mmsi = msg.MetaData.MMSI.toString();
                const existing = shipMap.get(mmsi);

                if (msg.MessageType === 'PositionReport') {
                    const pos = msg.Message?.PositionReport;
                    // Standardize keys (API sends lowercase, we handle both)
                    const lat = msg.MetaData.latitude || msg.MetaData.Latitude;
                    const lng = msg.MetaData.longitude || msg.MetaData.Longitude;

                    // Ensure we have all required data
                    if (pos && lat !== undefined && lng !== undefined) {
                        shipMap.set(mmsi, {
                            ...(existing || {}),
                            mmsi,
                            lat,
                            lng,
                            heading: pos.Heading || 0,
                            sog: pos.Sog || 0,
                            status: (pos.NavigationalStatus as NavStatus) || 15,
                            timestamp: Date.now(),
                            name: existing?.name || msg.MetaData.ShipName || `Unknown ${mmsi}`,
                        } as MergedShip);
                        updated = true;
                    }
                } else if (msg.MessageType === 'ShipStaticData') {
                    const staticData = msg.Message?.ShipStaticData;
                    if (staticData && existing) {
                        shipMap.set(mmsi, {
                            ...existing,
                            name: msg.MetaData.ShipName,
                            type: staticData.Type?.toString(),
                            destination: staticData.Destination,
                            callSign: staticData.CallSign,
                            timestamp: Date.now()
                        });
                        updated = true;
                    }
                }
            });

            return updated ? Array.from(shipMap.values()) : currentShips;
        });

        // Placeholder for latency calc (could be refined)
        setLatency(Math.random() * 50 + 20);

    }, [messages]);

    return {
        ships,
        connectionStatus,
        latency,
        reconnect: () => {
            window.location.reload();
        },
        errorCode
    };
};
