# Line Rider Command Editor Mod

## Background Information

This is a userscript for linerider.com meant to add user-interface functionality to the many hidden features blocked behind console commands. Currently, it supports adding camera controls (zooming, panning, rider focus) and time remapping, but there are plans to add more features in the future such as layer automation and rider skin customization.

This is the repository that actually hosts all of the code, not the place to download it. For the proper download, please go [here](https://github.com/Malizma333/linerider-userscript-mods) and follow the userscript install instructions.

## User Guide

To start out, there should a plus sign that appears in the top left of the screen.
Clicking on it will expand the window. Clicking on it again will collapse the window.

### Main Buttons
- The `Read` button will parse the currently loaded track script (located in settings -> advanced) into trigger data
- The `Commit` button will convert trigger data back into an executable track script
- The text field represents the error field, and will notify if there was any error reading or committing.
- The tabs at the top are the various commands that have trigger support
  - There is also a smoothing/interpolation tab for the specific command tab that is loaded

### Tabs
- The `Zoom` tab has triggers that zoom the camera in and out
- The `Camera Pan` tab has triggers that offset the camera from bosh and expand the collision boxes of the camera
- The `Camera Focus` tab has triggers that specify (in the case of multiple riders) which riders the camera should focus on
- The `Time Remap` tab has triggers that slow down or speed up the timeline for a certain period of time

### Triggers
- Each trigger has a time stamp associated with that specific trigger. This timestamp coresponds with the timeline located at the bottom of the screen.
  - Timestamp values range from **00:00:00** to **99:59:39**, where the time represents [minutes]:[seconds]:[frames]
  - Each successive trigger will start after the previous trigger finishes
- Zoom triggers have a zoom level that affects the camera's view dimensions
  - Larger numbers zoom further in, while smaller numbers zoom further out
  - Zoom ranged from **-50** to **50**
- Camera Pan triggers have a width and height that affect the bounding box, and an x and y offset from the central position
  - Advanced camera info can be viewed by going to settings -> playback camera and entering the appropriate resolution
  - Width and height of the bounding box range from **0** to **2**
  - X and y offsets range from **-100** to **100**
