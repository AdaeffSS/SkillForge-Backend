import { Injectable } from "@nestjs/common";
import { S3Service } from "modules/s3/s3.service";
import * as path from "node:path";

@Injectable()
export class MediaService {
  constructor(private readonly s3: S3Service) {}

  async getSignedPlaylist(m3u8Key: string): Promise<any> {
    const stream = await this.s3.download(m3u8Key);
    const content = await this.streamToString(stream);

    const basePath = path.posix.dirname(m3u8Key)
    const lines = content.split("\n");
    const signedLines = await Promise.all(
      lines.map(async (line) => {
        if (line.trim().endsWith(".ts")) {
          const segmentKey = path.posix.join(basePath, line.trim());
          return await this.s3.getSignedUrl(segmentKey, 30);
        }
        return line;
      }),
    );

    return signedLines.join("\n");
  }

  private async streamToString(stream: NodeJS.ReadableStream): Promise<string> {
    const chunks: Buffer[] = []
    for await (const chunk of stream) {
      chunks.push(chunk as Buffer);
    }
    return Buffer.concat(chunks).toString('utf-8');
  }
}
