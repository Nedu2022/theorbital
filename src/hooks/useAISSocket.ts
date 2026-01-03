
import { useEffect, useRef, useState, useCallback } from 'react';

// AIS Stream Message Types
export interface AISMessage {
    MessageType: string;
    MetaData: {
        MMSI: number;
        ShipName: string;
        Latitude: number;
        Longitude: number;
        latitude: number; // Correct field name from API
        longitude: number; // Correct field name from API
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
    bbox?: [number, number, number, number]; // [minLat, minLon, maxLat, maxLon]
    enabled?: boolean;
}

export const useAISSocket = ({ bbox, enabled = true }: UseAISSocketProps) => {
    const [messages, setMessages] = useState<AISMessage[]>([]);
    const [status, setStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'error'>('disconnected');
    const [errorCode, setErrorCode] = useState<string | null>(null);
    const socketRef = useRef<WebSocket | null>(null);
    const isConnectingRef = useRef(false);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Create stable key for bbox to prevent referential equality issues
    const bboxKey = JSON.stringify(bbox);

    const connect = useCallback(() => {
        if (!enabled) {
            console.warn('AIS Socket NOT starting - enabled:', enabled);
            return;
        }

        // Prevent duplicate connections
        if (isConnectingRef.current || socketRef.current?.readyState === WebSocket.OPEN) {
            console.log('⏭️ Skipping connection - already connected or connecting');
            return;
        }

        isConnectingRef.current = true;
        setStatus('connecting');

        // Connect to LOCAL proxy server instead of AisStream directly
        // The proxy will handle the API key securely
        const PROXY_URL = process.env.NEXT_PUBLIC_WS_PROXY_URL || 'ws://localhost:3001';

        console.log('🔌 Creating WebSocket connection to proxy:', PROXY_URL);
        const ws = new WebSocket(PROXY_URL);

        ws.onopen = () => {
            console.log('✅ Proxy Connected! Ready state:', ws.readyState);
            isConnectingRef.current = false;
            setStatus('connecting'); // Will be updated when proxy confirms AisStream connection
            setErrorCode(null);

            // Send subscription WITHOUT API key (proxy adds it server-side)
            const subscription = {
                BoundingBoxes: [
                    bbox
                        ? [[bbox[0], bbox[1]], [bbox[2], bbox[3]]]
                        : [[-90, -180], [90, 180]]
                ],
                FilterMessageTypes: ["PositionReport", "StandardClassBPositionReport", "ShipStaticData"]
                // Note: NO APIKey here - proxy adds it securely
            };

            const subMsg = JSON.stringify(subscription);
            console.log('📤 Sending Subscription to proxy:', subMsg);
            ws.send(subMsg);
        };

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);

                // Handle proxy status messages
                if (message.type === 'proxy_status') {
                    console.log('📡 Proxy status:', message.status);
                    if (message.status === 'connected') {
                        setStatus('connected');
                        setErrorCode(null);
                    } else if (message.status === 'connecting') {
                        setStatus('connecting');
                    } else if (message.status === 'disconnected') {
                        setErrorCode(`Proxy disconnected: ${message.code}`);
                        setStatus('disconnected');
                    }
                    return;
                }

                if (message.type === 'proxy_error') {
                    console.error('❌ Proxy error:', message.error);
                    setErrorCode(`Proxy error: ${message.error}`);
                    setStatus('error');
                    return;
                }

                // Check for AisStream error response
                if (message.error) {
                    console.error('❌ AIS Stream Error Response:', message.error);
                    setErrorCode(`API ERROR: ${message.error}`);
                    setStatus('error');
                    return;
                }

                // Process AIS message
                if (message.MessageType) {
                    console.log('📨 Received:', message.MessageType, 'MMSI:', message.MetaData?.MMSI);
                    setMessages(prev => [...prev.slice(-1000), message]);
                }
            } catch (e) {
                console.error('Failed to parse message', e);
            }
        };

        ws.onclose = (event) => {
            console.log('❌ Proxy Connection Closed', event.code, event.reason);
            isConnectingRef.current = false;
            setStatus('disconnected');
            setErrorCode(`CLOSED: ${event.code} ${event.reason || 'No Reason'}`);

            // DO NOT auto-reconnect - let proxy handle connection stability
            // User can manually refresh if needed
        };

        ws.onerror = (error) => {
            console.error('⚠️ Proxy Connection Error', error);
            isConnectingRef.current = false;
            setStatus('error');
            setErrorCode('PROXY CONNECTION ERROR');
        };

        socketRef.current = ws;
    }, [enabled, bboxKey]);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        // Clear any pending debounce
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        // Debounce connection to prevent rapid reconnects from React re-renders
        debounceTimeoutRef.current = setTimeout(() => {
            connect();
        }, 100); // 100ms debounce

        return () => {
            // Clear debounce on unmount
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }

            // Close connection on unmount
            if (socketRef.current) {
                console.log('🧹 Cleaning up WebSocket connection');
                socketRef.current.close();
                socketRef.current = null;
            }
            isConnectingRef.current = false;
        };
    }, [connect, enabled]);

    return {
        messages,
        status,
        errorCode
    };
};
