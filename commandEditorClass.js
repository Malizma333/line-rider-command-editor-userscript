class CommandEditor {
    commandEditor(key, template, uiComp) {
        this.keyName = key;
        this.triggerTemplate = template;
        this.uiComponent = uiComp;
        this.triggerObjectStorage = [this.template];
    }

    getKey() {
        return this.keyName;
    }

    getUIComponent() {
        return this.uiComponent;
    }

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
}