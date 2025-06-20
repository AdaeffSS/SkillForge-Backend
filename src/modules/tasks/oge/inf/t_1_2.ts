import { Injectable } from '@nestjs/common'
import { paramsCreatorsRegistry } from '../../../params-generator/params-creators'
import { BaseTask } from '../../baseTask'

interface ParamsT12 {
  encoding: string;
  bitWeight: number;
  name: string;
  word1: string;
  word2: string;
  word3: string;
  word4: string;
  word5: string;
  word6: string;
  termin: string;
  count_weight: number;
  type_weight: string;
}

const data = ['1', '2', '3']

@Injectable()
export class TaskOgeInfT12 extends BaseTask<ParamsT12> {
  protected taskKey = 't_1_2';

  protected paramsSchema = {
    encoding: {
      creator: paramsCreatorsRegistry.encoding,
      depends: {}
    },
    bitWeight: {
      creator: paramsCreatorsRegistry.bitWeight,
      depends: { encoding: 'encoding' }
    },
    name: {
      creator: paramsCreatorsRegistry.name,
      depends: {}
    },
    word1: {
      creator: (params) => paramsCreatorsRegistry.listPicker.generate(['1', '2', '3']),
      depends: { name: 'name' }
    },
  };

}
