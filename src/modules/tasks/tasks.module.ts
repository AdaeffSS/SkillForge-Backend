import { Module } from '@nestjs/common'
import { TasksController } from './tasks.controller'
import { ParamsGeneratorService } from '../params-generator/params-generator.service'
import { FileLoaderModule } from "../file-loader/file-loader.module";
import { TaskOgeInfT11 } from "./oge/inf/t_1_1";
import { TasksManager } from "./tasks.manager";
import { TaskOgeInfT12 } from "./oge/inf/t_1_2";

@Module({
  imports: [FileLoaderModule],
  controllers: [TasksController],
  providers: [ParamsGeneratorService, TasksManager, TaskOgeInfT11, TaskOgeInfT12],
})
export class TasksModule {}
