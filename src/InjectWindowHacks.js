window.setCustomGravity = (function () {
  const numIters = window.store.getState().simulator.engine.getFrame(0).snapshot.entities[0].entities[0].points.length;
  let init = false;
  let numRiders = window.store.getState().simulator.engine.engine.state.riders.length;
  let currentIter = 0;
  let currentRider = 0;
  let triggers = [];

  window.store.subscribe(() => {
    if (numRiders !== window.store.getState().simulator.engine.engine.state.riders.length) {
      reset();
    }
  });

  function reset() {
    window.store.dispatch({ type: "STOP_PLAYER" });

    numRiders = window.store.getState().simulator.engine.engine.state.riders.length;
    currentIter = 0;
    currentRider = 0;

    window.requestAnimationFrame(() => {
      window.store.getState().camera.playbackFollower._frames.length = 0
      window.store.getState().simulator.engine.engine._computed._frames.length = 1
    });
  }

  function getGravity() {
    if (triggers.length === 0) {
      return { x: 0, y: 0.175 }
    }

    let currentFrame = window.store.getState().simulator.engine.engine._computed._frames.length - 1;
    let gravity = triggers[triggers.length - 1][1][currentRider];

    if (currentFrame < triggers[triggers.length - 1][0]) {
      // Binary search for the proper index... could be cheaper with cache reset detection but i cba
      let low = 0;
      let high = triggers.length - 1;
      while (low < high) {
        let mid = Math.ceil((high + low) / 2);

        if (currentFrame < triggers[mid][0]) {
          high = mid - 1;
        } else {
          low = mid;
        }
      }

      gravity = triggers[low][1][currentRider];
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
    triggers.length = 0;
    for (let i = 0; i < newTriggers.length; i++) {
      triggers.push([
        newTriggers[i][0][0] * 2400 + newTriggers[i][0][1] * 40 + newTriggers[i][0][2],
        newTriggers[i][1] // This is a reference, be careful
      ]);
    }

    reset();

    if (!init) {
      init = true;
      Object.defineProperty(window.$ENGINE_PARAMS, "gravity", { get: getGravity });
    }
  }
})();
