export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { address } = req.body;
    const SHEETDB_API = process.env.SHEETDB_API;
    try {
      const response = await fetch(`https://sheetdb.io/api/v1/${SHEETDB_API}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: [{ address, timestamp: new Date().toISOString() }] }),
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
