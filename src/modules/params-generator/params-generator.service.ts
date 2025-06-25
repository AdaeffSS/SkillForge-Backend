import { Injectable } from '@nestjs/common'

export type CreatorFn = (params: Record<string, any>) => any | Promise<any>;

export interface ParamConfig {
  creator: CreatorFn;
  depends: Record<string, string>
}

export type ParamSchema = Record<string, ParamConfig>;

@Injectable()
export class ParamsGeneratorService {
  async generateParams(schema: ParamSchema): Promise<Record<string, any>> {
    const visited = new Set<string>()
    const stack = new Set<string>()
    const result: Record<string, any> = {}

    const dfs = async (param: string): Promise<void> => {
      if (visited.has(param)) return
      if (stack.has(param)) throw new Error(`Cyclic dependency detected: ${param}`)

      stack.add(param)

      const config = schema[param]
      if (!config) throw new Error(`Parameter "${param}" not defined in schema`)


      for (const dep of Object.values(config.depends)) {
        await dfs(dep)
      }


      const inputParams: Record<string, any> = {}
      for (const [inputKey, resultKey] of Object.entries(config.depends)) {
        inputParams[inputKey] = result[resultKey]
      }


      result[param] = await config.creator(inputParams)

      visited.add(param)
      stack.delete(param)
    }

    for (const param of Object.keys(schema)) {
      await dfs(param)
    }

    return result
  }
}
