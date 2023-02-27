class CommandEditor {
    constructor(store, initState) {
        this.store = store
        this.state = initState

        this.changed = false

        this.script = this.store.getState().trackData.script;

        store.subscribeImmediate(() => {
            this.onUpdate()
        })
    }

    commit() {
        if (this.changed) {
            this.store.dispatch(commitTrackChanges())
            this.store.dispatch(revertTrackChanges())
            this.changed = false
            return true
        }
    }
    
    /*
    createTrigger() {
        this.triggerObjectStorage.push(this.triggerTemplate);
    }

    readTrigger(index) {
        return this.triggerObjectStorage[index];
    }

    updateTrigger(index, data) {
        triggerToUpdate = this.triggerObjectStorage[index];
        this.triggerObjectStorage[index] = {
            ...triggerToUpdate,
            data
        };
    }

    deleteTrigger(index) {
        this.triggerObjectStorage.splice(index, 1);
    }
    */

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
  
        if (!shouldUpdate) {
            return;
        }
        
        if (this.changed) {
            this.store.dispatch(revertTrackChanges())
            this.changed = false
        }

        if(!this.state.active) {
            return;
        }

        //this.store.dispatch(setTrackScript("TEST"));
        //this.changed = true;
    }
}