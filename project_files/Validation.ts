/* eslint-disable @typescript-eslint/no-unused-vars */

enum TYPES {
  BOOL = 'BOOLEAN',
  INT = 'INTEGER',
  FLOAT = 'FLOAT'
}

interface ValueChange {
  prev: any
  new: any
}

interface Constraint {
  DEFAULT: boolean | number
  TYPE: TYPES
  MIN?: number
  MAX?: number
}

const CONSTRAINTS = {
  INTERPOLATE: {
    DEFAULT: true, TYPE: TYPES.BOOL
  },
  SMOOTH: {
    DEFAULT: 20, MIN: 0, MAX: 40, TYPE: TYPES.INT
  },
  FRAME: {
    DEFAULT: 0, MIN: 0, MAX: 39, TYPE: TYPES.INT
  },
  SECOND: {
    DEFAULT: 0, MIN: 0, MAX: 59, TYPE: TYPES.INT
  },
  MINUTE: {
    DEFAULT: 0, MIN: 0, MAX: 99, TYPE: TYPES.INT
  },
  ZOOM: {
    DEFAULT: 1, MIN: -50, MAX: 50, TYPE: TYPES.FLOAT
  },
  PAN_X: {
    DEFAULT: 0, MIN: -100, MAX: 100, TYPE: TYPES.FLOAT
  },
  PAN_Y: {
    DEFAULT: 0, MIN: -100, MAX: 100, TYPE: TYPES.FLOAT
  },
  PAN_WIDTH: {
    DEFAULT: 0.4, MIN: 0, MAX: 2, TYPE: TYPES.FLOAT
  },
  PAN_HEIGHT: {
    DEFAULT: 0.4, MIN: 0, MAX: 2, TYPE: TYPES.FLOAT
  },
  FOCUS_WEIGHT: {
    DEFAULT: 0, MIN: 0, MAX: 1, TYPE: TYPES.FLOAT
  },
  TIME_SPEED: {
    DEFAULT: 1, MIN: 0.01, MAX: 10, TYPE: TYPES.FLOAT
  },
  SKIN_ZOOM: {
    DEFAULT: 1, MIN: 1, MAX: 4, TYPE: TYPES.FLOAT
  },
  ALPHA_SLIDER: {
    DEFAULT: 1, MIN: 0, MAX: 1, TYPE: TYPES.FLOAT
  }
} as const

function validateData (valueChange: ValueChange, constraints: Constraint, bounded: boolean): any {
  if (constraints == null) return valueChange.new

  switch (constraints.TYPE) {
    case TYPES.BOOL: {
      return valueChange.new
    }

    case TYPES.INT: {
      return validateInteger(valueChange, constraints, bounded)
    }

    case TYPES.FLOAT: {
      return validateFloat(valueChange, constraints, bounded)
    }

    default: return valueChange.prev
  }
}

function validateInteger (valueChange: ValueChange, constraints: Constraint, bounded: boolean): number {
  const prevValue = valueChange.prev
  const newValue = valueChange.new

  if (newValue.trim() === '') {
    return 0
  }

  const parsedValue = Math.floor(Number(newValue))

  if (Number.isNaN(parsedValue)) {
    return prevValue
  }

  if ((newValue as string).includes('.')) {
    return prevValue
  }

  if (!bounded) {
    return parsedValue
  }

  if (parsedValue < (constraints.MIN as number)) {
    return (constraints.MIN as number)
  }

  if (parsedValue > (constraints.MAX as number)) {
    return (constraints.MAX as number)
  }

  return parsedValue
}

function validateFloat (valueChange: ValueChange, constraints: Constraint, bounded: boolean): number {
  const prevValue = valueChange.prev
  const newValue = valueChange.new

  if (newValue.trim() === '') {
    return 0.0
  }

  const parsedValue = Number(newValue)

  if (Number.isNaN(parsedValue)) {
    return prevValue
  }

  if (!bounded) {
    if ((newValue as string).includes('.')) {
      return newValue
    }

    return parsedValue
  }

  if (parsedValue < (constraints.MIN as number)) {
    return (constraints.MIN as number)
  }

  if (parsedValue > (constraints.MAX as number)) {
    return (constraints.MAX as number)
  }

  return parsedValue
}

function validateTimes (commandData: any): boolean[] {
  if (commandData == null) return []

  const { triggers } = commandData
  const invalidIndices = Array(triggers.length).map(() => false)

  const firstTime = triggers[0][0]
  if (firstTime[0] !== 0 || firstTime[1] !== 0 || firstTime[2] !== 0) {
    invalidIndices[0] = true
  }

  for (let i = 0; i < triggers.length - 1; i += 1) {
    const time1 = triggers[i][0] as number[]
    const time2 = triggers[i + 1][0] as number[]
    const index1 = (
      time1[0] * 60 + time1[1]
    ) * FPS + time1[2]
    const index2 = (
      time2[0] * 60 + time2[1]
    ) * FPS + time2[2]

    if (index1 >= index2) {
      invalidIndices[i + 1] = true
    }
  }

  return invalidIndices
}
