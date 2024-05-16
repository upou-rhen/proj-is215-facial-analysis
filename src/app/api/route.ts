import type { NextApiRequest, NextApiResponse } from "next";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { fromEnv } from "@aws-sdk/credential-providers";



const REGION = "us-east-1";
const s3Client = new S3Client({
  region: REGION,
  credentials: fromEnv(),
});

export async function POST(req: Request, res: NextApiResponse) {
  const formData = await req.formData()
  const file: any = formData.get("file")

  const command = new PutObjectCommand({
    Bucket: "is215-a5-rmcallado",
    Key: file.name,
    Body: URL.createObjectURL(file),
  });

  try {
    const response = await s3Client.send(command);
    console.log(response);
    const result = {
      error: false,
      data: response,
    };

    return Response.json(result);
  } catch (err) {
    console.error(err);
    const result = {
      error: true,
      errorDetails: err,
      data: undefined,
    };

    return Response.json(result);
  }
}

export async function GET(req, res) {
  return Response.json({ text: "Hello" });
}
