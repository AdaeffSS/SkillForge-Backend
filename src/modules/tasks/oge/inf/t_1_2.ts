import { Injectable } from '@nestjs/common'
import { BaseTask } from '../../baseTask'
import { NameCreator } from "src/modules/params-generator/params-creators/nameCreator";
import { RegisterTask } from "../../tasks.decorator";
import { Exam, Sub } from "../../enums";

interface ParamsT11 {
  name: string;
  encoding: string;
  bitWeight: number;
  textLength: number;
  totalBits: number;
}

@Injectable()
@RegisterTask(Exam.OGE, Sub.INFO, 't_1_2')
export class TaskOgeInfT11 extends BaseTask<ParamsT11> {

  protected taskKey = 't_1_2'

  protected paramsSchema = {
    name: {
      creator: new NameCreator(),
      depends: {}
    }
  }
}
