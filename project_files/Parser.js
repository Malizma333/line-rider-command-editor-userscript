// Group of functions for parsing script data
// eslint-disable-next-line no-unused-vars
class Parser {
  constructor() {
    this.commandData = {};
    Object.keys(Constants.TRIGGER_PROPS).forEach((command) => {
      this.initCommand(command, false);
    });
  }

  initCommand(command, empty) {
    this.commandData[command] = {
      id: command,
      triggers: !empty
        ? [structuredClone(Constants.TRIGGER_PROPS[command].TEMPLATE)]
        : [],
    };

    switch (command) {
      case Constants.TRIGGER_TYPES.FOCUS:
      case Constants.TRIGGER_TYPES.PAN:
      case Constants.TRIGGER_TYPES.ZOOM:
        this.commandData[command].smoothing = Constants.CONSTRAINTS.SMOOTH.DEFAULT;
        break;
      case Constants.TRIGGER_TYPES.TIME:
        this.commandData[command].interpolate = Constants.CONSTRAINTS.INTERPOLATE.DEFAULT;
        break;
      default:
        break;
    }
  }

  parseScript(scriptText) {
    this.script = scriptText.replace(/\s/g, '');

    Object.keys(Constants.TRIGGER_PROPS).forEach((command) => {
      this.parseCommand(command);
    });
  }

  // Parses the script by checking for the command's FUNC and verifying it's in a valid format

  parseCommand(command) {
    const currentHeader = Constants.TRIGGER_PROPS[command].FUNC.split('(')[0];
    const currentHeaderIndex = this.script.indexOf(currentHeader);

    if (currentHeaderIndex === -1) return;

    this.initCommand(command, true);

    const startIndex = currentHeaderIndex + currentHeader.length + 1;
    let endIndex = startIndex;

    for (let i = 1; i > 0 || endIndex >= this.script.length; endIndex += 1) {
      if (this.script.charAt(endIndex + 1) === '(') i += 1;
      if (this.script.charAt(endIndex + 1) === ')') i -= 1;
    }

    const parameterText = `[${this.script.substring(startIndex, endIndex)}]`;
    // HACK: Using eval is easier than json.parse, which has stricter syntax
    // eslint-disable-next-line no-eval
    const parameterArray = eval(parameterText);
    const [keyframes, smoothing] = parameterArray;

    switch (command) {
      case Constants.TRIGGER_TYPES.ZOOM:
      case Constants.TRIGGER_TYPES.PAN:
      case Constants.TRIGGER_TYPES.FOCUS:
      case Constants.TRIGGER_TYPES.TIME:
        this.addTriggers(command, keyframes);
        this.parseSmoothing(command, smoothing);
        break;
      case Constants.TRIGGER_TYPES.SKIN:
        this.parseSkinCss(keyframes);
        break;
      default:
        break;
    }
  }

  // Parses smoothing specifically by checking if the value exists and type

  parseSmoothing(command, smoothingValue) {
    if (command === Constants.TRIGGER_TYPES.TIME) {
      const constraints = Constants.CONSTRAINTS.INTERPOLATE;

      if (!smoothingValue) {
        this.commandData[command].interpolate = constraints.DEFAULT;
        return;
      }

      if (smoothingValue === true || smoothingValue === false) {
        this.commandData[command].interpolate = smoothingValue;
      } else {
        throw new Error('Invalid boolean!');
      }
    } else {
      const constraints = Constants.CONSTRAINTS.SMOOTH;

      if (!smoothingValue) {
        this.commandData[command].interpolate = constraints.DEFAULT;
        return;
      }

      if (Number.isNaN(smoothingValue)) {
        throw new Error('Invalid integer!');
      }

      if (smoothingValue > constraints.MAX) {
        this.commandData[command].smoothing = constraints.MAX;
      } else if (smoothingValue < constraints.MIN) {
        this.commandData[command].smoothing = constraints.MIN;
      } else {
        this.commandData[command].smoothing = smoothingValue;
      }
    }
  }

  // Add triggers and adjusts each of the time stamps to fit the [M,S,F] format

  addTriggers(command, commandArray) {
    for (let i = 0; i < commandArray.length; i += 1) {
      this.commandData[command].triggers.push([...commandArray[i]]);

      const timeProp = commandArray[i][0];
      if (timeProp.constructor === Number) {
        this.commandData[command].triggers[i][0] = [0, 0, timeProp];
      } else if (timeProp.length === 1) {
        this.commandData[command].triggers[i][0] = [0, 0, timeProp[0]];
      } else if (timeProp.length === 2) {
        this.commandData[command].triggers[i][0] = [0, timeProp[0], timeProp[1]];
      }
    }
  }

  // Parses each of the skin css codes in a custom riders command

  parseSkinCss(skinCSSArray) {
    skinCSSArray.forEach((skinCSS, skinIndex) => {
      this.commandData[Constants.TRIGGER_TYPES.SKIN].triggers.push(
        structuredClone(Constants.TRIGGER_PROPS[Constants.TRIGGER_TYPES.SKIN].TEMPLATE),
      );
      let depth = 0;
      let zeroIndex = 0;

      for (let i = 0; i < skinCSS.length; i += 1) {
        if (skinCSS.charAt(i) === '{') depth += 1;
        if (skinCSS.charAt(i) === '}') {
          depth -= 1;
          if (depth === 0) {
            this.parseProp(
              skinCSS.substring(zeroIndex, i + 1).replace(/\s/g, ''),
              skinIndex,
            );
            zeroIndex = i + 1;
          }
        }
      }
    });

    this.commandData[Constants.TRIGGER_TYPES.SKIN].triggers.push(
      this.commandData[Constants.TRIGGER_TYPES.SKIN].triggers.shift(),
    );
  }

  // Looks through each css property keyword and associates them with a JSON compatible keyword

  parseProp(propString, skinIndex) {
    const wordRegex = /(['"])?([#]?[a-z0-9A-Z_-]+)(['"])?/g;
    const cssPropKeywords = {
      '.outline': 'outline',
      '.skin': 'skin',
      '.hair': 'hair',
      '.fill': 'fill',
      '#eye': 'eye',
      '.sled': 'sled',
      '#string': 'string',
      '.arm.sleeve': 'armSleeve',
      '.arm.hand': 'armHand',
      '.leg.pants': 'legPants',
      '.leg.foot': 'legFoot',
      '.torso': 'torso',
      '.scarf1': 'scarf1',
      '.scarf2': 'scarf2',
      '.scarf3': 'scarf3',
      '.scarf4': 'scarf4',
      '.scarf5': 'scarf5',
      '#scarf0': 'id_scarf0',
      '#scarf1': 'id_scarf1',
      '#scarf2': 'id_scarf2',
      '#scarf3': 'id_scarf3',
      '#scarf4': 'id_scarf4',
      '#scarf5': 'id_scarf5',
      '.hat.top': 'hatTop',
      '.hat.bottom': 'hatBottom',
      '.hat.ball': 'hatBall',
      '.flag': 'flag',
    };

    Object.keys(cssPropKeywords).forEach((key) => {
      if (propString.startsWith(key)) {
        const skinDataString = propString.substring(key.length).replace(wordRegex, '"$2"').replace(';', ',');
        const skinDataJSON = JSON.parse(skinDataString);
        const propName = cssPropKeywords[key];

        if ('fill' in skinDataJSON) {
          this.commandData[Constants.TRIGGER_TYPES.SKIN]
            .triggers[skinIndex][propName].fill = skinDataJSON.fill;
        }

        if ('stroke' in skinDataJSON) {
          this.commandData[Constants.TRIGGER_TYPES.SKIN]
            .triggers[skinIndex][propName].stroke = skinDataJSON.stroke;
        }
      }
    });
  }
}
