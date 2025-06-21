import { Injectable } from '@nestjs/common'
import { BaseTask } from '../../baseTask'
import { NameCreator } from "src/modules/params-generator/params-creators/nameCreator";
import { RegisterTask } from "../../tasks.decorator";
import { Exam, Sub } from "../../enums";
import { EncodingCreator } from "../../../params-generator/params-creators/encodingCreator";
import { BitWeightCreator } from "src/modules/params-generator/params-creators/bitWeightCreator";
import { TextLengthCreator } from "../../../params-generator/params-creators/textLengthCreator";

interface ParamsT11 {
  name: string;
  encoding: string;
  bitWeight: number;
  textLength: number;
  totalBits: number;
}

@Injectable()
@RegisterTask(Exam.OGE, Sub.INFO, "t_1_1")
export class TaskOgeInfT11 extends BaseTask<ParamsT11> {
  protected taskKey = "t_1_1";

  protected paramsSchema = {
    name: {
      creator: new NameCreator(),
      depends: {},
    },
    encoding: {
      creator: new EncodingCreator(),
      depends: {},
    },
    bitWeight: {
      creator: new BitWeightCreator(),
      depends: { encoding: "encoding" },
    },
    textLength: {
      creator: new TextLengthCreator(),
      depends: {},
    },
    totalBits: {
      creator: (params: { textLength: number; bitWeight: number }) =>
        params.textLength * params.bitWeight,
      depends: { textLength: "textLength", bitWeight: "bitWeight" },
    },
  };
}
