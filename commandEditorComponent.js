/*
class CommandEditorComponent {
    constructor(key, templateData, manager) {
        this.name = key;
        this.triggerTemplate = templateData;
        this.manager = manager;

        const [isActive, setActive] = useState(false);
    }

    get key() {
        return this.name;
    }

    setActive(value) {
        this.setActive(value);
        console.log(this.isActive);
    }

    get tabComponent() {
        return e('button', {
            style: {
                ...tabButtonStyle,
                backgroundColor:
                    this.state.active ? 
                    colorTheme.lightgray1 :
                    colorTheme.darkgray1
            },
            onClick: () => {
                this.manager.switchEditor(this.name)
            }
            },
            e('text', {style: textStyle.S}, this.name)
        )
    }

    get windowComponent() {
        return e('div', {
            style: {
                display:
                    this.state.active ?
                    'none' :
                    'inline'
                },
            },
            e('div', {style: smoothTabStyle},
                e('text', {style: textStyle.S}, "Smoothing"),
                e('input', {
                    style: {...textInputStyle, marginLeft: '5px'},
                    type: 'number',
                    min: smooth.min,
                    max: smooth.max,
                    placeholder: smooth.default,
                    onChange: e => this.manager.changeSmooth(e.target.value)
                })
            ),
            e('div', {style: triggerWindowStyle})
        )
    }
}
*/