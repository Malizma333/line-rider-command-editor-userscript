// eslint-disable-next-line no-unused-vars
class ScriptParser {
  static initCommand (commandId) {
    ScriptParser.triggerData[commandId] = {
      id: commandId,
      triggers: []
    }

    switch (commandId) {
      case Constants.TRIGGER_TYPES.FOCUS:
      case Constants.TRIGGER_TYPES.PAN:
      case Constants.TRIGGER_TYPES.ZOOM:
        ScriptParser.triggerData[commandId].smoothing = Constants.CONSTRAINTS.SMOOTH.DEFAULT
        break
      case Constants.TRIGGER_TYPES.TIME:
        ScriptParser.triggerData[commandId].interpolate = Constants.CONSTRAINTS.INTERPOLATE.DEFAULT
        break
      default:
        break
    }
  }

  static retrieveTimestamp (index) {
    const frames = index % Constants.TIMELINE.FPS
    const seconds = Math.floor(index / Constants.TIMELINE.FPS) % Constants.TIMELINE.SPM
    const minutes = Math.floor(index / (Constants.TIMELINE.SPM * Constants.TIMELINE.FPS))
    return [minutes, seconds, frames]
  }

  static removeLeadingZeroes (script, commandId) {
    if (commandId === Constants.TRIGGER_TYPES.SKIN) return script
    return script.replace(/([^\d.+-])0+(\d+)/g, '$1$2')
  }

  static parseScript (scriptText) {
    ScriptParser.triggerData = {}
    const trimmedScript = scriptText.replace(/\s/g, '')

    Object.keys(Constants.TRIGGER_PROPS).forEach((commandId) => {
      try {
        ScriptParser.parseCommand(commandId, trimmedScript)
      } catch (e) {
        console.error('[ScriptParser]', e.message)
        if (ScriptParser.triggerData[commandId] !== undefined) {
          delete ScriptParser.triggerData[commandId]
        }
      }
    })

    return ScriptParser.triggerData
  }

  static parseCommand (commandId, script) {
    const currentHeader = Constants.TRIGGER_PROPS[commandId].FUNC.split('(')[0]
    const currentHeaderIndex = script.indexOf(currentHeader)

    if (currentHeaderIndex === -1) return

    ScriptParser.initCommand(commandId)

    const startIndex = currentHeaderIndex + currentHeader.length + 1
    let endIndex = startIndex

    for (let i = 1; i > 0 || endIndex >= script.length; endIndex += 1) {
      if (script.charAt(endIndex + 1) === '(') i += 1
      if (script.charAt(endIndex + 1) === ')') i -= 1
    }

    const parameterText = `[${ScriptParser.removeLeadingZeroes(
      script.substring(startIndex, endIndex),
      commandId
    )}]`

    // HACK: Using eval is easier than json.parse, which has stricter syntax
    // eslint-disable-next-line no-eval
    const parameterArray = eval(parameterText)
    const [keyframes, smoothing] = parameterArray

    switch (commandId) {
      case Constants.TRIGGER_TYPES.ZOOM:
      case Constants.TRIGGER_TYPES.PAN:
      case Constants.TRIGGER_TYPES.FOCUS:
      case Constants.TRIGGER_TYPES.TIME:
        ScriptParser.parseTriggers(commandId, keyframes)
        ScriptParser.parseSmoothing(commandId, smoothing)
        break
      case Constants.TRIGGER_TYPES.SKIN:
        ScriptParser.parseSkinCss(keyframes)
        break
      default:
        break
    }
  }

  static parseTriggers (commandId, commandArray) {
    for (let i = 0; i < commandArray.length; i += 1) {
      ScriptParser.triggerData[commandId].triggers.push([...commandArray[i]])

      const timeProp = commandArray[i][0]
      if (timeProp.constructor === Number) {
        const index = timeProp
        ScriptParser.triggerData[commandId].triggers[i][0] = ScriptParser.retrieveTimestamp(index)
      } else if (timeProp.length === 1) {
        const index = timeProp[0]
        ScriptParser.triggerData[commandId].triggers[i][0] = ScriptParser.retrieveTimestamp(index)
      } else if (timeProp.length === 2) {
        const index = timeProp[0] * Constants.TIMELINE.FPS + timeProp[1]
        ScriptParser.triggerData[commandId].triggers[i][0] = ScriptParser.retrieveTimestamp(index)
      } else {
        const index = timeProp[0] * Constants.TIMELINE.FPS * Constants.TIMELINE.SPM +
         timeProp[1] * Constants.TIMELINE.FPS + timeProp[2]
        ScriptParser.triggerData[commandId].triggers[i][0] = ScriptParser.retrieveTimestamp(index)
      }
    }
  }

  static parseSmoothing (commandId, smoothingValue) {
    if (commandId === Constants.TRIGGER_TYPES.TIME) {
      const constraints = Constants.CONSTRAINTS.INTERPOLATE

      if (!smoothingValue) {
        ScriptParser.triggerData[commandId].interpolate = constraints.DEFAULT
        return
      }

      if (smoothingValue === true || smoothingValue === false) {
        ScriptParser.triggerData[commandId].interpolate = smoothingValue
      } else {
        throw new Error('Invalid boolean!')
      }
    } else {
      const constraints = Constants.CONSTRAINTS.SMOOTH

      if (!smoothingValue) {
        ScriptParser.triggerData[commandId].interpolate = constraints.DEFAULT
        return
      }

      if (Number.isNaN(smoothingValue)) {
        throw new Error('Invalid integer!')
      }

      if (smoothingValue > constraints.MAX) {
        ScriptParser.triggerData[commandId].smoothing = constraints.MAX
      } else if (smoothingValue < constraints.MIN) {
        ScriptParser.triggerData[commandId].smoothing = constraints.MIN
      } else {
        ScriptParser.triggerData[commandId].smoothing = smoothingValue
      }
    }
  }

  static parseSkinCss (skinCSSArray) {
    skinCSSArray.forEach((skinCSS, skinIndex) => {
      ScriptParser.triggerData[Constants.TRIGGER_TYPES.SKIN].triggers.push(
        structuredClone(Constants.TRIGGER_PROPS[Constants.TRIGGER_TYPES.SKIN].TEMPLATE)
      )
      let depth = 0
      let zeroIndex = 0

      for (let i = 0; i < skinCSS.length; i += 1) {
        if (skinCSS.charAt(i) === '{') depth += 1
        if (skinCSS.charAt(i) === '}') {
          depth -= 1
          if (depth === 0) {
            ScriptParser.parseSkinProp(
              skinCSS.substring(zeroIndex, i + 1).replace(/\s/g, ''),
              skinIndex
            )
            zeroIndex = i + 1
          }
        }
      }
    })

    ScriptParser.triggerData[Constants.TRIGGER_TYPES.SKIN].triggers.push(
      ScriptParser.triggerData[Constants.TRIGGER_TYPES.SKIN].triggers.shift()
    )
  }

  static parseSkinProp (cssString, skinIndex) {
    const wordRegex = /(['"])?([#]?[a-z0-9A-Z_-]+)(['"])?/g
    const cssPropKeywords = Constants.TRIGGER_PROPS[Constants.TRIGGER_TYPES.SKIN].STYLE_MAP

    Object.entries(cssPropKeywords).forEach(([propName, cssSelector]) => {
      if (!cssString.startsWith(cssSelector)) return
      const styleData = JSON.parse(cssString
        .substring(cssSelector.length)
        .replace(wordRegex, '"$2"')
        .replace(';', ','))

      if (styleData.fill !== undefined) {
        ScriptParser.triggerData[Constants.TRIGGER_TYPES.SKIN]
          .triggers[skinIndex][propName].fill = styleData.fill
      }

      if (styleData.stroke !== undefined) {
        ScriptParser.triggerData[Constants.TRIGGER_TYPES.SKIN]
          .triggers[skinIndex][propName].stroke = styleData.stroke
      }
    })
  }
}
