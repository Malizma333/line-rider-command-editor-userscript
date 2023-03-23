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

    commit() {
        if(this.changed) {
            console.log("Commit");
            this.store.dispatch(commitTrackChanges());
            this.store.dispatch(revertTrackChanges());
            this.changed = false;
            return true;
        }
    }

    onUpdate(nextState = this.state) {        
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

        if(!shouldUpdate) return;

        if (this.changed) {
            this.store.dispatch(revertTrackChanges())
            this.changed = false
        }

        if(!this.state.active) return;

        this.store.dispatch(setTrackScript(this.generateScript()));
        this.changed = true;
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

        console.log(scriptResult);

        return scriptResult;
    }
}