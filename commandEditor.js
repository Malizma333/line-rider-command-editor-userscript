class CommandEditor {
    constructor(store, initState) {
        this.store = store
        this.state = initState

        this.changed = false

        this.smoothingValue = 10;
        this.triggerObjectStorage = [this.template];

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
  
        const track = getSimulatorCommittedTrack(this.store.getState())
  
        if (this.track !== track) {
            this.track = track
            shouldUpdate = true
        }
  
        if (shouldUpdate) {
            if (this.changed) {
                this.store.dispatch(revertTrackChanges())
                this.changed = false
            }
  
            if(this.state.active) {

                console.log("Update");

                // Read from script window
                // Write to script window

                /*
                let myLines = [];
                for (let { p1, p2 } of genLines(this.state)) {
                    myLines.push({
                        x1: p1.x,
                        y1: p1.y,
                        x2: p2.x,
                        y2: p2.y,
                        type: 2
                    })
                }
  
                if (myLines.length > 0) {
                    this.store.dispatch(addLines(myLines))
                    this.changed = true
                }
                */
            }
        }
    }
}