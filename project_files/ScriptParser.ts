class ScriptParser { // eslint-disable-line @typescript-eslint/no-unused-vars
  triggerData: any

  parseScript (scriptText: any): any {
    this.triggerData = {}
    const trimmedScript = scriptText.replace(/\s/g, '')

    Object.keys(TRIGGER_PROPS).forEach((commandId: string) => {
      try {
        this.parseCommand(commandId as TRIGGER_TYPES, trimmedScript)
      } catch (e: any) {
        console.error('[ScriptParser]', e.message)
        if (this.triggerData[commandId] !== undefined) {
          this.triggerData[commandId] = undefined
        }
      }
    })

    return this.triggerData
  }

  parseCommand (commandId: TRIGGER_TYPES, scriptSection: string): void {
    const currentHeader = TRIGGER_PROPS[commandId].FUNC.split('(')[0]
    const currentHeaderIndex = scriptSection.indexOf(currentHeader)

    if (currentHeaderIndex === -1) return

    this.initCommand(commandId)

    const startIndex = currentHeaderIndex + currentHeader.length + 1
    let endIndex = startIndex

    for (let i = 1; i > 0 || endIndex >= scriptSection.length; endIndex += 1) {
      if (scriptSection.charAt(endIndex + 1) === '(') i += 1
      if (scriptSection.charAt(endIndex + 1) === ')') i -= 1
    }

    const parameterText = `[${
      this.removeLeadingZeroes(
        scriptSection.substring(startIndex, endIndex),
        commandId
      )
    }]`

    // HACK: Using eval is easier than json.parse, which has stricter syntax
    // eslint-disable-next-line no-eval
    const parameterArray = eval(parameterText)
    const [keyframes, smoothing] = parameterArray

    switch (commandId) {
      case TRIGGER_TYPES.ZOOM:
      case TRIGGER_TYPES.PAN:
      case TRIGGER_TYPES.FOCUS:
      case TRIGGER_TYPES.TIME:
        this.parseTriggers(commandId, keyframes)
        this.parseSmoothing(commandId, smoothing)
        break
      case TRIGGER_TYPES.SKIN:
        this.parseSkinCss(keyframes)
        break
      default:
        break
    }
  }

  initCommand (commandId: TRIGGER_TYPES): void {
    this.triggerData[commandId] = {
      id: commandId,
      triggers: []
    }

    switch (commandId) {
      case TRIGGER_TYPES.FOCUS:
      case TRIGGER_TYPES.PAN:
      case TRIGGER_TYPES.ZOOM:
        this.triggerData[commandId].smoothing = CONSTRAINTS.SMOOTH.DEFAULT
        break
      case TRIGGER_TYPES.TIME:
        this.triggerData[commandId].interpolate = CONSTRAINTS.INTERPOLATE.DEFAULT
        break
      default:
        break
    }
  }

  parseTriggers (commandId: TRIGGER_TYPES, commandArray: any[]): void {
    for (let i = 0; i < commandArray.length; i += 1) {
      this.triggerData[commandId].triggers.push([...commandArray[i]])

      const timeProp = commandArray[i][0] as number | number[]
      if (typeof timeProp === 'number') {
        const index = timeProp
        this.triggerData[commandId].triggers[i][0] = this.retrieveTimestamp(index)
      } else if (timeProp.length === 1) {
        const index = timeProp[0]
        this.triggerData[commandId].triggers[i][0] = this.retrieveTimestamp(index)
      } else if (timeProp.length === 2) {
        const index = timeProp[0] * FPS + timeProp[1]
        this.triggerData[commandId].triggers[i][0] = this.retrieveTimestamp(index)
      } else {
        const index = timeProp[0] * FPS * 60 +
         timeProp[1] * FPS + timeProp[2]
        this.triggerData[commandId].triggers[i][0] = this.retrieveTimestamp(index)
      }
    }
  }

  parseSmoothing (commandId: TRIGGER_TYPES, smoothingValue?: boolean | number): void {
    if (commandId === TRIGGER_TYPES.TIME) {
      const constraints = CONSTRAINTS.INTERPOLATE

      if (smoothingValue == null) {
        this.triggerData[commandId].interpolate = constraints.DEFAULT
        return
      }

      if (smoothingValue === true || smoothingValue === false) {
        this.triggerData[commandId].interpolate = smoothingValue
      } else {
        throw new Error('Invalid boolean!')
      }
    } else {
      const constraints = CONSTRAINTS.SMOOTH

      if (smoothingValue == null) {
        this.triggerData[commandId].interpolate = constraints.DEFAULT
        return
      }

      if (typeof smoothingValue !== 'number') {
        throw new Error('Invalid integer!')
      }

      if (smoothingValue > constraints.MAX) {
        this.triggerData[commandId].smoothing = constraints.MAX
      } else if (smoothingValue < constraints.MIN) {
        this.triggerData[commandId].smoothing = constraints.MIN
      } else {
        this.triggerData[commandId].smoothing = smoothingValue
      }
    }
  }

  parseSkinCss (skinCSSArray: string[]): void {
    skinCSSArray.forEach((skinCSS: string, skinIndex: number) => {
      this.triggerData[TRIGGER_TYPES.SKIN].triggers.push(
        structuredClone(TRIGGER_PROPS[TRIGGER_TYPES.SKIN].TEMPLATE)
      )
      let depth = 0
      let zeroIndex = 0

      for (let i = 0; i < skinCSS.length; i += 1) {
        if (skinCSS.charAt(i) === '{') depth += 1
        if (skinCSS.charAt(i) === '}') {
          depth -= 1
          if (depth === 0) {
            this.parseSkinProp(
              skinCSS.substring(zeroIndex, i + 1).replace(/\s/g, ''),
              skinIndex
            )
            zeroIndex = i + 1
          }
        }
      }
    })

    this.triggerData[TRIGGER_TYPES.SKIN].triggers.push(
      this.triggerData[TRIGGER_TYPES.SKIN].triggers.shift()
    )
  }

  parseSkinProp (cssString: string, skinIndex: number): void {
    const wordRegex = /(['"])?([#]?[a-z0-9A-Z_-]+)(['"])?/g
    const cssPropKeywords = TRIGGER_PROPS[TRIGGER_TYPES.SKIN].STYLE_MAP

    Object.entries(cssPropKeywords).forEach(([propName, cssSelector]) => {
      if (!cssString.startsWith(cssSelector)) return
      const styleData = JSON.parse(cssString
        .substring(cssSelector.length)
        .replace(wordRegex, '"$2"')
        .replace(';', ','))

      if (styleData.fill !== undefined) {
        this.triggerData[TRIGGER_TYPES.SKIN]
          .triggers[skinIndex][propName].fill = styleData.fill
      }

      if (styleData.stroke !== undefined) {
        this.triggerData[TRIGGER_TYPES.SKIN]
          .triggers[skinIndex][propName].stroke = styleData.stroke
      }
    })
  }

  retrieveTimestamp (index: number): number[] {
    const frames = index % FPS
    const seconds = Math.floor(index / FPS) % 60
    const minutes = Math.floor(index / (60 * FPS))
    return [minutes, seconds, frames]
  }

  removeLeadingZeroes (script: string, commandId: TRIGGER_TYPES): string {
    if (commandId === TRIGGER_TYPES.SKIN) return script
    return script.replace(/([^\d.+-])0+(\d+)/g, '$1$2')
  }
}
