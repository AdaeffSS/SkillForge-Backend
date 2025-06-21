import { Module } from '@nestjs/common';
import { ParamsGeneratorService } from './params-generator.service';
import { NameCreator } from "./params-creators/nameCreator";

@Module({
  providers: [ParamsGeneratorService, NameCreator],
  exports: [ParamsGeneratorService],
})
export class ParamsGeneratorModule {}
