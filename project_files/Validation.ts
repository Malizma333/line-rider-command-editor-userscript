interface ValueChange {
  prev: any
  new: any
}

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
    const time1 = triggers[i][0]
    const time2 = triggers[i + 1][0]
    const index1 = (
      time1[0] * TIMELINE.SPM + time1[1]
    ) * TIMELINE.FPS + time1[2]
    const index2 = (
      time2[0] * TIMELINE.SPM + time2[1]
    ) * TIMELINE.FPS + time2[2]

    if (index1 >= index2) {
      invalidIndices[i + 1] = true
    }
  }

  return invalidIndices
}
