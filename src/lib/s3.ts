import { PutObjectCommand, GetObjectCommand, S3 } from "@aws-sdk/client-s3";

export async function uploadToS3(
  file: File
): Promise<{ file_key: string; file_name: string; file_url: string }> {
  try {
    const s3 = new S3({
      region: "us-east-1",
      credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
      },
    });

    const fileBuffer = Buffer.from(await file.arrayBuffer()); // Convert File to Buffer
    const file_key = `uploads/${Date.now().toString()}-${file.name.replace(/\s/g, "-")}`;

    const params = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: file_key,
      Body: fileBuffer,
      ContentType: file.type,
      // If you want public read access, uncomment the next line:
      // ACL: 'public-read',
    };

    await s3.send(new PutObjectCommand(params));

    const fileUrl = getS3Url(file_key);

    return { file_key, file_name: file.name, file_url: fileUrl };
  } catch (error) {
    console.error("S3 Upload Error:", error);
    throw error;
  }
}

// Function to get the file URL from S3
export function getS3Url(file_key: string): string {
  return `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.amazonaws.com/${file_key}`;
}
