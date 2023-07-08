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
    try {
      const parsedScipt = this.parseScript(this.script)
      return {
        status: 1,
        message: 'Success',
        data: parsedScipt
      }
    } catch (error) {
      console.error('Read Error:\n', error)
      return {
        status: -1,
        message: 'Error: See Console'
      }
    }
  }

  commit () {
    const doCommit = confirm('WARNING: This action will overwrite your current script. Although it will attempt to preserve extra code, it is not always reliable. Your old script will be pasted to the console. Do you wish to proceed?')

    if (!doCommit) {
      return {
        status: 0,
        message: 'Canceled'
      }
    }

    console.info('Old Script', this.script)
    const script = this.generateScript()

    try {
      this.store.dispatch(setTrackScript(script))
    } catch (error) {
      console.error('Commit Error:\n', error)
      return {
        status: -1,
        message: 'Error: See Console'
      }
    }

    try {
      // eslint-disable-next-line no-eval
      eval.call(window, script)
    } catch (error) {
      console.error('Run Error:\n', error)
      return {
        status: -1,
        message: 'Error: See Console'
      }
    }

    return {
      status: 1,
      message: 'Success'
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

      scriptResult += currentHeader
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

    this.scriptExtra = scriptCopy

    return currentData
  }

  // TODO: Rewrite this so it works
  parseCommand (command, currentData, scriptCopy) {
    const currentHeader = commandDataTypes[command].header.split('(')[0]
    console.log(currentHeader)
    return scriptCopy
  }
}

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
