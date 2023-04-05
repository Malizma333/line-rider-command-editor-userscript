function validateData (valueChange, constraints, bounded) {
  switch (constraints.type) {
    case constraintTypes.bool: {
      return valueChange.new
    }

    case constraintTypes.int: {
      return validateInteger(valueChange, constraints, bounded)
    }

    case constraintTypes.float: {
      return validateFloat(valueChange, constraints, bounded)
    }

    default: return valueChange.prev
  }
}

function validateInteger (valueChange, constraints, bounded) {
  const prevValue = valueChange.prev
  const newValue = valueChange.new

  if (newValue.trim() === '') {
    return 0
  }

  const parsedValue = Math.floor(Number(newValue))

  if (isNaN(parsedValue)) {
    return prevValue
  }

  if (newValue.includes('.')) {
    return prevValue
  }

  if (!bounded) {
    return parsedValue
  }

  if (parsedValue < constraints.min) {
    return constraints.min
  }

  if (parsedValue > constraints.max) {
    return constraints.max
  }

  return parsedValue
}

function validateFloat (valueChange, constraints, bounded) {
  const prevValue = valueChange.prev
  const newValue = valueChange.new

  if (newValue.trim() === '') {
    return 0.0
  }

  const parsedValue = Number(newValue)

  if (isNaN(parsedValue)) {
    return prevValue
  }

  if (!bounded) {
    if (newValue.includes('.')) {
      return newValue
    }

    return parsedValue
  }

  if (parsedValue < constraints.min) {
    return constraints.min
  }

  if (parsedValue > constraints.max) {
    return constraints.max
  }

  return parsedValue
}

function validateTimeStamps (timeStamp) {
  return [0, 0, 0]
}
