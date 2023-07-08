class CommandEditor {
  constructor (store, initState) {
    this.store = store
    this.state = initState

    this.script = getCurrentScript(this.store.getState())
    this.scriptExtra = ''
    this.riderCount = getNumRiders(this.store.getState())

    store.subscribeImmediate(() => {
      this.onUpdate()
    })
  }

  get RiderCount () {
    return this.riderCount
  }

  read () {
    console.log('Read')

    try {
      const parsedScipt = this.parseScript(this.script)
      return {
        status: 1,
        data: parsedScipt
      }
    } catch (error) {
      return {
        status: -1,
        message: error
      }
    }
  }

  test () {
    const script = this.generateScript()

    try {
      // eslint-disable-next-line no-eval
      eval.call(window, script)
      return {
        status: 1
      }
    } catch (error) {
      return {
        status: -1,
        message: error
      }
    }
  }

  print () {
    console.log('Print')

    const script = this.generateScript()

    return {
      status: 1,
      message: script
    }
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

    return scriptResult.replace(' ', '') + '\n' + this.scriptExtra
  }

  parseScript (scriptText) {
    let scriptCopy = scriptText

    const currentData = this.state.triggerData
    const commands = Object.keys(commandDataTypes)

    commands.forEach(command => {
      scriptCopy = this.parseCommand(command, currentData, scriptCopy)
    })

    return currentData
  }

  parseCommand (command, currentData, scriptCopy) {
    const currentHeader = commandDataTypes[command].header.split('(')[0]

    return scriptCopy
  }
}

// parseCommand (command, currentData, scriptTrim) {
//   const currentHeader = commandDataTypes[command].header.split('(')[0]
//   const headerIndex = scriptTrim.indexOf(currentHeader)

//   if (headerIndex === -1) return

//   const startIndex = headerIndex + currentHeader.length + 1
//   let endIndex = startIndex

//   for (let j = 1; j > 0 || endIndex >= scriptTrim.length; endIndex++) {
//     if (scriptTrim.charAt(endIndex + 1) === '(') j++
//     if (scriptTrim.charAt(endIndex + 1) === ')') j--
//   }

//   const commandData = scriptTrim.substring(startIndex, endIndex)
//   const sepComma = commandData.lastIndexOf(',')

//   if (sepComma === -1) throw new Error('Invalid syntax!')

//   currentData[command].triggers = JSON.parse(commandData.substring(0, sepComma))
//   this.parseSmoothing(command, currentData, commandData.substring(sepComma + 1))
// }

// parseSmoothing (command, currentData, smoothingValue) {
//   if (command === Triggers.TimeRemap) {
//     if (smoothingValue === 'true') {
//       currentData[command].interpolate = true
//     } else if (smoothingValue === 'false') {
//       currentData[command].interpolate = false
//     } else {
//       throw new Error('Invalid boolean!')
//     }
//   } else {
//     const parsedValue = parseInt(smoothingValue)

//     if (isNaN(parsedValue)) {
//       throw new Error('Invalid integer!')
//     }

//     const constraints = constraintProps.smoothProps

//     if (parsedValue > constraints.max) {
//       currentData[command].smoothing = constraints.max
//     } else if (parsedValue < constraints.min) {
//       currentData[command].smoothing = constraints.min
//     } else {
//       currentData[command].smoothing = parsedValue
//     }
//   }

// currentData[command].triggers = commandArray

// for (let i = 0; i < commandArray.length; i++) {
//   const timeList = commandArray[i][0]

//   if (!isNaN(timeList)) {
//     commandArray[i][0] = [0, 0, timeList]
//   }

//   if (timeList.length === 1) {
//     commandArray[i][0] = [0, 0, timeList[0]]
//   }

//   if (timeList.length === 2) {
//     commandArray[i][0] = [0, timeList[0], timeList[1]]
//   }
// }

// if (command === Triggers.TimeRemap) {
//   if (smoothingValue === 'true') {
//     currentData[command].interpolate = true
//   } else if (smoothingValue === 'false') {
//     currentData[command].interpolate = false
//   } else {
//     throw new Error('Invalid boolean!')
//   }
// } else {
//   const parsedValue = parseInt(smoothingValue)

//   if (isNaN(parsedValue)) {
//     throw new Error('Invalid integer!')
//   }
// }
