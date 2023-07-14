function parseCommand (command, currentData, scriptCopy) {
  const currentHeader = commandDataTypes[command].header.split('(')[0]
  const currentHeaderIndex = scriptCopy.indexOf(currentHeader)

  if (currentHeaderIndex === -1) return

  const startIndex = currentHeaderIndex + currentHeader.length + 1
  let endIndex = startIndex

  for (let i = 1; i > 0 || endIndex >= scriptCopy.length; endIndex++) {
    if (scriptCopy.charAt(endIndex + 1) === '(') i++
    if (scriptCopy.charAt(endIndex + 1) === ')') i--
  }

  const parameterText = '[' + scriptCopy.substring(startIndex, endIndex) + ']'
  // eslint-disable-next-line no-eval
  const parameterArray = eval(parameterText)

  console.log(parameterArray)

  switch (command) {
    case Triggers.Zoom:
    case Triggers.CameraPan:
    case Triggers.CameraFocus:
    case Triggers.TimeRemap:
      currentData[command].triggers = adjustTimestamps(parameterArray[0])
      parseSmoothing(command, currentData, parameterArray[1])
      break
    case Triggers.CustomSkin:
      currentData[command].triggers = parseSkinCss(parameterArray[0])
      break
    default:
      break
  }
}

function parseSmoothing (command, currentData, smoothingValue) {
  if (command === Triggers.TimeRemap) {
    const constraints = constraintProps.interpolateProps

    if (!smoothingValue) {
      currentData[command].interpolate = constraints.default
      return
    }

    if (smoothingValue === true || smoothingValue === false) {
      currentData[command].interpolate = smoothingValue
    } else {
      throw new Error('Invalid boolean!')
    }
  } else {
    const constraints = constraintProps.smoothProps

    if (!smoothingValue) {
      currentData[command].interpolate = constraints.default
      return
    }

    if (isNaN(smoothingValue)) {
      throw new Error('Invalid integer!')
    }

    if (smoothingValue > constraints.max) {
      currentData[command].smoothing = constraints.max
    } else if (smoothingValue < constraints.min) {
      currentData[command].smoothing = constraints.min
    } else {
      currentData[command].smoothing = smoothingValue
    }
  }
}

function adjustTimestamps (commandArray) {
  for (let i = 0; i < commandArray.length; i++) {
    const timeList = commandArray[i][0]

    if (!isNaN(timeList)) {
      commandArray[i][0] = [0, 0, timeList]
    }

    if (timeList.length === 1) {
      commandArray[i][0] = [0, 0, timeList[0]]
    }

    if (timeList.length === 2) {
      commandArray[i][0] = [0, timeList[0], timeList[1]]
    }
  }

  return commandArray
}

function parseSkinCss (skinCssArray) {
  const template = JSON.parse(JSON.stringify(commandDataTypes.CustomSkin.template))
  console.log(template)
  return [template]
}
