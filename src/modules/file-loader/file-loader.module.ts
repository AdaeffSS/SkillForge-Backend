import { Module } from '@nestjs/common';
import { FileLoaderService } from './file-loader.service';
import { Logger } from "../logger/logger.service";

@Module({
  imports: [Logger],
  controllers: [],
  providers: [FileLoaderService],
})
export class FileLoaderModule {}
