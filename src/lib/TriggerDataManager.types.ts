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
  ZOOM = 'ZOOM',
  PAN = 'CAMERA_PAN',
  FOCUS = 'CAMERA_FOCUS',
  TIME = 'TIME_REMAP',
  SKIN = 'CUSTOM_SKIN',
  GRAVITY = 'GRAVITY'
}

export type PathValue = object | number | string | boolean
export interface HistoryItem {
  modificationPath: string[],
  oldValue: PathValue,
  activeTab: TRIGGER_ID
}

interface TriggerData {
  id: string
  triggers: Trigger[]
  smoothing?: number
  interpolate?: boolean
}

interface TriggerMetadata<Type> {
  readonly DISPLAY_NAME: string
  readonly FUNC?: string
  TEMPLATE: Type
}

export interface TriggerDataLookup {
  [TRIGGER_ID.ZOOM]: TriggerData
  [TRIGGER_ID.PAN]: TriggerData
  [TRIGGER_ID.FOCUS]: TriggerData
  [TRIGGER_ID.TIME]: TriggerData
  [TRIGGER_ID.SKIN]: TriggerData
  [TRIGGER_ID.GRAVITY]: TriggerData
}

export interface TriggerMetadataLookup {
  [TRIGGER_ID.ZOOM]: TriggerMetadata<ZoomTrigger>
  [TRIGGER_ID.PAN]: TriggerMetadata<CameraPanTrigger>
  [TRIGGER_ID.FOCUS]: TriggerMetadata<CameraFocusTrigger>
  [TRIGGER_ID.TIME]: TriggerMetadata<TimeRemapTrigger>
  [TRIGGER_ID.SKIN]: TriggerMetadata<SkinCssTrigger>
  [TRIGGER_ID.GRAVITY]: TriggerMetadata<GravityTrigger>
}
