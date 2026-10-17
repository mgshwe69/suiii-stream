
exports.handler = async (event) => {
  const key = process.env.TMDB_API_KEY;

  if (!key) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "TMDB_API_KEY is missing in Netlify settings."
      })
    };
  }

  const path = event.queryStringParameters?.path || "";

  // Allow only safe TMDB API paths used by this website.
  if (
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.includes("..") ||
    !/^\/(trending\/(movie|tv)\/week|(movie|tv)\/(search|[0-9]+)(\/season\/[0-9]+)?)$/.test(path.split("?")[0])
  ) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid TMDB path." })
    };
  }

  const url = new URL("https://api.themoviedb.org/3" + path);
  url.searchParams.set("api_key", key);

  try {
    const response = await fetch(url.toString());
    const body = await response.text();

    return {
      statusCode: response.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      },
      body
    };
  } catch {
    return {
      statusCode: 502,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Could not connect to TMDB." })
    };
  }
};
