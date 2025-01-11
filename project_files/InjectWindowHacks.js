window.setCustomGravity = (function () {
  const numIters = window.store.getState().simulator.engine.getFrame(0).snapshot.entities[0].entities[0].points.length;

  let init = false;
  let numRiders = window.store.getState().simulator.engine.engine.state.riders.length;
  let triggerIndex = 0;
  let nextFrame = 0;
  let current = {
    iter: 0,
    rider: 0,
    frame: 0
  };
  let triggers = [];

  function getTriggerFrame(i) {
    return triggers[i][0][0] * 2400 + triggers[i][0][1] * 40 + triggers[i][0][2];
  }

  function reset() {
    window.store.dispatch({ type: "STOP_PLAYER" });
    numRiders = window.store.getState().simulator.engine.engine.state.riders.length;
    triggerIndex = 0;
    nextFrame = 0;
    current.iter = 0;
    current.rider = 0;
    current.frame = 0;
  
    if (triggers.length > 1) {
      nextFrame = getTriggerFrame(triggerIndex + 1);
    }

    window.requestAnimationFrame(() => {
      window.store.getState().camera.playbackFollower._frames.length = 0
      window.store.getState().simulator.engine.engine._computed._frames.length = 1
    });
  }

  function getGravity() {
    if (current.frame === nextFrame) {
      triggerIndex += 1;
      if (triggerIndex < triggers.length - 1) {
        nextFrame = getTriggerFrame(triggerIndex + 1);
      }
    }

    let gravity = triggers[triggerIndex][1][current.iter];

    if (triggerIndex === triggers.length - 1) {
      return gravity;
    }

    current.iter += 1;

    if (current.iter === numIters) {
      current.iter = 0;
      current.rider += 1;
    }

    if (current.rider === numRiders) {
      current.rider = 0;
      current.frame += 1;
    }

    return gravity;
  }

  return function(newTriggers) {
    triggers = newTriggers;
    reset();

    if (init) {
      return;
    }

    init = true;
    Object.defineProperty(window.$ENGINE_PARAMS, "gravity", { get: getGravity });
  }
})();
