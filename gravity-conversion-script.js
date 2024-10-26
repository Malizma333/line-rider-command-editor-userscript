(function () {
  window.store.getState().camera.playbackFollower._frames.length = 0
  window.store.getState().simulator.engine.engine._computed._frames.length = 1
  let triggerPointer = 0
  const triggers = JSON.parse("{0}")
  Object.defineProperty(window.$ENGINE_PARAMS, "gravity", { get() {
    if (triggerPointer === triggers.length - 1) {
      return triggers[triggerPointer][1]
    }

    const currentIndex = store.getState().simulator.engine.engine._computed._frames.length
    const nextTime = triggers[triggerPointer + 1][0]
    const nextIndex = nextTime[0] * 40 * 60 + nextTime[1] * 40 + nextTime[2]
    if (nextIndex === currentIndex) {
      triggerPointer += 1
    }

    return triggers[triggerPointer][1]
  }})
})()