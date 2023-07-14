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

  switch (command) {
    case Triggers.Zoom:
    case Triggers.CameraPan:
    case Triggers.CameraFocus:
    case Triggers.TimeRemap:
      adjustTimestamps(parameterArray[0])
      currentData[command].triggers = parameterArray[0]
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
}

function parseSkinCss (skinCSSArray) {
  const skinJSONArray = []

  skinCSSArray.forEach(skinCSS => {
    const template = JSON.parse(JSON.stringify(commandDataTypes.CustomSkin.template))
    let depth = 0
    let zeroIndex = 0

    for (let i = 0; i < skinCSS.length; i++) {
      if (skinCSS.charAt(i) === '{') depth += 1
      if (skinCSS.charAt(i) === '}') {
        depth -= 1
        if (depth === 0) {
          parseProp(skinCSS.substring(zeroIndex, i + 1).replace(/\s/g, ''), template)
          zeroIndex = i + 1
        }
      }
    }

    skinJSONArray.push(template)
  })

  return skinJSONArray
}

function parseProp (propString, object) {
  const wordRegex = /(['"])?([#]?[a-z0-9A-Z_-]+)(['"])?/g
  const cssPropKeywords = {
    '.outline': 'outline',
    '.skin': 'skin',
    '.hair': 'hair',
    '.fill': 'fill',
    '#eye': 'eye',
    '.sled': 'sled',
    '#string': 'string',
    '.arm.sleeve': 'armSleeve',
    '.arm.hand': 'armHand',
    '.leg.pants': 'legPants',
    '.leg.foot': 'legFoot',
    '.torso': 'torso',
    '.scarf0': 'scarf0',
    '.scarf1': 'scarf1',
    '.scarf2': 'scarf2',
    '.scarf3': 'scarf3',
    '.scarf4': 'scarf4',
    '.scarf5': 'scarf5',
    '.hat.top': 'hatTop',
    '.hat.bottom': 'hatBottom',
    '.hat.ball': 'hatBall',
    '.flag': 'flag'
  }

  for (const key in cssPropKeywords) {
    if (propString.startsWith(key)) {
      const skinDataString = propString.substring(key.length).replace(wordRegex, '"$2"').replace(';', ',')
      const skinDataJSON = JSON.parse(skinDataString)
      const propName = cssPropKeywords[key]

      if ('fill' in skinDataJSON) {
        object[propName].fill = skinDataJSON.fill
      }

      if ('stroke' in skinDataJSON) {
        object[propName].stroke = skinDataJSON.stroke
      }

      return
    }
  }
}
