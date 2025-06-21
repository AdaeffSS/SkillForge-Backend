export interface IParams {
  [key: string]: any
}

export abstract class ParameterCreator {
  dependsOn: string[]

  protected constructor(dependsOn: string[] = []) {
    this.dependsOn = dependsOn
  }

  abstract generate(params: IParams): any | Promise<any>
}