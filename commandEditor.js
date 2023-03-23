class CommandEditor {
    constructor(store, initState) {
        this.store = store
        this.state = initState

        this.changed = false

        this.script = getCurrentScript(this.store.getState())

        store.subscribeImmediate(() => {
            this.onUpdate()
        })
    }

    read() {
        // Parse script into data
        console.log(this.script);
    }

    commit() {
        this.store.dispatch(setTrackScript(this.generateScript()));
    }

    onUpdate(nextState = this.state) {
        if (this.state !== nextState) {
            this.state = nextState
        }

        const script = getCurrentScript(this.store.getState())
  
        if (this.script !== script) {
            this.script = script
        }
    }

    generateScript() {
        let scriptResult = "";

        const commands = Object.keys(commandDataTypes);

        commands.forEach(command => {
            let currentData = this.state.triggerData[command]
            let currentHeader = commandDataTypes[command].header

            currentHeader = currentHeader.replace(
                "{1}", JSON.stringify(currentData.triggers)
            );

            if(command === "TimeRemap") {
                currentHeader = currentHeader.replace(
                    "{2}", currentData.interpolate
                );
            } else {
                currentHeader = currentHeader.replace(
                    "{2}", currentData.smoothing
                );
            }

            scriptResult += currentHeader;
        });

        return scriptResult;
    }
}