export { IntInterpreterValue as Int } from './intInterpreterValue';
export { StringInterpreterValue as String } from './stringInterpreterValue';

import { IntInterpreterValue } from './intInterpreterValue';
import { StringInterpreterValue } from './stringInterpreterValue';

export type Any = IntInterpreterValue | StringInterpreterValue; // TODO: Is this naming elegant or miserable?
