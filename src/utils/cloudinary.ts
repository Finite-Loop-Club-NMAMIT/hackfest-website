import { v2 as cloudinary } from "cloudinary";
import type { File as formidableFile } from "formidable";
import { env } from "~/env";

const cloudinaryConfig = cloudinary.config({
  cloud_name: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
  secure: true,
});

async function getSignature() {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder: "next",
    },
    cloudinaryConfig.api_secret!,
  );
  return { timestamp, signature };
}

const uploadImage = async (file: formidableFile, upload_preset: string) => {
  if (
    !file.mimetype ||
    !["image/png", "image/jpeg", "image/bmp", "application/pdf"].includes(
      file.mimetype,
    )
  )
    throw "Invalid file format use png,jpeg,bmp";

  const p = await cloudinary.uploader
    .upload(file.filepath, { upload_preset: upload_preset })
    .catch((err) => {
      throw err;
    });
  return p.secure_url + ";" + p.public_id;
};

const uploadPdf = async (file: formidableFile, upload_preset: string) => {
  if (
    !file.mimetype ||
    !["image/png", "image/jpeg", "image/bmp", "application/pdf"].includes(
      file.mimetype,
    )
  )
    throw "Invalid file format use png,jpeg,bmp";

  const p = await cloudinary.uploader
    .upload(file.filepath, { upload_preset: upload_preset, resource_type: "raw" })
    .catch((err) => {
      throw err;
    });
  return p.secure_url + ";" + p.public_id;
};

// async function uploadFile(params: { file: File; folder: "ids" | "ppts" }) {
//   const { signature, timestamp } = await getSignature();
//   const formData = new FormData();
//   formData.append("file", params.file);
//   formData.append("api_key", env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
//   formData.append("signature", signature);
//   formData.append("timestamp", timestamp.toString());
//   //todo: fix upload folder issue (cannot upload to folder other than next)
//   formData.append("folder", "next");
//   console.log(signature, timestamp);
//   console.log(params.file);

//   const endpoint = `https://api.cloudinary.com/v1_1/${env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;

//   try {
//     const res = await fetch(endpoint, {
//       method: "POST",
//       body: formData,
//     });
//     const data = (await res.json()) as {
//       url: string;
//       public_id: string;
//     };
//     //Return url and public id of uploaded file separated by
//     return data.url + ";" + data.public_id;
//   } catch (e) {
//     console.log(e);
//     throw e;
//   }
// }

async function deleteFile(pid: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await cloudinary.uploader.destroy(pid);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export { cloudinaryConfig, getSignature, uploadImage, deleteFile, uploadPdf };
