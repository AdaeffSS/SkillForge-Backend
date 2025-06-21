import { Injectable } from "@nestjs/common";
import { BaseTask } from '@tasks/baseTask';
import { RegisterTask } from "@tasks/tasks.decorator";
import { Exam, Sub } from "@tasks/enums";

@Injectable()
@RegisterTask(Exam.OGE, Sub.INFO, "t_1_1")
export class Task extends BaseTask {

  protected readonly paramsSchema = {
    gender: {
      creator: (params: any): any =>
        this.random.pick(this.parameters.gender_forms),
      depends: {},
    },

    writeForm: {
      creator: (params: any): any => params.gender.verb_past,
      depends: { gender: "gender" },
    },

    studentForm: {
      creator: (params: any): any => params.gender.noun,
      depends: { gender: "gender" },
    },

    removedForm: {
      creator: (params: any): any => params.gender.verb_perfective,
      depends: { gender: "gender" },
    },

    pronoun: {
      creator: (params: any): any => params.gender.pronoun,
      depends: { gender: "gender" },
    },

    name: {
      creator: (params: any): any => this.random.getRandomName(params.gender.gender),
      depends: { gender: "gender" },
    },

    encoding: {
      creator: (params: any): any => this.random.pick(this.parameters.encodings),
      depends: {},
    },

    encodingName: {
      creator: (params: any): any => params.encoding.name,
      depends: { encoding: "encoding" },
    },

    encodingWeight: {
      creator: (params: any): any => params.encoding.weight,
      depends: { encoding: "encoding" },
    },
    termin: {
      creator: (params: any): any => this.random.pick(this.parameters.termins),
      depends: {},
    },
    terminNominative: {
      creator: (params: any): any => params.termin.nominative,
      depends: { termin: "termin" },
    },
    terminGenitive: {
      creator: (params: any): any => params.termin.genitive,
      depends: { termin: "termin" },
    },
    terminPartitive: {
      creator: (params: any): any => params.termin.partitive,
      depends: { termin: "termin" },
    },
    word3: {
      creator: (params: any): any =>
        this.random.pick(params.termin.byLength.l3),
      depends: { termin: "termin" },
    },
    word4: {
      creator: (params: any): any =>
        this.random.pick(params.termin.byLength.l4),
      depends: { termin: "termin" },
    },
    word5: {
      creator: (params: any): any =>
        this.random.pick(params.termin.byLength.l5),
      depends: { termin: "termin" },
    },
    word6: {
      creator: (params: any): any =>
        this.random.pick(params.termin.byLength.l6),
      depends: { termin: "termin" },
    },
    word7: {
      creator: (params: any): any =>
        this.random.pick(params.termin.byLength.l7),
      depends: { termin: "termin" },
    },
    word8: {
      creator: (params: any): any =>
        this.random.pick(params.termin.byLength.l8),
      depends: { termin: "termin" },
    },
    removedWord: {
      creator: (params: any): any =>
        this.random.pick([
          params.word3,
          params.word4,
          params.word5,
          params.word6,
          params.word7,
          params.word8,
        ]),
      depends: {
        word3: "word3",
        word4: "word4",
        word5: "word5",
        word6: "word6",
        word7: "word7",
        word8: "word8",
      },
    },
    delta: {
      creator: (params: any): any => (params.removedWord.length + 2) * params.encodingWeight,
      depends: { removedWord : "removedWord", encodingWeight: "encodingWeight" },
    },
    seed: {
      creator: (params: any): any => this.random.getSeed(),
      depends: {},
    }
  };
}
