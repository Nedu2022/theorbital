import { useState, useEffect } from "react";

interface UserLocation {
    lat: number;
    lng: number;
    error?: string;
}

export const useUserLocation = () => {
    const [location, setLocation] = useState<UserLocation | null>(null);
    const [loading, setLoading] = useState(false);

    const requestLocation = () => {
        if (!navigator.geolocation) {
            setLocation({ lat: 0, lng: 0, error: "Geolocation not supported" });
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setLoading(false);
            },
            (error) => {
                // Fallback to default (Rotterdam) if denied
                setLocation({ lat: 51.9, lng: 4.5, error: error.message });
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    // Create a bounding box around the user's location (approx 100km radius)
    const getBbox = (): [number, number, number, number] | undefined => {
        if (!location) return undefined;
        const offset = 1; // ~100km in degrees
        return [
            location.lat - offset,
            location.lng - offset,
            location.lat + offset,
            location.lng + offset,
        ];
    };

    return { location, loading, requestLocation, getBbox };
};
