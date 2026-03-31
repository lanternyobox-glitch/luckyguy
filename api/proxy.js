const ALLOWED_ORIGIN = "https://lanternyobox-glitch.github.io";

function isSafeFields(value) {
  return typeof value === "string" && /^[\w,._]+$/.test(value);
}

function isSafeCursor(value) {
  return typeof value === "string" && value.length > 0 && /^[A-Za-z0-9%._=-]+$/.test(value);
}

function validatePath(path) {
  if (typeof path !== "string" || !path.trim()) {
    return false;
  }

  const [pathname, queryString = ""] = path.split("?");
  const params = new URLSearchParams(queryString);

  if (pathname === "me") {
    if (!isSafeFields(params.get("fields"))) return false;
    for (const key of params.keys()) {
      if (!["fields"].includes(key)) return false;
    }
    return true;
  }

  if (pathname === "me/threads") {
    const fields = params.get("fields");
    const after = params.get("after");

    if (!isSafeFields(fields)) return false;
    if (after && !isSafeCursor(after)) return false;

    for (const key of params.keys()) {
      if (!["fields", "after"].includes(key)) return false;
    }
    return true;
  }

  if (/^\d+$/.test(pathname)) {
    const fields = params.get("fields");
    if (!isSafeFields(fields)) return false;

    for (const key of params.keys()) {
      if (!["fields"].includes(key)) return false;
    }
    return true;
  }

  if (/^\d+\/replies$/.test(pathname)) {
    const fields = params.get("fields");
    const after = params.get("after");

    if (!isSafeFields(fields)) return false;
    if (after && !isSafeCursor(after)) return false;

    for (const key of params.keys()) {
      if (!["fields", "after"].includes(key)) return false;
    }
    return true;
  }

  return false;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
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

    if (!validatePath(path)) {
      return res.status(400).json({ error: "Path not allowed" });
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
