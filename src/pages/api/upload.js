import formidable from "formidable";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({ multiples: false, maxFileSize: 5 * 1024 * 1024 });

  try {
    const { files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    const file = files.file?.[0];
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    if (file.mimetype !== "image/png") {
      return res.status(400).json({ error: "Please upload a valid PNG image" });
    }

    const result = await cloudinary.uploader.upload(file.filepath, {
     upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
      resource_type: "image",
    });

    res.status(200).json({ url: result.secure_url });
  } catch (error) {
    console.error("Cloudinary upload error:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
      cloudinaryError: error.http_code ? {
        http_code: error.http_code,
        cloudinaryMessage: error.message,
      } : null,
    });
    res.status(500).json({ error: "Failed to upload file", details: error.message });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};