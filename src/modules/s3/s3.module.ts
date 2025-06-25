import { Module } from '@nestjs/common';
import { UploadController } from './s3.controller';
import { S3Service } from './s3.service';

@Module({
  controllers: [UploadController],
  providers: [S3Service],
  exports: [S3Service],
})
export class S3Module {}
