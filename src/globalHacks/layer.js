window.createLayerAutomator = (function() {
  let mapping = {};
  let sixty = false;
  let triggerIndex = 0;

  const getVisible = (id, ind) => {
    if (sixty) {
      ind = Math.round(ind * 1.5);
    }

    if (!(id in mapping)) {
      return true;
    }

    const triggers = mapping[id];
    let cycle = triggers[triggerIndex][1];

    if (triggerIndex < triggers.length - 1 && triggers[triggerIndex + 1][0] <= ind) {
      triggerIndex += 1;
      cycle = triggers[triggerIndex][1];
    }

    if (
      triggerIndex < triggers.length - 1 && !(triggers[triggerIndex][0] <= ind && ind < triggers[triggerIndex + 1][0])||
      triggerIndex === triggers.length - 1 && !(triggers[triggerIndex][0] <= ind)
    ) {
      let low = 0;
      let high = triggers.length - 1;
      while (low < high) {
        const mid = Math.ceil((high + low) / 2);

        if (ind < triggers[mid][0]) {
          high = mid - 1;
        } else {
          low = mid;
        }
      }

      triggerIndex = low;
      cycle = triggers[triggerIndex][1];
    }

    if (cycle.off === 0) {
      return true;
    }

    if (cycle.on === 0) {
      return false;
    }

    return (ind + cycle.offset) % (cycle.on + cycle.off) < cycle.on;
  };

  return function(newTriggers, sixtyFps) {
    sixty = sixtyFps;
    mapping = {};

    for (const trigger of newTriggers) {
      if (!(trigger[1].id in mapping)) {
        mapping[trigger[1].id] = [];
      }

      mapping[trigger[1].id].push([
        trigger[0][0] * 2400 + trigger[0][1] * 40 + trigger[0][2],
        { on: trigger[1].on, off: trigger[1].off, offset: trigger[1].offset },
      ]);
    }

    if (window.getLayerVisibleAtTime === undefined) {
      window.getLayerVisibleAtTime = getVisible;
    }
  };
})();
