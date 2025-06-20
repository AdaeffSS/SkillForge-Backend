import { NameCreator } from './nameCreator'
import { EncodingCreator } from './encodingCreator'
import { BitWeightCreator } from './bitWeightCreator'
import { ParameterCreator } from "./parameterCreator";
import { TextLengthCreator } from "./textLengthCreator";

export const paramsCreatorsRegistry: Record<string, ParameterCreator> = {
  name: new NameCreator(),
  encoding: new EncodingCreator(),
  bitWeight: new BitWeightCreator(),
  textLength: new TextLengthCreator(),
}