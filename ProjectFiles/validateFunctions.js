// Utility class to validate various forms of data

class Validator {
  static validateData(valueChange, constraints, bounded) {
    if (!constraints) return valueChange.new;

    switch (constraints.TYPE) {
      case CONSTANTS.TYPES.BOOL: {
        return valueChange.new;
      }

      case CONSTANTS.TYPES.INT: {
        return this.validateInteger(valueChange, constraints, bounded);
      }

      case CONSTANTS.TYPES.FLOAT: {
        return this.validateFloat(valueChange, constraints, bounded);
      }

      default: return valueChange.prev;
    }
  }

  static validateInteger(valueChange, constraints, bounded) {
    const prevValue = valueChange.prev;
    const newValue = valueChange.new;

    if (newValue.trim() === '') {
      return 0;
    }

    const parsedValue = Math.floor(Number(newValue));

    if (Number.isNaN(parsedValue)) {
      return prevValue;
    }

    if (newValue.includes('.')) {
      return prevValue;
    }

    if (!bounded) {
      return parsedValue;
    }

    if (parsedValue < constraints.MIN) {
      return constraints.MIN;
    }

    if (parsedValue > constraints.MAX) {
      return constraints.MAX;
    }

    return parsedValue;
  }

  static validateFloat(valueChange, constraints, bounded) {
    const prevValue = valueChange.prev;
    const newValue = valueChange.new;

    if (newValue.trim() === '') {
      return 0.0;
    }

    const parsedValue = Number(newValue);

    if (Number.isNaN(parsedValue)) {
      return prevValue;
    }

    if (!bounded) {
      if (newValue.includes('.')) {
        return newValue;
      }

      return parsedValue;
    }

    if (parsedValue < constraints.MIN) {
      return constraints.MIN;
    }

    if (parsedValue > constraints.MAX) {
      return constraints.MAX;
    }

    return parsedValue;
  }

  static validateTimes(commandData) {
    const { triggers } = commandData;

    for (let i = 0; i < triggers.length - 1; i += 1) {
      const time1 = triggers[i][0];
      const time2 = triggers[i + 1][0];
      const index1 = (
        time1[0] * CONSTANTS.TIMELINE.SPM + time1[1]
      ) * CONSTANTS.TIMELINE.FPS + time1[2];
      const index2 = (
        time2[0] * CONSTANTS.TIMELINE.SPM + time2[1]
      ) * CONSTANTS.TIMELINE.FPS + time2[2];

      if (index1 >= index2) {
        const [minute, second, frame] = time1;
        time2[0] = minute;
        time2[1] = second;
        time2[2] = frame + 1;

        if (time2[2] === CONSTANTS.TIMELINE.FPS) {
          time2[2] = 0;
          time2[1] += 1;
        }

        if (time2[1] === CONSTANTS.TIMELINE.SPM) {
          time2[1] = 0;
          time2[0] += 1;
        }

        triggers[i + 1][0] = time2;
      }
    }

    return triggers;
  }

  static formatSkins(customSkinData) {
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
        #scarf0 {fill: ${customSkin.id_scarf0.fill}}
        #scarf1 {fill: ${customSkin.id_scarf1.fill}}
        #scarf2 {fill: ${customSkin.id_scarf2.fill}}
        #scarf3 {fill: ${customSkin.id_scarf3.fill}}
        #scarf4 {fill: ${customSkin.id_scarf4.fill}}
        #scarf5 {fill: ${customSkin.id_scarf5.fill}}
        .hat .top {fill: ${customSkin.hatTop.fill}}
        .hat .bottom {stroke: ${customSkin.hatBottom.stroke}}
        .hat .ball {fill: ${customSkin.hatBall.fill}}
        .flag {fill: ${customSkin.flag.fill}}
      `.replace(/\n/g, ''));

    customSkinStrings.unshift(customSkinStrings.pop());

    return JSON.stringify(customSkinStrings);
  }
}
