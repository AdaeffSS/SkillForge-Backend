import { Injectable } from '@nestjs/common'
import { ParamsGeneratorService } from '../../../params-generator/params-generator.service'
import { paramsCreatorsRegistry } from '../../../params-generator/params-creators'

@Injectable()
export class TaskOgeInfT11 {
  constructor(private readonly paramsGenerator: ParamsGeneratorService) {}

  private paramsSchema = {
    name: paramsCreatorsRegistry.name,
    encoding: paramsCreatorsRegistry.encoding,
    bitWeight: paramsCreatorsRegistry.bitWeight,
    textLength: paramsCreatorsRegistry.textLength,
  }

  async createTask(): Promise<string> {
    const params = await this.paramsGenerator.generateParams(this.paramsSchema)
    const totalBits = params.bitWeight * params.textLength

    return `${params.name} в кодировке ${params.encoding}, где каждый символ кодируется ${params.bitWeight} битами, написал текст из ${params.textLength} символов. Итого у него получилось: ${totalBits} бит.`
  }
}
