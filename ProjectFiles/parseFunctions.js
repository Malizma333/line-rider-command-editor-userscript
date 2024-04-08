/* Group of functions for custom data validation */

// Parses the script by checking for a command header keyword and verifying it's in a valid format

let parseCommand = (command, currentData, scriptCopy) => {};
let parseSmoothing = (command, currentData, smoothingValue) => {};
let adjustTimestamps = (commandArray) => {};
let parseSkinCss = (skinCSSArray) => {};
let parseProp = (propString, object) => {};

parseCommand = (command, currentData, scriptCopy) => {
  const currentHeader = commandDataTypes[command].header.split('(')[0];
  const currentHeaderIndex = scriptCopy.indexOf(currentHeader);
  let currentCommand = currentData[command];

  if (currentHeaderIndex === -1) return currentCommand;

  const startIndex = currentHeaderIndex + currentHeader.length + 1;
  let endIndex = startIndex;

  for (let i = 1; i > 0 || endIndex >= scriptCopy.length; endIndex += 1) {
    if (scriptCopy.charAt(endIndex + 1) === '(') i += 1;
    if (scriptCopy.charAt(endIndex + 1) === ')') i -= 1;
  }

  const parameterText = `[${scriptCopy.substring(startIndex, endIndex)}]`;
  const parameterArray = JSON.parse(parameterText);
  const [keyframes, smoothing] = parameterArray;

  switch (command) {
    case Triggers.Zoom:
    case Triggers.CameraPan:
    case Triggers.CameraFocus:
    case Triggers.TimeRemap:
      currentCommand.triggers = adjustTimestamps(keyframes);
      currentCommand = parseSmoothing(command, currentData, smoothing);
      break;
    case Triggers.CustomSkin:
      currentCommand.triggers = parseSkinCss(keyframes);
      break;
    default:
      break;
  }

  return currentCommand;
};

// Parses smoothing specifically by checking if the value exists and type

parseSmoothing = (command, currentData, smoothingValue) => {
  const currentCommand = currentData[command];
  if (command === Triggers.TimeRemap) {
    const constraints = constraintProps.interpolateProps;

    if (!smoothingValue) {
      currentCommand.interpolate = constraints.default;
      return currentCommand;
    }

    if (smoothingValue === true || smoothingValue === false) {
      currentCommand.interpolate = smoothingValue;
    } else {
      throw new Error('Invalid boolean!');
    }
  } else {
    const constraints = constraintProps.smoothProps;

    if (!smoothingValue) {
      currentCommand.interpolate = constraints.default;
      return currentCommand;
    }

    if (Number.isNaN(smoothingValue)) {
      throw new Error('Invalid integer!');
    }

    if (smoothingValue > constraints.max) {
      currentCommand.smoothing = constraints.max;
    } else if (smoothingValue < constraints.min) {
      currentCommand.smoothing = constraints.min;
    } else {
      currentCommand.smoothing = smoothingValue;
    }
  }

  return currentCommand;
};

// Adjusts each of the time stamps to fit the [M,S,F] format

adjustTimestamps = (commandArray) => {
  const newCommandArray = [];
  for (let i = 0; i < commandArray.length; i += 1) {
    const timeList = commandArray[i][0];
    newCommandArray.push([...commandArray[i]]);

    if (timeList.constructor === Number) {
      newCommandArray[i][0] = [0, 0, timeList];
    } else if (timeList.length === 1) {
      newCommandArray[i][0] = [0, 0, timeList[0]];
    } else if (timeList.length === 2) {
      newCommandArray[i][0] = [0, timeList[0], timeList[1]];
    }
  }

  return newCommandArray;
};

// Parses each of the skin css codes in a custom riders command

parseSkinCss = (skinCSSArray) => {
  const skinJSONArray = [];

  skinCSSArray.forEach((skinCSS) => {
    let template = Object.assign(commandDataTypes.CustomSkin.template, {});
    let depth = 0;
    let zeroIndex = 0;

    for (let i = 0; i < skinCSS.length; i += 1) {
      if (skinCSS.charAt(i) === '{') depth += 1;
      if (skinCSS.charAt(i) === '}') {
        depth -= 1;
        if (depth === 0) {
          template = parseProp(skinCSS.substring(zeroIndex, i + 1).replace(/\s/g, ''), template);
          zeroIndex = i + 1;
        }
      }
    }

    skinJSONArray.push(template);
  });

  skinJSONArray.push(skinJSONArray.shift());

  return skinJSONArray;
};

// Looks through each css property keyword and associates them with a JSON compatible keyword

parseProp = (propString, object) => {
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

  const newObject = Object.assign(object, {});

  Object.keys(cssPropKeywords).forEach((key) => {
    if (propString.startsWith(key)) {
      const skinDataString = propString.substring(key.length).replace(wordRegex, '"$2"').replace(';', ',');
      const skinDataJSON = JSON.parse(skinDataString);
      const propName = cssPropKeywords[key];

      if ('fill' in skinDataJSON) {
        newObject[propName].fill = skinDataJSON.fill;
      }

      if ('stroke' in skinDataJSON) {
        newObject[propName].stroke = skinDataJSON.stroke;
      }
    }
  });

  return newObject;
};
