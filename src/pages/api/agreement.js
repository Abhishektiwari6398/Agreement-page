let agreements = [];

export default function handler(req, res) {
  if (req.method === "GET") {
    res.status(200).json(agreements);
  } else if (req.method === "POST") {
    const { name, designation, signature, date } = req.body;
    if (!name || !designation || !signature || !date) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    agreements = [{ name, designation, signature, date }];
    res.status(201).json({ message: "Agreement saved" });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}