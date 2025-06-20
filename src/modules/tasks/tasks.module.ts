import { Module } from '@nestjs/common'
import { TasksController } from './tasks.controller'
import { ParamsGeneratorService } from '../params-generator/params-generator.service'

@Module({
  controllers: [TasksController],
  providers: [ParamsGeneratorService],
})
export class TasksModule {}
