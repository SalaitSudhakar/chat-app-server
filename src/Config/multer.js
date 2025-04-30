import cloudinary from "./cloudinary.js";
import multer from "multer";
import { cloudinaryStorage } from "multer-storage-cloudinary";

const upload = (folderName) => {
  const storage = new cloudinaryStorage({
    cloudinary,
    params: {
      folder: folderName,
      allowed_formats: ["jpg", "png", "jpeg"],
    },
  });

  return multer({ storage });
};

export default upload;
