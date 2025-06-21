import { Injectable } from "@nestjs/common";
import { ParameterCreator, IParams } from "./parameterCreator";

@Injectable()
export class NameCreator extends ParameterCreator {
  constructor() {
    super();
  }

  generate(): string {
    const names = ["Андрей", "Олег", "Стёпа", "Максим"];
    return names[Math.floor(Math.random() * names.length)];
  }
}
