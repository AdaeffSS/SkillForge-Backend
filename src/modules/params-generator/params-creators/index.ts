import { NameCreator } from './nameCreator'
import { EncodingCreator } from './encodingCreator'
import { BitWeightCreator } from './bitWeightCreator'
import { ParameterCreator } from "./parameterCreator";
import { TextLengthCreator } from "./textLengthCreator";
import { ListPicker } from "./ListPicker";

interface Props {
  name: ParameterCreator,
  encoding: ParameterCreator,
  bitWeight: ParameterCreator,
  textLength: ParameterCreator,
  listPicker: ParameterCreator
}

export const paramsCreatorsRegistry: Props = {
  name: new NameCreator(),
  encoding: new EncodingCreator(),
  bitWeight: new BitWeightCreator(),
  textLength: new TextLengthCreator(),
  listPicker: new ListPicker()
}