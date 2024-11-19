(function () {
  window.store.getState().camera.playbackFollower._frames.length = 0
  window.store.getState().simulator.engine.engine._computed._frames.length = 1
  let triggerPointer = 0
  let iterationCounter = 0
  const numRiders = store.getState().simulator.engine.engine.state.riders.length
  const triggers = JSON.parse("{0}") // Preserve "{0}", as it is checked for in bash script
  Object.defineProperty(window.$ENGINE_PARAMS, "gravity", { get() {
    iterationCounter += 1
    const currentRider = Math.floor(iterationCounter / 17) % numRiders

    if (triggerPointer === triggers.length - 1) {
      return triggers[triggerPointer][1][currentRider]
    }

    const currentIndex = store.getState().simulator.engine.engine._computed._frames.length
    const nextTime = triggers[triggerPointer + 1][0]
    const nextIndex = nextTime[0] * 40 * 60 + nextTime[1] * 40 + nextTime[2]
    if (nextIndex === currentIndex) {
      triggerPointer += 1
    }

    return triggers[triggerPointer][1][currentRider]
  }})
})()