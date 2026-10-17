exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  const rawPath = params.path || "";
  const path = rawPath.split("?")[0];

  // Allowed TMDB endpoints
  const allowed =
    /^\/trending\/(movie|tv)\/week$/.test(path) ||
    /^\/search\/(movie|tv)$/.test(path) ||
    /^\/movie\/[0-9]+$/.test(path) ||
    /^\/tv\/[0-9]+$/.test(path) ||
    /^\/tv\/[0-9]+\/season\/[0-9]+$/.test(path);

  if (!allowed) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid TMDB path" })
    };
  }

  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "TMDB_API_KEY is missing in Netlify"
      })
    };
  }

  const url = new URL("https://api.themoviedb.org/3" + path);

  // Forward query parameters
  for (const [key, value] of Object.entries(params)) {
    if (key !== "path") {
      url.searchParams.set(key, value);
    }
  }

  url.searchParams.set("api_key", apiKey);

  try {
    const response = await fetch(url.toString());
    const text = await response.text();

    return {
      statusCode: response.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public,max-age=60"
      },
      body: text
    };
  } catch {
    return {
      statusCode: 502,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        error: "TMDB connection failed"
      })
    };
  }
};
