import formidable from "formidable";
import { v2 as cloudinary } from "cloudinary";


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }


  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error("Cloudinary configuration missing");
    return res.status(500).json({ 
      error: "Server configuration error",
      details: "Cloudinary credentials not configured"
    });
  }

  const form = formidable({ 
    multiples: false, 
    maxFileSize: 5 * 1024 * 1024, 
    keepExtensions: true,
    allowEmptyFiles: false
  });

  try {
    const { files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error("Form parsing error:", err);
          reject(err);
        } else {
          resolve({ fields, files });
        }
      });
    });

  
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }


    if (file.mimetype !== "image/png") {
      return res.status(400).json({ 
        error: "Invalid file type", 
        details: "Please upload a valid PNG image",
        received: file.mimetype
      });
    }

    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ 
        error: "File too large", 
        details: "Maximum file size is 5MB" 
      });
    }

    console.log("Uploading file:", {
      name: file.originalFilename,
      size: file.size,
      type: file.mimetype
    });

    const uploadOptions = {
      resource_type: "image",
      folder: "signatures", 
      public_id: `signature_${Date.now()}`, 
      overwrite: true,
      invalidate: true,
    };

  
    if (process.env.CLOUDINARY_UPLOAD_PRESET) {
      uploadOptions.upload_preset = process.env.CLOUDINARY_UPLOAD_PRESET;
    }

    const result = await cloudinary.uploader.upload(file.filepath, uploadOptions);

    console.log("Cloudinary upload successful:", {
      public_id: result.public_id,
      secure_url: result.secure_url
    });

    res.status(200).json({ 
      url: result.secure_url,
      public_id: result.public_id,
      message: "File uploaded successfully"
    });

  } catch (error) {
    console.error("Upload error:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
      cloudinaryError: error.http_code ? {
        http_code: error.http_code,
        cloudinaryMessage: error.message,
      } : null,
    });


    if (error.http_code) {

      res.status(500).json({ 
        error: "Cloudinary upload failed", 
        details: error.message,
        http_code: error.http_code
      });
    } else {
    
      res.status(500).json({ 
        error: "Failed to upload file", 
        details: error.message 
      });
    }
  }
}

export const config = {
  api: {
    bodyParser: false, 
  },
};
