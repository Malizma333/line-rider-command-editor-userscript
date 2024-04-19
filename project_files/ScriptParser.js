// eslint-disable-next-line no-unused-vars
class ScriptParser {
  static initCommand(command) {
    ScriptParser.triggerData[command] = {
      id: command,
      triggers: [],
    };

    switch (command) {
      case Constants.TRIGGER_TYPES.FOCUS:
      case Constants.TRIGGER_TYPES.PAN:
      case Constants.TRIGGER_TYPES.ZOOM:
        ScriptParser.triggerData[command].smoothing = Constants.CONSTRAINTS.SMOOTH.DEFAULT;
        break;
      case Constants.TRIGGER_TYPES.TIME:
        ScriptParser.triggerData[command].interpolate = Constants.CONSTRAINTS.INTERPOLATE.DEFAULT;
        break;
      default:
        break;
    }
  }

  static parseScript(scriptText) {
    ScriptParser.triggerData = {};
    const trimmedScript = scriptText.replace(/\s/g, '');

    Object.keys(Constants.TRIGGER_PROPS).forEach((command) => {
      try {
        ScriptParser.parseCommand(command, trimmedScript);
      } catch (e) {
        if (ScriptParser.triggerData[command] !== undefined) {
          delete ScriptParser.triggerData[command];
        }
      }
    });

    return ScriptParser.triggerData;
  }

  static parseCommand(command, script) {
    const currentHeader = Constants.TRIGGER_PROPS[command].FUNC.split('(')[0];
    const currentHeaderIndex = script.indexOf(currentHeader);

    if (currentHeaderIndex === -1) return;

    ScriptParser.initCommand(command);

    const startIndex = currentHeaderIndex + currentHeader.length + 1;
    let endIndex = startIndex;

    for (let i = 1; i > 0 || endIndex >= script.length; endIndex += 1) {
      if (script.charAt(endIndex + 1) === '(') i += 1;
      if (script.charAt(endIndex + 1) === ')') i -= 1;
    }

    const parameterText = `[${script.substring(startIndex, endIndex)}]`;
    // HACK: Using eval is easier than json.parse, which has stricter syntax
    // eslint-disable-next-line no-eval
    const parameterArray = eval(parameterText);
    const [keyframes, smoothing] = parameterArray;

    switch (command) {
      case Constants.TRIGGER_TYPES.ZOOM:
      case Constants.TRIGGER_TYPES.PAN:
      case Constants.TRIGGER_TYPES.FOCUS:
      case Constants.TRIGGER_TYPES.TIME:
        ScriptParser.addTriggers(command, keyframes);
        ScriptParser.parseSmoothing(command, smoothing);
        break;
      case Constants.TRIGGER_TYPES.SKIN:
        ScriptParser.parseSkinCss(keyframes);
        break;
      default:
        break;
    }
  }

  static parseSmoothing(command, smoothingValue) {
    if (command === Constants.TRIGGER_TYPES.TIME) {
      const constraints = Constants.CONSTRAINTS.INTERPOLATE;

      if (!smoothingValue) {
        ScriptParser.triggerData[command].interpolate = constraints.DEFAULT;
        return;
      }

      if (smoothingValue === true || smoothingValue === false) {
        ScriptParser.triggerData[command].interpolate = smoothingValue;
      } else {
        throw new Error('Invalid boolean!');
      }
    } else {
      const constraints = Constants.CONSTRAINTS.SMOOTH;

      if (!smoothingValue) {
        ScriptParser.triggerData[command].interpolate = constraints.DEFAULT;
        return;
      }

      if (Number.isNaN(smoothingValue)) {
        throw new Error('Invalid integer!');
      }

      if (smoothingValue > constraints.MAX) {
        ScriptParser.triggerData[command].smoothing = constraints.MAX;
      } else if (smoothingValue < constraints.MIN) {
        ScriptParser.triggerData[command].smoothing = constraints.MIN;
      } else {
        ScriptParser.triggerData[command].smoothing = smoothingValue;
      }
    }
  }

  static addTriggers(command, commandArray) {
    for (let i = 0; i < commandArray.length; i += 1) {
      ScriptParser.triggerData[command].triggers.push([...commandArray[i]]);

      const timeProp = commandArray[i][0];
      if (timeProp.constructor === Number) {
        ScriptParser.triggerData[command].triggers[i][0] = [0, 0, timeProp];
      } else if (timeProp.length === 1) {
        ScriptParser.triggerData[command].triggers[i][0] = [0, 0, timeProp[0]];
      } else if (timeProp.length === 2) {
        ScriptParser.triggerData[command].triggers[i][0] = [0, timeProp[0], timeProp[1]];
      }
    }
  }

  static parseSkinCss(skinCSSArray) {
    skinCSSArray.forEach((skinCSS, skinIndex) => {
      ScriptParser.triggerData[Constants.TRIGGER_TYPES.SKIN].triggers.push(
        structuredClone(Constants.TRIGGER_PROPS[Constants.TRIGGER_TYPES.SKIN].TEMPLATE),
      );
      let depth = 0;
      let zeroIndex = 0;

      for (let i = 0; i < skinCSS.length; i += 1) {
        if (skinCSS.charAt(i) === '{') depth += 1;
        if (skinCSS.charAt(i) === '}') {
          depth -= 1;
          if (depth === 0) {
            ScriptParser.parseSkinProp(
              skinCSS.substring(zeroIndex, i + 1).replace(/\s/g, ''),
              skinIndex,
            );
            zeroIndex = i + 1;
          }
        }
      }
    });

    ScriptParser.triggerData[Constants.TRIGGER_TYPES.SKIN].triggers.push(
      ScriptParser.triggerData[Constants.TRIGGER_TYPES.SKIN].triggers.shift(),
    );
  }

  static parseSkinProp(propString, skinIndex) {
    const wordRegex = /(['"])?([#]?[a-z0-9A-Z_-]+)(['"])?/g;
    const cssPropKeywords = { // TODO: Refactor?
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
          ScriptParser.triggerData[Constants.TRIGGER_TYPES.SKIN]
            .triggers[skinIndex][propName].fill = skinDataJSON.fill;
        }

        if ('stroke' in skinDataJSON) {
          ScriptParser.triggerData[Constants.TRIGGER_TYPES.SKIN]
            .triggers[skinIndex][propName].stroke = skinDataJSON.stroke;
        }
      }
    });
  }
}
