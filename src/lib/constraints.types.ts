export enum CONSTRAINT_TYPE {
  INT = 0,
  FLOAT = 1,
  BOOL = 2
}

interface NumContraint {
  DEFAULT: number
  MIN: number
  MAX: number
  TYPE: CONSTRAINT_TYPE.INT | CONSTRAINT_TYPE.FLOAT
}

interface BoolConstraint {
  DEFAULT: boolean
  TYPE: CONSTRAINT_TYPE.BOOL
}


export type Constraint = NumContraint | BoolConstraint