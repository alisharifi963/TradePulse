export default async function handler(req, res) {
  const { url, params } = req.query;

//
    const paramsObj = JSON.parse(params);         
  const fullUrl = `${url}?${new URLSearchParams(paramsObj)}`;
  const response = await fetch(fullUrl, {
    headers: { "0x-api-key": process.env.ZEROX_API_KEY }
  });

//
  
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const queryParams = new URLSearchParams(params);
    const fullUrl = `${url}?${queryParams.toString()}`;
    const response = await fetch(fullUrl, {
      headers: {
        "0x-api-key": process.env.REACT_APP_0X_API_KEY,
        "0x-version": "v2",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
