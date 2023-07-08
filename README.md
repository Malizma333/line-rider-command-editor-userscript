# Line Rider Command Editor Mod

## Background Information

This is a userscript for linerider.com meant to add user-interface functionality to the many hidden features blocked behind console commands. Currently, it supports adding camera controls (zooming, panning, rider focus) and time remapping, but there are plans to add more features in the future such as layer automation, custom gravity, and rider skin customization.

This is the repository that actually hosts all of the code, not the place to download it. For the proper download, please go [here](https://github.com/Malizma333/linerider-userscript-mods) and follow the userscript install instructions.

## User Guide

To start out, there should a plus sign that appears in the top left of the screen.
Clicking on it will expand the window. Clicking on it again will collapse the window.

### Main Buttons
- The `Read` button will parse the currently loaded track script (located in settings -> advanced) into trigger data
- The `Test` button will convert trigger data back into a script and run it, so you can test new triggers
- The `Print` button will convert trigger data back into a script and paste it into the textbox to its left
- The textbox also represents the error field, and will notify if there was any error reading or running code
- The tabs at the top are the various commands that have trigger support

### Tabs
- The `Zoom` tab has triggers that zoom the camera in and out
- The `Pan` tab has triggers that offset the camera from bosh and expand the collision boxes of the camera
- The `Focus` tab has triggers that specify (in the case of multiple riders) which riders the camera should focus on
- The `Speed` tab has triggers that slow down or speed up the timeline for a certain period of time
- The `Smoothing` area has the value of smoothing for the currently focused command tab (interpolation toggle for time remap)

### Triggers
- Triggers can be deleted with the `X` button located at the top right of the trigger
- New triggers can be created with the `+` button located below the last trigger
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
- Camera Focus triggers have a weight property for each rider that relates to how much the camera focuses on that rider
  - The weight ranges from **0** to **1**
  - The dropdown includes as many riders as there are in the loaded track file
- Time Remap triggers have a time scale property that the render engine runs at
  - The time scale ranges from **0.01** to **10**
