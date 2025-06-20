import { ParameterCreator, IParams } from './parameterCreator'

export class TextLengthCreator extends ParameterCreator {
  constructor() {
    super()
  }

  generate(params: IParams): number {
    return Math.floor(Math.random() * 51) + 50
  }
}
