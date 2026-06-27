import { v2 as cloudinary } from "cloudinary";

// Reads CLOUDINARY_URL env var automatically:
// CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
cloudinary.config({ secure: true });

export default cloudinary;
