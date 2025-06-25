import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Delete, Res
} from "@nestjs/common";
import { Response } from "express";
import { S3Service } from './s3.service';
import { UploadDto } from './dto/upload.dto';
import { MediaService } from "../media/media.service";

@Controller('media')
export class UploadController {
  constructor(
    private readonly s3: S3Service,
  ) {}

  @Post()
  async uploadTextFile(@Body() dto: UploadDto): Promise<{ message: string }> {
    await this.s3.upload(dto.filename, dto.content);
    return { message: `Файл '${dto.filename}' успешно загружен` };
  }

  // @Get('download')
  // async downloadFile(@Query('filename') filename: string): Promise<string> {
  //   const stream = await this.s3.download(filename);
  //   const chunks: Uint8Array[] = [];
  //   for await (const chunk of stream) {
  //     chunks.push(chunk);
  //   }
  //   return Buffer.concat(chunks).toString('utf-8');
  // }

  @Delete('delete')
  async deleteFile(@Query('filename') filename: string): Promise<{ message: string }> {
    await this.s3.delete(filename);
    return { message: `Файл '${filename}' удалён` };
  }

  @Get('signed-url')
  async getSignedUrl(
    @Query('filename') filename: string,
    @Query('expiresIn') expiresIn = '3600'
  ): Promise<{ url: string }> {
    const url = await this.s3.getSignedUrl(filename, parseInt(expiresIn, 10));
    return { url };
  }
}
