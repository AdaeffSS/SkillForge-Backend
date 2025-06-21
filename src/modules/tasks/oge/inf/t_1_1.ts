import { Injectable } from "@nestjs/common";
import { BaseTask } from '@tasks/baseTask';
import { RegisterTask } from "@tasks/tasks.decorator";
import { Exam, Sub } from "@tasks/enums";
import { ListPicker } from "@pc/ListPicker";
import { NamePicker } from "@pc/namePicker";

@Injectable()
@RegisterTask(Exam.OGE, Sub.INFO, "t_1_1")
export class Task extends BaseTask {

  protected readonly paramsSchema = {

    name: {
      creator: (params: any): any => NamePicker(),
      depends: {}
    },
    encoding: {
      creator: (params: any): any => ListPicker([]),
      depends: {}
    },
    encodingWeight: {
      creator: (params: any): any => ListPicker([]),
      depends: { encoding: 'encoding' }
    },
    termin: {
      creator: (params: any): any => ListPicker([["река", "одной из рек"], ["море", "одного из морей"]]),
      depends: {}
    },
    termin1: {
      creator: (params: any): any => params.termin[0],
      depends: { termin: 'termin' }
    },
    termin2: {
      creator: (params: any): any => params.termin[1],
      depends: { termin: 'termin' }
    },
    word3: {
      creator: (params: any): any => ListPicker([params.termin[0], "озеро"]),
      depends: { termin: 'termin' }
    },
    word4: {
      creator: (params: any): any => ListPicker([]),
      depends: { termin: 'termin' }
    },
    word5: {
      creator: (params: any): any => ListPicker([]),
      depends: { termin: 'termin' }
    },
    word6: {
      creator: (params: any): any => ListPicker([]),
      depends: { termin: 'termin' }
    },
    word7: {
      creator: (params: any): any => ListPicker([]),
      depends: { termin: 'termin' }
    },
    word8: {
      creator: (params: any): any => ListPicker([]),
      depends: { termin: 'termin' }
    },
    test: {
      creator: (params: any): any => ListPicker([]),
      depends: { termin: 'termin' }
    },
    delta: {
      creator: (params: any): any => 7,
      depends: {}
    }
  };
}
