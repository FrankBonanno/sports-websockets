import { WebSocket, WebSocketServer } from 'ws';
import { wsArcjet } from '../config/arcjet.js';

function sendJson(socket, payload) {
  if (socket.readyState !== WebSocket.OPEN) return;

  socket.send(JSON.stringify(payload));
}

function broadcast(wss, payload) {
  for (const client of wss.clients) {
    if (client.readyState !== WebSocket.OPEN) continue;

    client.send(JSON.stringify(payload));
  }
}

const ONE_MB = 1024 * 1024;
// const TEN_MB = 10 * ONE_MB;
// const FIFTY_MB = 5 * TEN_MB;

export function attachWebSocketServer(server) {
  const wss = new WebSocketServer({
    server,
    path: '/ws',
    maxPayload: ONE_MB,
  });

  wss.on('connection', async (socket, req) => {
    if (wsArcjet) {
      try {
        const decision = await wsArcjet.protect(req);

        if (decision.isDenied()) {
          const code = decision.reason.isRateLimit() ? 1013 : 1008;
          const reason = decision.reason.isRateLimit() ? 'Rate Limit Exceeded' : 'Access Denied';

          socket.close(code, reason);
          return;
        }
      } catch (e) {
        console.error('WS connection error', e);
        socket.close(1011, 'Server Security Error');
        return;
      }
    }

    sendJson(socket, {
      type: 'welcome',
    });

    socket.on('error', console.error);
  });

  function broadcastMatchCreated(match) {
    broadcast(wss, { type: 'match_created', data: match });
  }

  return { broadcastMatchCreated };
}
