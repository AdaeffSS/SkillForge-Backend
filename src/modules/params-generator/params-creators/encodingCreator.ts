import { ParameterCreator, IParams } from './parameterCreator'

export class EncodingCreator extends ParameterCreator {
  constructor() {
    super()
  }

  generate(params: IParams): string {
    const encodings = ['КОИ-8', 'UTF-8', 'UTF-16', 'Unicode']
    return encodings[Math.floor(Math.random() * encodings.length)]
  }
}
