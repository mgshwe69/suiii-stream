
exports.handler = async (event) => {
  const path = event.queryStringParameters?.path;

  if (!path || !path.startsWith("/")) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing API path" })
    };
  }

  // Allow only TMDB movie and TV endpoints used by the website.
  const allowed = /^\/(trending\/(movie|tv)\/week|(movie|tv)\/(search|[0-9]+)(\/season\/[0-9]+)?)$/;

  if (!allowed.test(path.split("?")[0])) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid API path" })
    };
  }

  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "TMDB_API_KEY is missing in Netlify" })
    };
  }

  const url = new URL("https://api.themoviedb.org/3" + path);

  // Forward additional query parameters, such as search queries.
  for (const [key, value] of Object.entries(event.queryStringParameters || {})) {
    if (key !== "path") url.searchParams.set(key, value);
  }

  url.searchParams.set("api_key", apiKey);

  try {
    const response = await fetch(url.toString());
    const data = await response.text();

    return {
      statusCode: response.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60"
      },
      body: data
    };
  } catch {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: "TMDB connection failed" })
    };
  }
};
