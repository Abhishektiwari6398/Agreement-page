
let agreements = [];

export default function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === "GET") {
    try {
      res.status(200).json(agreements);
    } catch (error) {
      console.error('GET error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else if (req.method === "POST") {
    try {
      const { name, designation, signature, date } = req.body;

      if (!name || !designation || !signature || !date) {
        return res.status(400).json({ 
          error: "Missing required fields", 
          required: ["name", "designation", "signature", "date"] 
        });
      }

      if (typeof name !== 'string' || typeof designation !== 'string' || 
          typeof signature !== 'string' || typeof date !== 'string') {
        return res.status(400).json({ error: "Invalid data types" });
      }

      const newAgreement = {
        id: Date.now().toString(), 
        name: name.trim(),
        designation: designation.trim(),
        signature: signature.trim(),
        date: date.trim(),
        createdAt: new Date().toISOString()
      };


      agreements = [newAgreement];
      
      res.status(201).json({ 
        message: "Agreement saved successfully",
        agreement: newAgreement
      });
    } catch (error) {
      console.error('POST error:', error);
      res.status(500).json({ 
        error: "Failed to save agreement",
        details: error.message 
      });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
