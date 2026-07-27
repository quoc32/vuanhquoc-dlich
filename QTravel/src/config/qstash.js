const { Client } = require("@upstash/qstash");

const qstashToken = process.env.QSTASH_TOKEN;
const qstashUrl = process.env.QSTASH_URL || "https://qstash.upstash.io";

let qstashClient = null;

if (qstashToken) {
  qstashClient = new Client({
    baseUrl: qstashUrl,
    token: qstashToken,
  });
}

module.exports = qstashClient;
