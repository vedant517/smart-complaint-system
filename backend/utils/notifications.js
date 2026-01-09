const clients = new Set();

export function addSseClient(req, res) {
  res.writeHead(200, {
    Connection: 'keep-alive',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache'
  });
  res.write('\n');
  const client = res;
  clients.add(client);
  req.on('close', () => {
    clients.delete(client);
  });
}

export function broadcastEvent(event, payload) {
  const data = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const c of clients) {
    try { c.write(data); } catch (e) { /* ignore */ }
  }
}

export default { addSseClient, broadcastEvent };
