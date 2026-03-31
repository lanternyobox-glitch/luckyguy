export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://lanternyobox-glitch.github.io");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { path, token } = req.body || {};

    if (!path) {
      return res.status(400).json({ error: "Missing path" });
    }

    if (!token) {
      return res.status(400).json({ error: "Missing token" });
    }

    const url = `https://graph.threads.net/v1.0/${path}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      error: err.message || "Unknown server error"
    });
  }
}
