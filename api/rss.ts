// Vercel Serverless Function
export default async function handler(req, res) {
  try {
    const response = await fetch(process.env.RSS_URL);
    const data = await response.text();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/xml");
    res.status(200).send(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch RSS" });
  }
}
