export interface Port {
    name: string;
    lat: number;
    lng: number;
    type: "major";
}

export const MAJOR_PORTS: Port[] = [
    { name: "Rotterdam", lat: 51.95, lng: 4.0, type: "major" },
    { name: "Singapore", lat: 1.25, lng: 103.85, type: "major" },
    { name: "Suez Canal", lat: 30.5852, lng: 32.265, type: "major" },
    { name: "Gibraltar", lat: 36.14, lng: -5.35, type: "major" },
    { name: "Shanghai", lat: 31.23, lng: 121.47, type: "major" },
    { name: "Los Angeles", lat: 33.7, lng: -118.25, type: "major" },
    { name: "Panama Canal", lat: 8.95, lng: -79.55, type: "major" },
    { name: "Jebel Ali (Hormuz)", lat: 25.0, lng: 55.05, type: "major" },
    { name: "Dover", lat: 51.12, lng: 1.33, type: "major" },
];
