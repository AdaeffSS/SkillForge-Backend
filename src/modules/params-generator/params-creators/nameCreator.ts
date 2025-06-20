import { ParameterCreator, IParams } from "./parameterCreator";

export class NameCreator extends ParameterCreator {
  constructor() {
    super();
  }

  generate(params: IParams): string {
    const names = ["Андрей", "Олег", "Стёпа", "Максим"];
    return names[Math.floor(Math.random() * names.length)];
  }
}
