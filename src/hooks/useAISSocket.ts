import { useEffect, useRef, useState, useCallback } from 'react';
import { getDemoFleet, generateDemoMessage } from '@/utils/demoData';

export interface AISMessage {
    MessageType: string;
    MetaData: {
        MMSI: number;
        ShipName: string;
        Latitude: number;
        Longitude: number;
        latitude: number;
        longitude: number;
        time_utc: string;
    };
    Message: {
        PositionReport?: {
            Cog: number;
            Sog: number;
            RateOfTurn: number;
            NavigationalStatus: number;
            Heading: number;
        };
        ShipStaticData?: {
            CallSign: string;
            Destination: string;
            Eta: {
                Month: number;
                Day: number;
                Hour: number;
                Minute: number;
            };
            Type: number;
        };
    };
}

interface UseAISSocketProps {
    bbox?: [number, number, number, number];
    enabled?: boolean;
}

export const useAISSocket = ({ bbox, enabled = true }: UseAISSocketProps) => {
    const [messages, setMessages] = useState<AISMessage[]>([]);
    const [status, setStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'error' | 'demo'>('disconnected');
    const [errorCode, setErrorCode] = useState<string | null>(null);
    const socketRef = useRef<WebSocket | null>(null);
    const isConnectingRef = useRef(false);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const demoIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const bboxKey = JSON.stringify(bbox);

    // Demo Mode Generator
    const startDemoMode = useCallback(() => {
        console.log("⚠️ Connection failed. Switching to SIMULATION MODE.");
        setStatus('demo');
        setErrorCode(null);

        // Clear existing interval if any
        if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);

        // Initial burst of ships
        const initialFleet = getDemoFleet(30);
        setMessages(initialFleet);

        // Simulate updates every 2 seconds
        let tick = 0;
        demoIntervalRef.current = setInterval(() => {
            tick++;
            // Update a few ships each tick to simulate movement
            const updates = initialFleet.map((msg, i) => {
                // Determine if we should update this ship this tick
                if (i % 3 === tick % 3) {
                    // Drifting movement
                    const lat = msg.MetaData.Latitude + (Math.random() - 0.5) * 0.001;
                    const lng = msg.MetaData.Longitude + (Math.random() - 0.5) * 0.001;

                    // Update the message object (basic mutation for efficiency in demo)
                    msg.MetaData.Latitude = lat;
                    msg.MetaData.Longitude = lng;
                    msg.MetaData.latitude = lat;
                    msg.MetaData.longitude = lng;
                    msg.Message.PositionReport!.Sog = Math.random() * 15;
                    msg.Message.PositionReport!.Heading = (msg.Message.PositionReport!.Heading + (Math.random() - 0.5) * 10) % 360;

                    // Return a fresh object reference for React state
                    return { ...msg, MetaData: { ...msg.MetaData } };
                }
                return null;
            }).filter(Boolean) as AISMessage[];

            if (updates.length > 0) {
                setMessages(prev => [...prev.slice(-500), ...updates]);
            }
        }, 2000);

    }, []);

    const connect = useCallback(() => {
        if (!enabled) return;

        // Cleanup demo mode if we are trying to reconnect real socket
        if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);

        if (isConnectingRef.current || socketRef.current?.readyState === WebSocket.OPEN) return;

        isConnectingRef.current = true;
        setStatus('connecting');

        // PRODUCTION: DO NOT AUTO CONNECT TO LOCALHOST
        // We only connect if process.env.NEXT_PUBLIC_FORCE_LIVE is set.
        // Otherwise, we wait for user to trigger demo mode or just stay offline.
        const isProduction = typeof window !== 'undefined' && window.location.hostname.includes('web.app');
        if (isProduction && !process.env.NEXT_PUBLIC_FORCE_LIVE) {
            console.log("Production environment detected. Not connecting to localhost proxy.");
            isConnectingRef.current = false;
            setStatus('disconnected');
            // We do NOT auto-start demo mode anymore. User must opt-in.
            return;
        }

        const PROXY_URL = process.env.NEXT_PUBLIC_WS_PROXY_URL || 'ws://localhost:3001';
        console.log('Creating WebSocket connection to proxy:', PROXY_URL);

        try {
            const ws = new WebSocket(PROXY_URL);

            // Connection Timeout handler
            const timeoutId = setTimeout(() => {
                if (ws.readyState !== WebSocket.OPEN) {
                    console.warn("WebSocket connection timed out.");
                    ws.close();
                    setStatus('disconnected'); // Just disconnect, don't force demo
                }
            }, 3000);

            ws.onopen = () => {
                clearTimeout(timeoutId);
                console.log('Proxy Connected!');
                isConnectingRef.current = false;
                setStatus('connected');
                setErrorCode(null);

                const subscription = {
                    BoundingBoxes: [
                        bbox
                            ? [[bbox[0], bbox[1]], [bbox[2], bbox[3]]]
                            : [[-90, -180], [90, 180]]
                    ],
                    FilterMessageTypes: ["PositionReport", "StandardClassBPositionReport", "ShipStaticData"]
                };
                ws.send(JSON.stringify(subscription));
            };

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    if (message.MessageType) {
                        setMessages(prev => [...prev.slice(-1000), message]);
                    }
                } catch (e) {
                    console.error('Failed to parse message', e);
                }
            };

            ws.onclose = (event) => {
                clearTimeout(timeoutId);
                console.log('Proxy Connection Closed', event.code);
                isConnectingRef.current = false;
                setStatus('disconnected');
            };

            ws.onerror = (error) => {
                console.error('Proxy Connection Error');
                isConnectingRef.current = false;
                setStatus('disconnected');
            };

            socketRef.current = ws;

        } catch (err) {
            console.error("Immediate socket error", err);
            setStatus('disconnected');
        }
    }, [enabled, bboxKey]); // Removed startDemoMode dependency


    useEffect(() => {
        if (!enabled) return;
        if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = setTimeout(connect, 100);

        return () => {
            if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
            if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
            isConnectingRef.current = false;
        };
    }, [connect, enabled]);

    return {
        messages,
        status,
        errorCode,
        startDemoMode // Exposed for manual trigger
    };
};
