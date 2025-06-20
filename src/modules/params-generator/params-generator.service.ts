import { Injectable } from '@nestjs/common'
import type { IParams } from './params-creators/parameterCreator'
import type { ParameterCreator } from './params-creators/parameterCreator'

type CreatorFn = (params: Record<string, any>) => any | Promise<any>

interface ParamConfig {
  creator: ParameterCreator | CreatorFn
  depends: Record<string, string>
}

@Injectable()
export class ParamsGeneratorService {
  async generateParams(schema: Record<string, ParamConfig>): Promise<IParams> {
    const visited = new Set<string>()
    const stack = new Set<string>()
    const result: IParams = {}

    const dfs = async (param: string) => {
      if (visited.has(param)) return
      if (stack.has(param)) throw new Error(`Cyclic dependency detected: ${param}`)

      stack.add(param)

      const config = schema[param]
      if (!config) throw new Error(`Parameter "${param}" not defined in schema`)

      const dependencies = Object.values(config.depends)

      for (const dep of dependencies) {
        await dfs(dep)
      }

      const inputParams: Record<string, any> = {}
      for (const [inputKey, resultKey] of Object.entries(config.depends)) {
        inputParams[inputKey] = result[resultKey]
      }

      if (typeof config.creator === 'function') {
        result[param] = await config.creator(inputParams)
      } else {
        result[param] = await config.creator.generate(inputParams)
      }

      visited.add(param)
      stack.delete(param)
    }

    for (const param of Object.keys(schema)) {
      await dfs(param)
    }

    return result
  }
}
