(function () {
  window.store.dispatch({ type: "STOP_PLAYER" })
  window.store.dispatch({ type: "SET_PLAYER_INDEX", payload: 0 })
  window.requestAnimationFrame(() => {
    window.store.getState().camera.playbackFollower._frames.length = 0
    window.store.getState().simulator.engine.engine._computed._frames.length = 1

    const numRiders = store.getState().simulator.engine.engine.state.riders.length
    const triggers = JSON.parse("{0}") // Preserve "{0}", as it is checked for in bash script
    let i = 0
    let subitCounter = -1
    let currentFrame = 0
    let nextFrame = triggers.length > 1 ? triggers[1][0][0] * 2400 + triggers[1][0][1] * 40 + triggers[1][0][2] : 0

    Object.defineProperty(window.$ENGINE_PARAMS, "gravity", { get() {
      subitCounter += 1
      if (subitCounter === 17 * numRiders) {
        subitCounter = 0
        currentFrame += 1
      }

      const currentRider = Math.floor(subitCounter / 17) % numRiders

      if (i === triggers.length - 1) {
        return triggers[i][1][currentRider]
      }

      if (nextFrame === currentFrame) {
        i += 1
        if (i < triggers.length - 1) {
          nextFrame = triggers[i + 1][0][0] * 2400 + triggers[i + 1][0][1] * 40 + triggers[i + 1][0][2]
        }
      }

      return triggers[i][1][currentRider]
    }})
  })
})()