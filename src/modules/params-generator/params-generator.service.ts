// /modules/params-generator/params-generator.service.ts

import { Injectable } from '@nestjs/common'
import type { IParams } from './params-creators/parameterCreator'
import type { ParameterCreator } from './params-creators/parameterCreator'

@Injectable()
export class ParamsGeneratorService {
  private visited = new Set<string>()
  private result: IParams = {}

  async generateParams(
    schema: Record<string, ParameterCreator>,
  ): Promise<IParams> {
    this.visited.clear()
    this.result = {}

    const dfs = async (param: string) => {
      if (this.visited.has(param)) return

      const creator = schema[param]
      if (!creator) throw new Error(`Parameter "${param}" is not defined in schema`)

      if (creator.dependsOn.length > 0) {
        for (const dep of creator.dependsOn) {
          await dfs(dep)
        }
      }

      this.result[param] = await creator.generate(this.result)
      this.visited.add(param)
    }

    for (const param of Object.keys(schema)) {
      await dfs(param)
    }
    return this.result
  }
}
