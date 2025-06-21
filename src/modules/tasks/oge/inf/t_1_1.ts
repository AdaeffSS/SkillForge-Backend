import { Injectable } from '@nestjs/common'
import { BaseTask } from '@tasks/baseTask'
import { NameCreator } from "modules/params-generator/params-creators/nameCreator";
import { RegisterTask } from "@tasks/tasks.decorator";
import { Exam, Sub } from "@tasks/enums";
import { EncodingCreator } from "@pc/encodingCreator";
import { BitWeightCreator } from "modules/params-generator/params-creators/bitWeightCreator";
import { TextLengthCreator } from "@pc/textLengthCreator";

interface Params {
  name: string;
  encoding: string;
  bitWeight: number;
  textLength: number;
  totalBits: number;
}

@Injectable()
@RegisterTask(Exam.OGE, Sub.INFO, "t_1_1")
export class Task extends BaseTask<Params> {

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
