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
        try {
            return [true, this.parseScript(this.script)]
        } catch (error) {
            return [false, null]
        }
    }

    commit () {
        try {
            this.store.dispatch(setTrackScript(this.generateScript()))
            return true
        } catch (error) {
            console.info('Commit Error:\n', error)
            return false
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

        return scriptResult.replace(' ', '')
    }

    parseScript (scriptText) {
        if (scriptText.trim() === '') {
            throw new Error('Script blank!')
        }

        const scriptTrim = scriptText.replace(/\s+/g, '').replace(/\n+/g, '')
        const commands = Object.keys(commandDataTypes)
        const currentData = this.state.triggerData

        commands.forEach(command => {
            const currentHeader = commandDataTypes[command].header.split('(')[0]
            const headerIndex = scriptTrim.indexOf(currentHeader)

            if (headerIndex === -1) return

            const startIndex = headerIndex + currentHeader.length + 1
            let endIndex = startIndex

            for (let j = 1; j > 0 || endIndex >= scriptTrim.length; endIndex++) {
                if (scriptTrim.charAt(endIndex + 1) === '(') j++
                if (scriptTrim.charAt(endIndex + 1) === ')') j--
            }

            const commandData = scriptTrim.substring(startIndex, endIndex)
            const sepComma = commandData.lastIndexOf(',')

            if (sepComma === -1) throw new Error('Invalid syntax!')

            currentData[command].triggers = JSON.parse(commandData.substring(0, sepComma))
            const smoothingValue = commandData.substring(sepComma + 1)

            if (command === Triggers.TimeRemap) {
                if (smoothingValue === 'true') {
                    currentData[command].interpolate = true
                } else if (smoothingValue === 'false') {
                    currentData[command].interpolate = false
                } else {
                    throw new Error('Invalid boolean!')
                }
            } else {
                const parsedValue = parseInt(smoothingValue)

                if (isNaN(parsedValue)) {
                    throw new Error('Invalid integer!')
                }

                const constraints = constraintProps.smoothProps

                if (parsedValue > constraints.max) {
                    currentData[command].smoothing = constraints.max
                } else if (parsedValue < constraints.min) {
                    currentData[command].smoothing = constraints.min
                } else {
                    currentData[command].smoothing = parsedValue
                }
            }
        })

        return currentData
    }
}
