export default async function handler(req, res) {
  const { chainId, sellToken, buyToken, sellAmount, takerAddress } = req.query;

  const url = `https://api.0x.org/swap/v1/quote?${new URLSearchParams({
    sellToken,
    buyToken,
    sellAmount,
    takerAddress,
  }).toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        '0x-api-key': process.env.REACT_APP_0X_API_KEY || '', // اگر کلید داری
      },
    });

    const data = await response.json();
    res.setHeader("Access-Control-Allow-Origin", "*"); // اگر به بیرون می‌خوای اجازه بدی
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy error', message: error.message });
  }
}
