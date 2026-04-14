import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

const R2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.R2_PUBLIC_URL!;

export async function uploadToR2(
  file: Buffer,
  fileName: string,
  contentType: string,
  folder: string = "resources"
): Promise<{ url: string; key: string }> {
  const ext = fileName.split(".").pop();
  const key = `${folder}/${uuidv4()}.${ext}`;

  await R2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: file,
      ContentType: contentType,
    })
  );

  const url = `${PUBLIC_URL}/${key}`;
  return { url, key };
}

export async function deleteFromR2(key: string): Promise<void> {
  await R2.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
}

export async function getPresignedDownloadUrl(
  key: string,
  fileName: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${fileName}"`,
  });

  return getSignedUrl(R2, command, { expiresIn });
}

export function getPublicUrl(key: string): string {
  return `${PUBLIC_URL}/${key}`;
}

export function getPublicFileUrl(fileUrl: string): string {
  if (!fileUrl) return fileUrl;
  
  try {
    // If it's already using the public URL, return as is
    if (fileUrl.startsWith(PUBLIC_URL)) return fileUrl;

    const url = new URL(fileUrl);
    const pathname = url.pathname;
    
    // Remove bucket name from path if present (common in R2 S3-style URLs)
    let fileKey = pathname.startsWith(`/${BUCKET}/`) 
      ? pathname.replace(`/${BUCKET}/`, "")
      : pathname.replace(/^\//, "");
    
    return `${PUBLIC_URL}/${fileKey}`;
  } catch {
    return fileUrl;
  }
}

export async function getObjectBuffer(
  key: string
): Promise<{ buffer: Uint8Array; contentType: string }> {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  const response = await R2.send(command);
  const buffer = await response.Body!.transformToByteArray();
  return { buffer, contentType: response.ContentType || "application/octet-stream" };
}

export async function getPresignedViewUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ResponseContentType: contentType,
  });
  return getSignedUrl(R2, command, { expiresIn });
}
