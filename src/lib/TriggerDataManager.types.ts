export type PathValue = object | number | string | boolean
export interface HistoryItem {
  modificationPath: string[]
  oldValue: PathValue
  activeTab: TRIGGER_ID
}

export type TriggerTime = [number, number, number]

export type ZoomTrigger = [TriggerTime, number] & { __zoom: boolean };
export type CameraPanTrigger = [TriggerTime, { w: number, h: number, x: number, y: number }]
export type CameraFocusTrigger = [TriggerTime, number[]]
export type TimeRemapTrigger = [TriggerTime, number] & { __time: boolean };
export type GravityTrigger = [TriggerTime, { x: number, y: number }]
export type LayerTrigger = [TriggerTime, {on: number, off: number, offset: number}]
export type SkinCssTrigger = Record<string, { stroke?: string, fill?: string }>;

export type TimedTrigger =
  ZoomTrigger |
  CameraPanTrigger |
  CameraFocusTrigger |
  TimeRemapTrigger |
  GravityTrigger |
  LayerTrigger

export type Trigger = TimedTrigger | SkinCssTrigger

export enum TRIGGER_ID {
  ZOOM = "ZOOM",
  PAN = "CAMERA_PAN",
  FOCUS = "CAMERA_FOCUS",
  TIME = "TIME_REMAP",
  SKIN = "CUSTOM_SKIN",
  GRAVITY = "GRAVITY",
  LAYER = "LAYER"
}

interface BaseTriggerData<Type> {
  id: string;
  triggers: Type;
}

type TriggerData<Type> = Type extends (infer TriggerType)[] ?
    TriggerType extends TimeRemapTrigger ?
    BaseTriggerData<Type> & {
      interpolate: boolean;
    }
    : TriggerType extends ZoomTrigger | CameraPanTrigger | CameraFocusTrigger
    ? BaseTriggerData<Type> & {
      smoothing: number;
    }
    : BaseTriggerData<Type>
  : Type extends Record<number, (infer TriggerType)[]> ?
    TriggerType extends LayerTrigger ?
      BaseTriggerData<Type> & {
        interpolate: boolean;
      }
      : BaseTriggerData<Type>
  : BaseTriggerData<Type>

interface TriggerMetadata<Type> {
  readonly DISPLAY_NAME: string
  readonly FUNC?: string
  readonly TEMPLATE: Type
}

type GenericTriggerDataLookup = Record<TRIGGER_ID, TriggerData<Trigger[] | Trigger[][] | Record<number, Trigger[]>>>

export interface TriggerDataLookup extends GenericTriggerDataLookup {
  [TRIGGER_ID.ZOOM]: TriggerData<ZoomTrigger[]>
  [TRIGGER_ID.PAN]: TriggerData<CameraPanTrigger[]>
  [TRIGGER_ID.FOCUS]: TriggerData<CameraFocusTrigger[]>
  [TRIGGER_ID.TIME]: TriggerData<TimeRemapTrigger[]>
  [TRIGGER_ID.SKIN]: TriggerData<SkinCssTrigger[]>
  [TRIGGER_ID.GRAVITY]: TriggerData<GravityTrigger[][]>
  [TRIGGER_ID.LAYER]: TriggerData<Record<number, LayerTrigger[]>>
}

type GenericTriggerMetadataLookup = Record<TRIGGER_ID, TriggerMetadata<Trigger | Trigger[]>>

export interface TriggerMetadataLookup extends GenericTriggerMetadataLookup {
  [TRIGGER_ID.ZOOM]: TriggerMetadata<ZoomTrigger>
  [TRIGGER_ID.PAN]: TriggerMetadata<CameraPanTrigger>
  [TRIGGER_ID.FOCUS]: TriggerMetadata<CameraFocusTrigger>
  [TRIGGER_ID.TIME]: TriggerMetadata<TimeRemapTrigger>
  [TRIGGER_ID.SKIN]: TriggerMetadata<SkinCssTrigger>
  [TRIGGER_ID.GRAVITY]: TriggerMetadata<GravityTrigger>
  [TRIGGER_ID.LAYER]: TriggerMetadata<LayerTrigger>
}
