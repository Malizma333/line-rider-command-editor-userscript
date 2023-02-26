class CommandEditorManager {
    constructor(commandData) {
        this.commandData = commandData;
        this.commandEditors = {};
        this.commandEditorComponents = {};

        for(let commandName in commandData) {
            this.commandEditors[commandName] =
            new CommandEditor(
                commandName,
                commandData[commandName],
                this
            );
            
            this.commandEditorComponents[commandName] =
            new CommandEditorComponent(
                commandName,
                commandData[commandName],
                this
            );
        }
        
        this.activeEditorName = Object.keys(commandData)[0];
    }

    get getTabs() {
        return e('div', {style: tabHeaderStyle},
            Object.keys(
                this.commandEditorComponents
            ).map(commandEditorName => {
                return e('div', null,
                    this.commandEditorComponents[commandEditorName].tabComponent
                )
            })
        );
    }

    get getActiveWindow() {
        return this.commandEditorComponents[
            this.activeEditorName
        ].windowComponent;
    }

    get getActiveEditorName() {
        return this.activeEditorName;
    }

    switchEditor(editorName) {
        this.activeEditorName = editorName;
        this.commandEditorComponents["Zoom"].setActive(true);
        /*Object.keys(
            this.commandEditorComponents
        ).forEach(commandEditorName => {
            this.commandEditorComponents[commandEditorName].setActive(
                commandEditorName === this.activeEditorName
            )
        })*/
    }

    changeSmoothing(value) {
        let targetValue = parseInt(value);

        if(isNaN(targetValue)) {
            commandEditors[this.activeEditorName].setSmoothing = smooth.default;
            return;
        }

        if(targetValue < smooth.min || targetValue > smooth.max) {
            return;
        }

        commandEditors[this.activeEditorName].setSmoothing = targetValue;
    }
}