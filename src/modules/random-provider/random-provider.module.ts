import { Module } from '@nestjs/common';
import { RandomProvider } from './random-provider.service';

@Module({
  providers: [RandomProvider],
  exports: [RandomProvider],
})
export class RandomProviderModule {}
