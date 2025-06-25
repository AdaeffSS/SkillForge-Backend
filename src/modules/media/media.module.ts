import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { S3Module } from "modules/s3/s3.module";
import { S3Service } from "modules/s3/s3.service";

@Module({
  imports: [S3Module],
  controllers: [MediaController],
  providers: [MediaService, S3Module],
})
export class MediaModule {}
