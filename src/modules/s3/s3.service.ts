import {
  DeleteObjectCommand, GetObjectCommand,
  PutObjectCommand,
  S3Client
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Injectable } from "@nestjs/common";
import * as process from "node:process";

@Injectable()
export class S3Service {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor() {
    this.bucket = process.env.YA_BUCKET!;
    this.client = new S3Client({
      region: "ru-central1",
      endpoint: "https://storage.yandexcloud.net",
      credentials: {
        accessKeyId: process.env.YA_KEY_ID!,
        secretAccessKey: process.env.YA_KEY!,
      },
    });
  }

  async upload(key: string, body: Buffer | string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
      }),
    );
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  async getSignedUrl(key: string, expiresInSec: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    })
    return getSignedUrl(this.client, command, { expiresIn: expiresInSec });
  }

  async download(key: string): Promise<NodeJS.ReadableStream> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    })

    const response = await this.client.send(command)
    if (!response.Body || typeof response.Body === "string") {
      throw new Error('Не удалось получить ответа от S3')
    }
    return response.Body as NodeJS.ReadableStream;
  }
}
