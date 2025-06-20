import { Injectable } from '@nestjs/common'
import { paramsCreatorsRegistry } from '../../../params-generator/params-creators'
import { BaseTask } from '../../baseTask'

interface ParamsT11 {
  name: string;
  encoding: string;
  bitWeight: number;
  textLength: number;
  totalBits: number;
}

@Injectable()
export class TaskOgeInfT11 extends BaseTask<ParamsT11> {
  protected taskKey = 't_1_1'

  protected paramsSchema = {
    name: {
      creator: paramsCreatorsRegistry.name,
      depends: {}
    },
    encoding: {
      creator: paramsCreatorsRegistry.encoding,
      depends: {}
    },
    bitWeight: {
      creator: paramsCreatorsRegistry.bitWeight,
      depends: { encoding: 'encoding' }
    },
    textLength: {
      creator: paramsCreatorsRegistry.textLength,
      depends: {}
    },
    totalBits: {
      creator: (params: { bitWeight: number; textLength: number }) => params.bitWeight * params.textLength,
      depends: { bitWeight: 'bitWeight', textLength: 'textLength' }
    }
  }
}
