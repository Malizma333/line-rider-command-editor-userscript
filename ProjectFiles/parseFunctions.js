/* Group of functions for parsing script data */
class Parser {
  constructor() {
    this.commandData = {};
    Object.keys(commandDataTypes).forEach((command) => {
      this.initCommand(command, false);
    });
  }

  initCommand(command, empty) {
    this.commandData[command] = {
      id: command,
      triggers: !empty
        ? [Object.assign(commandDataTypes[command].template, {})]
        : [],
    };

    switch (command) {
      case Triggers.CameraFocus:
      case Triggers.CameraPan:
      case Triggers.Zoom:
        this.commandData[command].smoothing = constraintProps.smoothProps.default;
        break;
      case Triggers.TimeRemap:
        this.commandData[command].interpolate = constraintProps.interpolateProps.default;
        break;
      default:
        break;
    }
  }

  parseScript(scriptText) {
    this.script = scriptText.replace(/\s/g, '');

    Object.keys(commandDataTypes).forEach((command) => {
      this.parseCommand(command);
    });
  }

  // Parses the script by checking for a command header keyword and verifying it's in a valid format

  parseCommand(command) {
    const currentHeader = commandDataTypes[command].header.split('(')[0];
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
    const parameterArray = JSON.parse(parameterText);
    const [keyframes, smoothing] = parameterArray;

    switch (command) {
      case Triggers.Zoom:
      case Triggers.CameraPan:
      case Triggers.CameraFocus:
      case Triggers.TimeRemap:
        this.addTriggers(command, keyframes);
        this.parseSmoothing(command, smoothing);
        break;
      case Triggers.CustomSkin:
        this.parseSkinCss(keyframes);
        break;
      default:
        break;
    }
  }

  // Parses smoothing specifically by checking if the value exists and type

  parseSmoothing(command, smoothingValue) {
    if (command === Triggers.TimeRemap) {
      const constraints = constraintProps.interpolateProps;

      if (!smoothingValue) {
        this.commandData[command].interpolate = constraints.default;
        return;
      }

      if (smoothingValue === true || smoothingValue === false) {
        this.commandData[command].interpolate = smoothingValue;
      } else {
        throw new Error('Invalid boolean!');
      }
    } else {
      const constraints = constraintProps.smoothProps;

      if (!smoothingValue) {
        this.commandData[command].interpolate = constraints.default;
        return;
      }

      if (Number.isNaN(smoothingValue)) {
        throw new Error('Invalid integer!');
      }

      if (smoothingValue > constraints.max) {
        this.commandData[command].smoothing = constraints.max;
      } else if (smoothingValue < constraints.min) {
        this.commandData[command].smoothing = constraints.min;
      } else {
        this.commandData[command].smoothing = smoothingValue;
      }
    }
  }

  // Add triggers and adjusts each of the time stamps to fit the [M,S,F] format

  addTriggers(command, commandArray) {
    console.log(commandArray);
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
      this.commandData[Triggers.CustomSkin].triggers.push(
        Object.assign(commandDataTypes.CustomSkin.template, {}),
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

    this.commandData[Triggers.CustomSkin].triggers.push(
      this.commandData[Triggers.CustomSkin].triggers.shift(),
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
          this.commandData[Triggers.CustomSkin]
            .triggers[skinIndex][propName].fill = skinDataJSON.fill;
        }

        if ('stroke' in skinDataJSON) {
          this.commandData[Triggers.CustomSkin]
            .triggers[skinIndex][propName].stroke = skinDataJSON.stroke;
        }
      }
    });
  }
}
