import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log(
  process.env.CLOUDINARY_CLOUD_NAME,
  process.env.CLOUDINARY_API_KEY,
  process.env.CLOUDINARY_API_SECRET,
);

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // console.log(localFilePath, "from cloudnarry");
    // Upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    // file has been uploaded successfull
    return response;
  } catch (error) {
    // console.error("Cloudinary file Upload Error:", error);
    throw new Error("Cloudinary file Upload Error:", error);
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath); // remmove the file from local storage if upload fails
    }

    return null;
  }
};

// const deleteFromCloudinary = async (oldImage) => {
//   try {
//     if (!oldImage) {
//       return 
//     }
//   } catch (error) {}
// };

export default uploadOnCloudinary;
