class CommandEditor {
    constructor(key, template, uiComponent) {
        this.keyName = key;
        this.triggerTemplate = template;
        this.smoothingValue = 10;
        this.uiComponent = uiComponent;
        this.triggerObjectStorage = [this.template];
    }

    get key() {
        return this.keyName;
    }

    get smoothing() {
        return this.smoothingValue;
    }

    set setSmoothing(value) {
        this.smoothingValue = value;
    }

    get tabComponent() {
        return this.uiComponent.tab;
    }

    get windowComponent() {
        return this.uiComponent.window;
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