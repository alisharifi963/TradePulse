export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { address } = req.body;
    const SHEETDB_API_KEY = process.env.SHEETDB_API_KEY; // کلید از Vercel میاد
    try {
      const response = await fetch(`https://sheetdb.io/api/v1/${SHEETDB_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: [{ Address: address, Timestamp: new Date().toISOString() }] }),
      });
      if (response.ok) {
        res.status(200).json({ message: 'آدرس ذخیره شد' });
      } else {
        res.status(500).json({ message: 'خطا در ذخیره‌سازی' });
      }
    } catch (error) {
      res.status(500).json({ message: 'خطا در سرور' });
    }
  } else {
    res.status(405).json({ message: 'فقط POST مجاز است' });
  }
}
