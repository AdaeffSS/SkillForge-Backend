import { Injectable } from '@nestjs/common'
import { BaseTask } from '@tasks/baseTask'
import { RegisterTask } from "@tasks/tasks.decorator";
import { Exam, Sub } from "@tasks/enums";

@Injectable()
@RegisterTask(Exam.EGE, Sub.INFO, 't_24_1')
export class Task extends BaseTask {

  protected readonly paramsSchema = {
    gender: {
      creator: (params: any): any =>
        this.random.pick(this.parameters.gender_forms),
      depends: {},
    },
  };
}
