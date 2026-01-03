// Next.js API Route for proxying WebSocket connections to AisStream
// This bypasses browser origin restrictions
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const upgradeHeader = request.headers.get('upgrade');

    if (upgradeHeader !== 'websocket') {
        return new Response('Expected WebSocket', { status: 426 });
    }

    // For WebSocket upgrades in Next.js App Router, we need to use a different approach
    // However, Next.js doesn't natively support WebSocket upgrades in App Router
    // We'll need to create a custom server or use a different approach

    return new Response('WebSocket upgrade not supported in this configuration', {
        status: 501,
        headers: {
            'Content-Type': 'text/plain'
        }
    });
}
