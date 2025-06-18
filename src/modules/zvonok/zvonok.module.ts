import { Module } from '@nestjs/common';
import { ZvonokService } from './zvonok.service';

@Module({
  providers: [ZvonokService],
  exports: [ZvonokService],
})
export class ZvonokModule {}
