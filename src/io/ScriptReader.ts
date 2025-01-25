class ScriptParser { // eslint-disable-line @typescript-eslint/no-unused-vars
  triggerData: TriggerData

  constructor () {
    this.triggerData = TriggerDataManager.initialTriggerData
  }

  /**
   * Parses text from the script field into a trigger data object, reverting to the original
   * value if an error occurs
   */
  parseScript (scriptText: string, currentTriggerData: TriggerData): TriggerData {
    this.triggerData = TriggerDataManager.initialTriggerData
    const trimmedScript = scriptText.replace(/\s/g, '')

    Object.keys(TRIGGER_PROPS).forEach((commandId: string) => {
      try {
        this.triggerData[commandId as TRIGGER_ID].triggers = []
        this.parseCommand(commandId as TRIGGER_ID, trimmedScript)
      } catch (error: any) {
        console.warn(`[ScriptParser.parseScript()] ${error.message}`)
        this.triggerData[commandId as TRIGGER_ID] = structuredClone(
          currentTriggerData[commandId as TRIGGER_ID]
        )
      }
    })

    return this.triggerData
  }

  /**
   * Parses an individual command given its id and applies the parsed script to the trigger data
   */
  parseCommand (commandId: TRIGGER_ID, scriptSection: string): void {
    if (commandId === TRIGGER_ID.GRAVITY) {
      throw new Error('Gravity parsing not supported!');
    }

    if (TRIGGER_PROPS[commandId].FUNC === undefined) {
      throw new Error('Function undefined!');
    }

    const currentHeader = TRIGGER_PROPS[commandId].FUNC.split('(')[0]
    const currentHeaderIndex = scriptSection.indexOf(currentHeader)

    if (currentHeaderIndex === -1) {
      throw new Error('Command header not found!')
    }

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
    const parameterArray = eval(parameterText) // eslint-disable-line no-eval
    const [keyframes, smoothing] = parameterArray

    switch (commandId) {
      case TRIGGER_ID.ZOOM:
      case TRIGGER_ID.PAN:
      case TRIGGER_ID.FOCUS:
      case TRIGGER_ID.TIME:
        this.parseTriggers(commandId, keyframes)
        this.parseSmoothing(commandId, smoothing)
        break
      case TRIGGER_ID.SKIN:
        this.parseSkinCss(keyframes)
        break
      default:
        break
    }
  }

  /**
   * Parses a potential new Trigger[], not necessarily a complete definition of one
   */
  parseTriggers (commandId: TRIGGER_ID, commandArray: any[]): void {
    const triggers: TimedTrigger[] = []

    for (let i = 0; i < commandArray.length; i += 1) {
      triggers.push(structuredClone(commandArray[i]))

      const timeProp = commandArray[i][0] as number | number[]
      if (typeof timeProp === 'number') {
        const index = timeProp
        triggers[i][0] = this.retrieveTimestamp(index)
      } else if (timeProp.length === 1) {
        const index = timeProp[0]
        triggers[i][0] = this.retrieveTimestamp(index)
      } else if (timeProp.length === 2) {
        const index = timeProp[0] * 40 + timeProp[1]
        triggers[i][0] = this.retrieveTimestamp(index)
      } else {
        const index = timeProp[0] * 2400 +
         timeProp[1] * 40 + timeProp[2]
        triggers[i][0] = this.retrieveTimestamp(index)
      }
    }

    this.triggerData[commandId].triggers = triggers
  }

  /**
   * Parses integer or boolean smoothing for a command if its available
   */
  parseSmoothing (commandId: TRIGGER_ID, smoothingValue?: boolean | number): void {
    if (commandId === TRIGGER_ID.TIME) {
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
        this.triggerData[commandId].smoothing = constraints.DEFAULT
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

  /**
   * Parses a string of CSS into a skin trigger array
   */
  parseSkinCss (skinCSSArray: string[]): void {
    skinCSSArray.forEach((skinCSS: string, skinIndex: number) => {
      this.triggerData[TRIGGER_ID.SKIN].triggers.push(
        structuredClone(TRIGGER_PROPS[TRIGGER_ID.SKIN].TEMPLATE)
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

    // Revert from 1 indexed modulo n skin array to 0 indexed array
    if (this.triggerData[TRIGGER_ID.SKIN].triggers.length > 0) {
      this.triggerData[TRIGGER_ID.SKIN].triggers.push(
        this.triggerData[TRIGGER_ID.SKIN].triggers.shift() ?? TRIGGER_PROPS[TRIGGER_ID.SKIN].TEMPLATE
      )
    }
  }

  /**
   * Parses a specific property of a skin css string
   */
  parseSkinProp (cssString: string, skinIndex: number): void {
    const wordRegex = /(['"])?([#]?[a-z0-9A-Z_-]+)(['"])?/g
    const skinTriggers = this.triggerData[TRIGGER_ID.SKIN].triggers as SkinCssTrigger[]
    const cssPropKeywords = {
      outline: '.outline',
      flag: '.flag',
      skin: '.skin',
      hair: '.hair',
      fill: '.fill',
      eye: '#eye',
      sled: '.sled',
      string: '#string',
      armSleeve: '.arm.sleeve',
      armHand: '.arm.hand',
      legPants: '.leg.pants',
      legFoot: '.leg.foot',
      torso: '.torso',
      hatTop: '.hat.top',
      hatBottom: '.hat.bottom',
      hatBall: '.hat.ball',
      scarf1: '.scarf1',
      scarf2: '.scarf2',
      scarf3: '.scarf3',
      scarf4: '.scarf4',
      scarf5: '.scarf5',
      id_scarf0: '#scarf0',
      id_scarf1: '#scarf1',
      id_scarf2: '#scarf2',
      id_scarf3: '#scarf3',
      id_scarf4: '#scarf4',
      id_scarf5: '#scarf5'
    }

    Object.entries(cssPropKeywords).forEach(([propName, cssSelector]) => {
      if (!cssString.startsWith(cssSelector)) return
      const styleData = JSON.parse(cssString
        .substring(cssSelector.length)
        .replace(wordRegex, '"$2"')
        .replace(';', ','))

      if (styleData.fill !== undefined) {
        skinTriggers[skinIndex][propName].fill = styleData.fill
      }

      if (styleData.stroke !== undefined) {
        skinTriggers[skinIndex][propName].stroke = styleData.stroke
      }
    })

    this.triggerData[TRIGGER_ID.SKIN].triggers = skinTriggers
  }

  /**
   * Converts a player index to a trigger timestamp
   */
  retrieveTimestamp (index: number): TriggerTime {
    const frames = index % 40
    const seconds = Math.floor(index / 40) % 60
    const minutes = Math.floor(index / 2400)
    return [minutes, seconds, frames]
  }

  /**
   * Removes the leading zeros from numbers within the script
   */
  removeLeadingZeroes (script: string, commandId: TRIGGER_ID): string {
    if (commandId === TRIGGER_ID.SKIN) return script
    return script.replace(/([^\d.+-])0+(\d+)/g, '$1$2')
  }
}
