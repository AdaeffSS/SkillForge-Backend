import { ParameterCreator } from "./parameterCreator";

export class ListPicker extends ParameterCreator {
  constructor() {
    super()
  }
  async generate(params: any[]): Promise<string> {
    if (!params || params.length === 0) throw new Error('Empty word list');
    const idx = Math.floor(Math.random() * params.length);
    return params[idx];
  }
}
