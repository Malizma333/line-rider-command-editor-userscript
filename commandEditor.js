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
        // Parse script into data
        // console.log(this.script)
        return true
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

        return scriptResult
    }
}
