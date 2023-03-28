class CommandEditor {
    constructor(store, initState) {
        this.store = store
        this.state = initState

        this.changed = false

        this.script = getCurrentScript(this.store.getState())
        this.riderCount = getNumRiders(this.store.getState())

        store.subscribeImmediate(() => {
            this.onUpdate()
        })
    }

    read() {
        // Parse script into data
        console.log(this.script);
        return true;
    }

    commit() {
        try {
            this.store.dispatch(setTrackScript(this.generateScript()));
            return true;
        } catch(error) {
            return false;
        }
    }

    onUpdate(nextState = this.state) {
        if (this.state !== nextState) {
            this.state = nextState
        }

        const script = getCurrentScript(this.store.getState())
  
        if (this.script !== script) {
            this.script = script
        }

        const riderCount = getNumRiders(this.store.getState());

        if(this.riderCount !== riderCount) {
            this.riderCount = riderCount;
        }

        console.log(this.riderCount);
    }

    generateScript() {
        let scriptResult = "";
        const commands = Object.keys(commandDataTypes);

        commands.forEach(command => {
            let currentData = this.state.triggerData[command]
            let currentHeader = commandDataTypes[command].header

            currentHeader = currentHeader.replace(
                "{0}", JSON.stringify(currentData.triggers)
            );

            if(command === "TimeRemap") {
                currentHeader = currentHeader.replace(
                    "{1}", currentData.interpolate
                );
            } else {
                currentHeader = currentHeader.replace(
                    "{1}", currentData.smoothing
                );
            }

            scriptResult += currentHeader;
        });

        return scriptResult;
    }
}