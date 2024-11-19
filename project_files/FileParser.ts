class FileParser { // eslint-disable-line @typescript-eslint/no-unused-vars
  triggerData: TriggerData

  constructor () {
    this.triggerData = TriggerDataManager.initialTriggerData
  }

  /**
   * Parses file from the script file format into a trigger data object, reverting to the original
   * value if an error occurs
   */
  parseFile (fileObject: any, currentTriggerData: TriggerData): TriggerData {
    this.triggerData = TriggerDataManager.initialTriggerData

    Object.keys(TRIGGER_PROPS).forEach((commandId: string) => {
      try {
        this.triggerData[commandId as TRIGGER_ID].triggers = []
        this.parseCommand(commandId as TRIGGER_ID, fileObject)
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
   * Parses an individual command given its id and applies the parsed file data to the trigger data
   */
  parseCommand (commandId: TRIGGER_ID, fileObject: any): void {
    if (fileObject[commandId] === undefined) {
      throw new Error(`Command ${commandId} not found!`)
    }

    switch (commandId) {
      case TRIGGER_ID.ZOOM:
      case TRIGGER_ID.PAN:
      case TRIGGER_ID.FOCUS:
        this.parseTriggers(commandId, fileObject[commandId]['triggers'])
        this.parseSmoothing(commandId, fileObject[commandId]['smoothing'])
      case TRIGGER_ID.TIME:
        this.parseTriggers(commandId, fileObject[commandId]['triggers'])
        this.parseSmoothing(commandId, fileObject[commandId]['interpolate'])
        break
      case TRIGGER_ID.SKIN:
        this.parseSkinTriggers(fileObject[commandId]['triggers'])
        break
      case TRIGGER_ID.GRAVITY:
        this.parseTriggers(commandId, fileObject[commandId]['triggers'])
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
      const timeTrigger: TimedTrigger = structuredClone(commandArray[i]);

      const timeProp = commandArray[i][0] as number | number[]
      if (typeof timeProp === 'number') {
        const index = timeProp
        timeTrigger[0] = this.retrieveTimestamp(index)
      } else if (timeProp.length === 1) {
        const index = timeProp[0]
        timeTrigger[0] = this.retrieveTimestamp(index)
      } else if (timeProp.length === 2) {
        const index = timeProp[0] * FPS + timeProp[1]
        timeTrigger[0] = this.retrieveTimestamp(index)
      } else {
        const index = timeProp[0] * FPS * 60 +
         timeProp[1] * FPS + timeProp[2]
         timeTrigger[0] = this.retrieveTimestamp(index)
      }

      if (commandId === TRIGGER_ID.GRAVITY && (timeTrigger[1] as GravityTrigger[1]).length === undefined) {
        timeTrigger[1] = [timeTrigger[1] as GravityTrigger[1][0]]
      }

      triggers.push(timeTrigger)
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
  parseSkinTriggers (skinMapArray: any[]): void {
    const triggers = [] as SkinCssTrigger[]

    for (const skinMap of skinMapArray) {
      const defaultSkinMap = structuredClone(TRIGGER_PROPS[TRIGGER_ID.SKIN].TEMPLATE)
      for (const key of Object.keys(defaultSkinMap)) {
        if (skinMap[key] === undefined) continue
        
        if (skinMap[key].fill !== undefined) {
          defaultSkinMap[key].fill = skinMap[key].fill
        }

        if (skinMap[key].stroke !== undefined) {
          defaultSkinMap[key].stroke = skinMap[key].stroke
        }
      }
      triggers.push(defaultSkinMap)
    }

    this.triggerData[TRIGGER_ID.SKIN].triggers = triggers
  }

  /**
   * Converts a player index to a trigger timestamp
   */
  retrieveTimestamp (index: number): TriggerTime {
    const frames = index % FPS
    const seconds = Math.floor(index / FPS) % 60
    const minutes = Math.floor(index / (60 * FPS))
    return [minutes, seconds, frames]
  }
}
