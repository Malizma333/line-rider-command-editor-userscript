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

    commitScript() {
        if(this.changed) {
            this.store.dispatch(commitTrackChanges());
            this.store.dispatch(revertTrackChanges());
            this.changed = false;
            return true;
        }
    }

    onUpdate (nextState = this.state) {
        let shouldUpdate = false

        if (this.state !== nextState) {
            this.state = nextState
            shouldUpdate = true
        }

        if (this.state.active) {
            const script = getCurrentScript(this.store.getState())
  
            if (this.script !== script) {
                this.script = script
                shouldUpdate = true
            }
        }

        if (shouldUpdate) {
            if (this.changed) {
                this.store.dispatch(revertTrackChanges())
                this.changed = false
            }

            if (this.state.active) {
                //this.store.dispatch(setTrackScript("TEST"))
                //this.changed = true
            }
        }
    }
}