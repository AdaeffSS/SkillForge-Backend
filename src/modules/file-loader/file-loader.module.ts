import { Module } from '@nestjs/common';
import { FileLoaderService } from './file-loader.service';
import { LoggerModule } from "../logger/logger.module";

@Module({
  imports: [LoggerModule],
  providers: [FileLoaderService],
  exports: [FileLoaderService],
})
export class FileLoaderModule {}
