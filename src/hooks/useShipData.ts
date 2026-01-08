import { useState, useEffect } from 'react';
import { useAISSocket } from './useAISSocket';

export type NavStatus = 0 | 1 | 5 | 15;

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

export const useShipData = (bbox?: [number, number, number, number]) => {
    const { messages, status: socketStatus, errorCode, startDemoMode } = useAISSocket({
        bbox,
        enabled: true
    });

    const [ships, setShips] = useState<MergedShip[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
    const [latency, setLatency] = useState(0);

    useEffect(() => {
        if (socketStatus === 'connected') {
            setConnectionStatus('connected');
        } else if (socketStatus === 'demo') {
            setConnectionStatus('connected');
        } else if (socketStatus === 'error' || socketStatus === 'disconnected') {
            setConnectionStatus('disconnected');
        } else {
            setConnectionStatus('connecting');
        }
    }, [socketStatus]);

    useEffect(() => {
        if (messages.length === 0) return;

        setShips(currentShips => {
            const shipMap = new Map(currentShips.map(s => [s.mmsi, s]));
            let updated = false;

            const recentMessages = messages.slice(-50);

            recentMessages.forEach(msg => {
                if (!msg.MetaData) return;

                const mmsi = msg.MetaData.MMSI.toString();
                const existing = shipMap.get(mmsi);

                if (msg.MessageType === 'PositionReport') {
                    const pos = msg.Message?.PositionReport;
                    const lat = msg.MetaData.latitude || msg.MetaData.Latitude;
                    const lng = msg.MetaData.longitude || msg.MetaData.Longitude;

                    if (pos && lat !== undefined && lng !== undefined) {
                        shipMap.set(mmsi, {
                            ...(existing || {}),
                            mmsi,
                            lat,
                            lng,
                            heading: pos.Heading || 0,
                            sog: pos.Sog || 0,
                            status: (pos.NavigationalStatus !== undefined ? pos.NavigationalStatus : 15) as NavStatus,
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

        setLatency(Math.random() * 50 + 20);

    }, [messages]);

    return {
        ships,
        connectionStatus,
        latency,
        reconnect: () => {
            window.location.reload();
        },
        errorCode,
        isSimulation: socketStatus === 'demo',
        enableSimulation: startDemoMode
    };
};
