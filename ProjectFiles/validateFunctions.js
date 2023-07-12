function validateData (valueChange, constraints, bounded) {
  if (!constraints) return valueChange.new

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

function validateTimeStamps (triggerData) {
  const commands = Object.keys(triggerData)

  commands.forEach(command => {
    const triggers = triggerData[command].triggers

    for (let i = 0; i < triggers.length - 1; i++) {
      const time1 = triggers[i][0]
      const time2 = triggers[i + 1][0]

      if ((time1[0] * secondsInMinute + time1[1]) * fps + time1[2] < (time2[0] * secondsInMinute + time2[1]) * fps + time2[2]) {
        continue
      }

      time2[0] = time1[0]
      time2[1] = time1[1]
      time2[2] = time1[2] + 1

      if (time2[2] === fps) {
        time2[2] = 0
        time2[1] += 1
      }

      if (time2[1] === secondsInMinute) {
        time2[1] = 0
        time2[0] += 1
      }
    }
  })
}
