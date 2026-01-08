import { AISMessage } from "@/hooks/useAISSocket";

const SHIPS = [
    { name: "EVER GIVEN", type: 70, destination: "ROTTERDAM", country: "NL" },
    { name: "HMM ALGECIRAS", type: 70, destination: "HAMBURG", country: "DE" },
    { name: "CMA CGM ANTOINE", type: 70, destination: "LE HAVRE", country: "FR" },
    { name: "MSC GULSUN", type: 70, destination: "FELIXSTOWE", country: "GB" },
    { name: "OOCL HONG KONG", type: 70, destination: "SHANGHAI", country: "CN" },
    { name: "COSCO SHIPPING", type: 70, destination: "ANTWERP", country: "BE" },
    { name: "MAERSK MADRID", type: 70, destination: "SINGAPORE", country: "SG" },
    { name: "HAPAG LLOYD", type: 70, destination: "NEW YORK", country: "US" },
    { name: "ONE APUS", type: 70, destination: "TOKYO", country: "JP" },
    { name: "ZIM KINGSTON", type: 70, destination: "VANCOUVER", country: "CA" },
];

const STARTING_LOCATIONS = [
    { lat: 51.95, lng: 4.0 }, // Rotterdam
    { lat: 1.25, lng: 103.85 }, // Singapore
    { lat: 30.58, lng: 32.26 }, // Suez
    { lat: 33.7, lng: -118.25 }, // LA
    { lat: 8.95, lng: -79.55 }, // Panama
];

export const generateDemoMessage = (index: number): AISMessage => {
    const ship = SHIPS[index % SHIPS.length];
    const start = STARTING_LOCATIONS[index % STARTING_LOCATIONS.length];

    // Add some random offsets to disperse them
    const lat = start.lat + (Math.random() - 0.5) * 2;
    const lng = start.lng + (Math.random() - 0.5) * 2;
    const mmsi = 200000000 + index; // Fake MMSI

    return {
        MessageType: "PositionReport",
        MetaData: {
            MMSI: mmsi,
            ShipName: ship.name,
            Latitude: lat,
            Longitude: lng,
            latitude: lat,
            longitude: lng,
            time_utc: new Date().toISOString(),
        },
        Message: {
            PositionReport: {
                Cog: Math.random() * 360,
                Sog: Math.random() * 20,
                RateOfTurn: 0,
                NavigationalStatus: Math.random() > 0.5 ? 0 : 1, // Moving or Anchor
                Heading: Math.random() * 360,
            },
            ShipStaticData: {
                CallSign: "DEMO" + index,
                Destination: ship.destination,
                Eta: { Month: 1, Day: 1, Hour: 12, Minute: 0 },
                Type: ship.type,
            },
        },
    };
};

export const getDemoFleet = (count: number = 20): AISMessage[] => {
    return Array.from({ length: count }).map((_, i) => generateDemoMessage(i));
};
