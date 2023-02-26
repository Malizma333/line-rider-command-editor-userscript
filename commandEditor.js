class CommandEditor {
    constructor(key, templateData, manager) {
        this.name = key;
        this.triggerTemplate = templateData;
        this.manager = manager;

        this.smoothingValue = 10;
        this.triggerObjectStorage = [this.template];
    }

    get key() {
        return this.name;
    }

    get smoothing() {
        return this.smoothingValue;
    }

    set setSmoothing(value) {
        this.smoothingValue = value;
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