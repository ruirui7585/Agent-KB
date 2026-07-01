export function send(reply, data, status = 200) {
  return reply.status(status).send(data);
}

export function sendError(reply, status, message) {
  return reply.status(status).send({ error: message });
}

export function ok(reply, data = {}) {
  return send(reply, data, 200);
}
