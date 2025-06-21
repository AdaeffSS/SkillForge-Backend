import { Module } from '@nestjs/common';
import { ParamsGeneratorService } from './params-generator.service';

@Module({
  providers: [ParamsGeneratorService],
  exports: [ParamsGeneratorService],
})
export class ParamsGeneratorModule {}
