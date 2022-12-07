import multer from "multer";
import { v2 } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import config from "../config";

v2.config({
  cloud_name: config.CLOUD_NAME,
  api_key: config.API_KEY,
  api_secret: config.API_SECRET
});
const storage = new CloudinaryStorage({
  cloudinary: v2,
  folder: "uploads",
  allowedFormats: ["jpg", "png", "jpeg", "gif"],
  quality_analysis: true,
  transformation: [{
    width: "315", crop: "fill", gravity: "faces", radius: 50, effect: "saturation:50", height: "250"
  }]
});
const parser = multer({ storage });

export default parser;
