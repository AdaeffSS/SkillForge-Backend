import { Injectable } from '@nestjs/common'

/**
 * Функция создания параметра.
 * @param params - объект с параметрами, необходимыми для генерации.
 * @returns сгенерированное значение параметра или Promise с ним.
 */
export type CreatorFn = (params: Record<string, any>) => any | Promise<any>;

/**
 * Конфигурация параметра.
 * @property creator - функция генерации параметра.
 * @property depends - зависимости параметра: ключ — имя аргумента для creator, значение — имя параметра, от которого зависит данный параметр.
 */
export interface ParamConfig {
  creator: CreatorFn;
  depends: Record<string, string>;
}

/**
 * Схема параметров.
 */
export type ParamSchema = Record<string, ParamConfig>;

/**
 * Сервис для генерации параметров с учётом зависимостей.
 */
@Injectable()
export class ParamsGeneratorService {
  /**
   * Генерирует параметры согласно переданной схеме.
   * @param schema - схема параметров с описанием зависимостей и функциями генерации.
   * @throws Ошибка при циклических зависимостях или отсутствии параметра в схеме.
   * @returns Объект с сгенерированными параметрами.
   */
  async generateParams(schema: ParamSchema): Promise<Record<string, any>> {
    const visited = new Set<string>();
    const stack = new Set<string>();
    const result: Record<string, any> = {};

    /**
     * Рекурсивная функция обхода и генерации параметров.
     * @param param - имя текущего параметра.
     * @param path - путь обхода для диагностики циклов.
     */
    const dfs = async (param: string, path: string[] = []): Promise<void> => {
      if (visited.has(param)) return;
      if (stack.has(param)) {
        throw new Error(`Cyclic dependency detected: ${[...path, param].join(' -> ')}`);
      }

      stack.add(param);
      path.push(param);

      const config = schema[param];
      if (!config) throw new Error(`Parameter "${param}" not defined in schema`);

      const dependencies = Object.values(config.depends);
      for (const depParam of dependencies) {
        await dfs(depParam, path);
      }

      const inputParams: Record<string, any> = {};
      for (const [inputKey, resultKey] of Object.entries(config.depends)) {
        inputParams[inputKey] = result[resultKey];
      }

      result[param] = await config.creator(inputParams);

      visited.add(param);
      stack.delete(param);
      path.pop();
    };

    for (const param of Object.keys(schema)) {
      await dfs(param);
    }

    return result;
  }
}
