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


    return new Response('WebSocket upgrade not supported in this configuration', {
        status: 501,
        headers: {
            'Content-Type': 'text/plain'
        }
    });
}
