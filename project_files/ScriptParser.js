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
        ScriptParser.parseTriggers(command, keyframes);
        ScriptParser.parseSmoothing(command, smoothing);
        break;
      case Constants.TRIGGER_TYPES.SKIN:
        ScriptParser.parseSkinCss(keyframes);
        break;
      default:
        break;
    }
  }

  static retrieveTimestamp(index) {
    const frames = index % Constants.TIMELINE.FPS;
    const seconds = Math.floor(index / Constants.TIMELINE.FPS) % Constants.TIMELINE.SPM;
    const minutes = Math.floor(index / (Constants.TIMELINE.SPM * Constants.TIMELINE.FPS));
    return [minutes, seconds, frames];
  }

  static parseTriggers(command, commandArray) {
    for (let i = 0; i < commandArray.length; i += 1) {
      ScriptParser.triggerData[command].triggers.push([...commandArray[i]]);

      const timeProp = commandArray[i][0];
      if (timeProp.constructor === Number) {
        const index = timeProp;
        ScriptParser.triggerData[command].triggers[i][0] = ScriptParser.retrieveTimestamp(index);
      } else if (timeProp.length === 1) {
        const index = timeProp[0];
        ScriptParser.triggerData[command].triggers[i][0] = ScriptParser.retrieveTimestamp(index);
      } else if (timeProp.length === 2) {
        const index = timeProp[0] * Constants.TIMELINE.FPS + timeProp[1];
        ScriptParser.triggerData[command].triggers[i][0] = ScriptParser.retrieveTimestamp(index);
      } else {
        const index = timeProp[0] * Constants.TIMELINE.FPS * Constants.TIMELINE.SPM
         + timeProp[1] * Constants.TIMELINE.FPS + timeProp[2];
        ScriptParser.triggerData[command].triggers[i][0] = ScriptParser.retrieveTimestamp(index);
      }
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

  static parseSkinProp(cssString, skinIndex) {
    const wordRegex = /(['"])?([#]?[a-z0-9A-Z_-]+)(['"])?/g;
    const cssPropKeywords = Constants.TRIGGER_PROPS[Constants.TRIGGER_TYPES.SKIN].STYLE_MAP;

    Object.entries(cssPropKeywords).forEach(([propName, cssSelector]) => {
      if (!cssString.startsWith(cssSelector)) return;
      const styleData = JSON.parse(cssString
        .substring(cssSelector.length)
        .replace(wordRegex, '"$2"')
        .replace(';', ','));

      if (styleData.fill !== undefined) {
        ScriptParser.triggerData[Constants.TRIGGER_TYPES.SKIN]
          .triggers[skinIndex][propName].fill = styleData.fill;
      }

      if (styleData.stroke !== undefined) {
        ScriptParser.triggerData[Constants.TRIGGER_TYPES.SKIN]
          .triggers[skinIndex][propName].stroke = styleData.stroke;
      }
    });
  }
}
