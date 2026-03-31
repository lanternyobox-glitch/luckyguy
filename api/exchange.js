export default async function handler(req, res) {
  // 允許你的 GitHub Pages 網址跨域呼叫
  res.setHeader("Access-Control-Allow-Origin", "https://lanternyobox-glitch.github.io");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // 瀏覽器 preflight 請求
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { code } = req.body || {};

    if (!code) {
      return res.status(400).json({ error: "Missing code" });
    }

    const client_id = process.env.THREADS_APP_ID;
    const client_secret = process.env.THREADS_APP_SECRET;
    const redirect_uri = "https://lanternyobox-glitch.github.io/luckyguy/callback.html";

    if (!client_id || !client_secret) {
      return res.status(500).json({
        error: "Missing THREADS_APP_ID or THREADS_APP_SECRET in Vercel env"
      });
    }

    const response = await fetch("https://graph.threads.net/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        client_id,
        client_secret,
        grant_type: "authorization_code",
        redirect_uri,
        code
      })
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
