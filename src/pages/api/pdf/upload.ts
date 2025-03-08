import type { NextApiRequest, NextApiResponse } from "next";
import { uploadPdf } from "../../../utils/cloudinary";
import { decodeForm } from "../../../utils/form";
import { getServerSession } from "next-auth";
import { authOptions } from "~/server/auth";
import { db } from "~/server/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    console.log("uploadPdf");
    const session = await getServerSession(req, res, authOptions);
    if (session?.user === undefined) throw "User not logged in";

    const user = await db?.user.findFirst({ where: { id: session.user.id } });
    if (!user) throw "User invalid";

    const { files } = await decodeForm(req);

    if (files?.[0] === undefined) throw "No file uploaded";

    const result = await uploadPdf(files[0], "ID_unsignedUpload");
    if (!result) res.status(500).send("Server Error");

    res.status(200).send({ secure_url: result });
  } catch (err) {
    res.status(400).send(err);
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
