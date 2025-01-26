export interface ValueChange {
  prev?: number | boolean
  new: string | boolean
}

export interface Constraint {
  DEFAULT: boolean | number
  INT?: boolean
  MIN?: number
  MAX?: number
}
