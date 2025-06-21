import { ParameterCreator, IParams } from './parameterCreator'

export class BitWeightCreator extends ParameterCreator {
  constructor() {
    super(['encoding'])
  }

  generate(params: IParams): number {
    const map: Record<string, number> = {
      'КОИ-8': 8,
      'UTF-8': 8,
      'UTF-16': 16,
      'Unicode': 8,
    }
    return map[params.encoding] ?? 8
  }
}
