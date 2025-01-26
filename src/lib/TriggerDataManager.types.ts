export type Primitive = any

export type TriggerTime = [number, number, number]

export type ZoomTrigger = [TriggerTime, number]
export type CameraPanTrigger = [TriggerTime, { w: number, h: number, x: number, y: number }]
export type CameraFocusTrigger = [TriggerTime, number[]]
export type TimeRemapTrigger = [TriggerTime, number]
export type SkinCssTrigger = Record<string, { stroke?: string, fill?: string }>;
export type GravityTrigger = [TriggerTime, [{ x: number, y: number }]]

export type TimedTrigger = ZoomTrigger | CameraPanTrigger | CameraFocusTrigger | TimeRemapTrigger | GravityTrigger
export type Trigger = TimedTrigger | SkinCssTrigger

export enum TRIGGER_ID {
  ZOOM = "ZOOM",
  PAN = "CAMERA_PAN",
  FOCUS = "CAMERA_FOCUS",
  TIME = "TIME_REMAP",
  SKIN = "CUSTOM_SKIN",
  GRAVITY = "GRAVITY"
}

export interface TriggerMetadata<Type> {
  readonly DISPLAY_NAME: string
  readonly FUNC?: string
  TEMPLATE: Type
}

export interface TriggerDataItem {
  id: string
  triggers: Trigger[]
  smoothing?: number
  interpolate?: boolean
}

export interface TriggerData {
  [TRIGGER_ID.ZOOM]: TriggerDataItem
  [TRIGGER_ID.PAN]: TriggerDataItem
  [TRIGGER_ID.FOCUS]: TriggerDataItem
  [TRIGGER_ID.TIME]: TriggerDataItem
  [TRIGGER_ID.SKIN]: TriggerDataItem
  [TRIGGER_ID.GRAVITY]: TriggerDataItem
}
