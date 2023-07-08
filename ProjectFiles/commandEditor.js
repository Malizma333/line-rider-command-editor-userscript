class CommandEditor {
  constructor (store, initState) {
    this.store = store
    this.state = initState

    this.script = getCurrentScript(this.store.getState())
    this.riderCount = getNumRiders(this.store.getState())

    store.subscribeImmediate(() => {
      this.onUpdate()
    })
  }

  get RiderCount () {
    return this.riderCount
  }

  read () {
    return this.parseScript(this.script)
  }

  test () {
    const script = this.generateScript()
    // eslint-disable-next-line no-eval
    eval.call(window, script)
  }

  print () {
    return this.generateScript()
  }

  onUpdate (nextState = this.state) {
    let shouldUpdate = false

    if (this.state !== nextState) {
      this.state = nextState
      shouldUpdate = true
    }

    const script = getCurrentScript(this.store.getState())

    if (this.script !== script) {
      this.script = script
      shouldUpdate = true
    }

    const riderCount = getNumRiders(this.store.getState())

    if (this.riderCount !== riderCount) {
      this.riderCount = riderCount
      shouldUpdate = true
    }

    if (!shouldUpdate || !this.state.active) return

    this.changed = true
  }

  generateScript () {
    let scriptResult = ''
    const commands = Object.keys(commandDataTypes)

    commands.forEach(command => {
      const currentData = this.state.triggerData[command]
      let currentHeader = commandDataTypes[command].header

      currentHeader = currentHeader.replace(
        '{0}', JSON.stringify(currentData.triggers)
      )

      if (command === Triggers.TimeRemap) {
        currentHeader = currentHeader.replace(
          '{1}', currentData.interpolate
        )
      } else {
        currentHeader = currentHeader.replace(
          '{1}', currentData.smoothing
        )
      }

      scriptResult += currentHeader + '\n'
    })

    return scriptResult.replace(' ', '')
  }

  parseScript (scriptText) {
    const commands = Object.keys(commandDataTypes)
    const currentData = this.state.triggerData
    const scriptCopy = scriptText.replace(/\s/g, '')

    commands.forEach(command => {
      this.parseCommand(command, currentData, scriptCopy)
    })

    return currentData
  }

  parseCommand (command, currentData, scriptCopy) {
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

    currentData[command].triggers = this.adjustTimestamps(parameterArray[0])

    this.parseSmoothing(command, currentData, parameterArray[1])
  }

  adjustTimestamps (commandArray) {
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

  parseSmoothing (command, currentData, smoothingValue) {
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
}
