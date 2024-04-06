function validateData(valueChange, constraints, bounded) {
  if (!constraints) return valueChange.new;

  switch (constraints.type) {
    case constraintTypes.bool: {
      return valueChange.new;
    }

    case constraintTypes.int: {
      return validateInteger(valueChange, constraints, bounded);
    }

    case constraintTypes.float: {
      return validateFloat(valueChange, constraints, bounded);
    }

    default: return valueChange.prev;
  }
}

function validateInteger(valueChange, constraints, bounded) {
  const prevValue = valueChange.prev;
  const newValue = valueChange.new;

  if (newValue.trim() === '') {
    return 0;
  }

  const parsedValue = Math.floor(Number(newValue));

  if (isNaN(parsedValue)) {
    return prevValue;
  }

  if (newValue.includes('.')) {
    return prevValue;
  }

  if (!bounded) {
    return parsedValue;
  }

  if (parsedValue < constraints.min) {
    return constraints.min;
  }

  if (parsedValue > constraints.max) {
    return constraints.max;
  }

  return parsedValue;
}

function validateFloat(valueChange, constraints, bounded) {
  const prevValue = valueChange.prev;
  const newValue = valueChange.new;

  if (newValue.trim() === '') {
    return 0.0;
  }

  const parsedValue = Number(newValue);

  if (isNaN(parsedValue)) {
    return prevValue;
  }

  if (!bounded) {
    if (newValue.includes('.')) {
      return newValue;
    }

    return parsedValue;
  }

  if (parsedValue < constraints.min) {
    return constraints.min;
  }

  if (parsedValue > constraints.max) {
    return constraints.max;
  }

  return parsedValue;
}

function validateTimeStamps(triggerData) {
  const commands = Object.keys(triggerData);

  commands.forEach((command) => {
    if (command === Triggers.CustomSkin) return;

    const { triggers } = triggerData[command];

    for (let i = 0; i < triggers.length - 1; i++) {
      const time1 = triggers[i][0];
      const time2 = triggers[i + 1][0];

      if ((time1[0] * secondsInMinute + time1[1]) * fps + time1[2] < (time2[0] * secondsInMinute + time2[1]) * fps + time2[2]) {
        continue;
      }

      time2[0] = time1[0];
      time2[1] = time1[1];
      time2[2] = time1[2] + 1;

      if (time2[2] === fps) {
        time2[2] = 0;
        time2[1] += 1;
      }

      if (time2[1] === secondsInMinute) {
        time2[1] = 0;
        time2[0] += 1;
      }
    }
  });
}

function formatSkins(customSkinData) {
  const customSkinStrings = customSkinData.map((customSkin) => `
      .outline {stroke: ${customSkin.outline.stroke}}
      .skin {fill: ${customSkin.skin.fill}}
      .hair {fill: ${customSkin.hair.fill}}
      .fill {fill: ${customSkin.fill.fill}}
      #eye {fill: ${customSkin.eye.fill}}
      .sled {fill: ${customSkin.sled.fill}}
      #string {stroke: ${customSkin.string.stroke}}
      .arm .sleeve {fill: ${customSkin.armSleeve.fill}}
      .arm .hand {fill: ${customSkin.armHand.fill}}
      .leg .pants {fill: ${customSkin.legPants.fill}}
      .leg .foot {fill: ${customSkin.legFoot.fill}}
      .torso {fill: ${customSkin.torso.fill}}
      .scarf1 {fill: ${customSkin.scarf1.fill}}
      .scarf2 {fill: ${customSkin.scarf2.fill}}
      .scarf3 {fill: ${customSkin.scarf3.fill}}
      .scarf4 {fill: ${customSkin.scarf4.fill}}
      .scarf5 {fill: ${customSkin.scarf5.fill}}
      #scarf0 {fill: ${customSkin._scarf0.fill}}
      #scarf1 {fill: ${customSkin._scarf1.fill}}
      #scarf2 {fill: ${customSkin._scarf2.fill}}
      #scarf3 {fill: ${customSkin._scarf3.fill}}
      #scarf4 {fill: ${customSkin._scarf4.fill}}
      #scarf5 {fill: ${customSkin._scarf5.fill}}
      .hat .top {fill: ${customSkin.hatTop.fill}}
      .hat .bottom {stroke: ${customSkin.hatBottom.stroke}}
      .hat .ball {fill: ${customSkin.hatBall.fill}}
      .flag {fill: ${customSkin.flag.fill}}
    `.replace(/\n/g, ''));

  customSkinStrings.unshift(customSkinStrings.pop());

  return JSON.stringify(customSkinStrings);
}
