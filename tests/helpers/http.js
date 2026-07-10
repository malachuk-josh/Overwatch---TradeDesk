let requestSequence = 0;

export function request({ method = "POST", body, query = {}, headers = {} } = {}) {
  requestSequence += 1;
  return {
    method,
    body,
    query,
    headers: Object.fromEntries(Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value])),
    socket: { remoteAddress: `127.0.0.${requestSequence}` },
  };
}

export function response() {
  const headers = new Map();
  return {
    statusCode: 200,
    body: "",
    ended: false,
    setHeader(name, value) {
      headers.set(String(name).toLowerCase(), value);
    },
    getHeader(name) {
      return headers.get(String(name).toLowerCase());
    },
    end(value = "") {
      this.body = Buffer.isBuffer(value) ? value.toString("utf8") : String(value);
      this.ended = true;
      return this;
    },
  };
}

export function jsonBody(res) {
  return JSON.parse(res.body);
}
