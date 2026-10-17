exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  const rawPath = params.path || "";

  if (!rawPath) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Missing path parameter" })
    };
  }

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "TMDB_API_KEY is missing in Netlify environment variables" })
    };
  }

  // TMDB API Request URL Construction
  const url = new URL("https://api.themoviedb.org/3" + rawPath);

  // Forward all search and filter query parameters
  for (const [key, value] of Object.entries(params)) {
    if (key !== "path") {
      url.searchParams.set(key, value);
    }
  }
  url.searchParams.set("api_key", apiKey);

  try {
    const response = await fetch(url.toString());
    const data = await response.json();

    return {
      statusCode: response.status,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "TMDB API Connection failed: " + err.message })
    };
  }
};
