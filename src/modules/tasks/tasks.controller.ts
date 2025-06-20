import { Controller, Get } from '@nestjs/common'
import { TaskOgeInfT11 } from './oge/inf/t_1_1'
import { ParamsGeneratorService } from '../params-generator/params-generator.service'

@Controller('tasks')
export class TasksController {
  constructor(
    private readonly paramsGeneratorService: ParamsGeneratorService,
  ) {}

  @Get()
  async getTask(): Promise<string> {
    const task = new TaskOgeInfT11(this.paramsGeneratorService)
    return await task.createTask()
  }
}
