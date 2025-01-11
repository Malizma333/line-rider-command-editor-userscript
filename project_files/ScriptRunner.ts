function executeScript (command: TRIGGER_ID, triggerData: TriggerData): void {
  const currentData = triggerData[command]

  switch (command) {
    case TRIGGER_ID.ZOOM:
      window.getAutoZoom = window.createZoomer(currentData.triggers, currentData.smoothing);
      break;
    case TRIGGER_ID.PAN:
      window.getCamBounds = window.createBoundsPanner(currentData.triggers, currentData.smoothing);
      break;
    case TRIGGER_ID.FOCUS:
      window.getCamFocus = window.createFocuser(currentData.triggers, currentData.smoothing);
      break;
    case TRIGGER_ID.TIME:
      window.timeRemapper = window.createTimeRemapper(currentData.triggers, currentData.interpolate);
      break;
    case TRIGGER_ID.SKIN:
      window.setCustomRiders(currentData.triggers);
      break;
    case TRIGGER_ID.GRAVITY:
      if (window.setCustomGravity !== undefined) {
        window.setCustomGravity(currentData.triggers);
      }
      break;
    default:
      break;
  }
}