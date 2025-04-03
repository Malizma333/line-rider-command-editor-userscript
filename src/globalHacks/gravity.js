window.setCustomGravity = (function() {
  const numIters = window.store.getState().simulator.engine.getFrame(0).snapshot.entities[0].entities[0].points.length;
  let init = false;
  let numRiders = window.store.getState().simulator.engine.engine.state.riders.length;
  let currentIter = 0;
  let currentRider = 0;
  let mapping = {};
  let triggerIndices = [];

  window.store.subscribe(() => {
    if (numRiders !== window.store.getState().simulator.engine.engine.state.riders.length) {
      reset();
    }
  });

  /**
   * Resets physics and camera frame caches
   */
  function reset() {
    window.store.dispatch({ type: "STOP_PLAYER" });

    numRiders = window.store.getState().simulator.engine.engine.state.riders.length;
    currentIter = 0;
    currentRider = 0;

    for (let i = 0; i < triggerIndices.length; i++) {
      triggerIndices[i] = 0;
    }

    window.requestAnimationFrame(() => {
      window.store.getState().camera.playbackFollower._frames.length = 0;
      window.store.getState().simulator.engine.engine._computed._frames.length = 1;
    });
  }

  /**
   * Called by gravity get method, retrieves computed gravity for the current physics frame
   * @returns Gravity vector for the current subiteration
   */
  function getGravity() {
    const triggers = mapping[currentRider];

    if (triggers.length === 0) {
      return { x: 0, y: 0.175 };
    }

    const currentFrame = window.store.getState().simulator.engine.engine._computed._frames.length - 1;
    let gravity = triggers[triggerIndices[currentRider]][1];

    if (
      triggerIndices[currentRider] < triggers.length - 1 &&
      triggers[triggerIndices[currentRider] + 1][0] <= currentFrame
    ) {
      triggerIndices[currentRider] += 1;
      gravity = triggers[triggerIndices[currentRider]][1];
    }

    if ((
      triggerIndices[currentRider] < triggers.length - 1 &&
      !(
        triggers[triggerIndices[currentRider]][0] <= currentFrame &&
        currentFrame < triggers[triggerIndices[currentRider] + 1][0]
      )
    ) || (
      triggerIndices[currentRider] === triggers.length - 1 &&
      !(
        triggers[triggerIndices[currentRider]][0] <= currentFrame
      )
    )) {
      let low = 0;
      let high = triggers.length - 1;
      while (low < high) {
        const mid = Math.ceil((high + low) / 2);

        if (currentFrame < triggers[mid][0]) {
          high = mid - 1;
        } else {
          low = mid;
        }
      }

      triggerIndices[currentRider] = low;
      gravity = triggers[triggerIndices[currentRider]][1];
    }

    if (gravity === undefined) {
      gravity = { x: 0, y: 0.175 };
    }

    currentIter += 1;

    if (currentIter === numIters) {
      currentIter = 0;
      currentRider += 1;
    }

    if (currentRider === numRiders) {
      currentRider = 0;
    }

    return gravity;
  }

  return function(newTriggers) {
    mapping = {};
    triggerIndices = [];
    for (let i = 0; i < newTriggers.length; i++) {
      const riderTriggers = newTriggers[i];
      mapping[i] = [];
      triggerIndices.push(0);
      for (const trigger of riderTriggers) {
        mapping[i].push([
          trigger[0][0] * 2400 + trigger[0][1] * 40 + trigger[0][2],
          trigger[1], // This is a reference, be careful
        ]);
      }
    }

    reset();

    if (!init) {
      init = true;
      Object.defineProperty(window.$ENGINE_PARAMS, "gravity", { get: getGravity });
    }
  };
})();
