// Line Rider Command Editor - A UI wrapper for linerider.com console commands
// Copyright (C) 2023-2025 Tobias Bessler
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

export type PathValue = object | number | string | boolean;
export interface HistoryItem {
  modificationPath: string[];
  oldValue: PathValue;
  activeTab: TRIGGER_ID;
}

export type TriggerTime = [number, number, number];

export type ZoomTrigger = [TriggerTime, number] & { __zoom: boolean };
export type CameraPanTrigger = [TriggerTime, { w: number; h: number; x: number; y: number; px: number; py: number }];
export type CameraFocusTrigger = [TriggerTime, number[]];
export type TimeRemapTrigger = [TriggerTime, number] & { __time: boolean };
export type GravityTrigger = [TriggerTime, { x: number; y: number }];
export type LayerTrigger = [TriggerTime, { on: number; off: number; offset: number }];
export type SkinCssTrigger = Record<string, { stroke?: string; fill?: string }>;

export type TimedTrigger =
  | ZoomTrigger
  | CameraPanTrigger
  | CameraFocusTrigger
  | TimeRemapTrigger
  | GravityTrigger
  | LayerTrigger;

export type Trigger = TimedTrigger | SkinCssTrigger;

export enum TRIGGER_ID {
  ZOOM = "ZOOM",
  PAN = "CAMERA_PAN",
  FOCUS = "CAMERA_FOCUS",
  TIME = "TIME_REMAP",
  SKIN = "CUSTOM_SKIN",
  GRAVITY = "GRAVITY",
  LAYER = "LAYER",
}

interface BaseTriggerData<Type> {
  id: string;
  triggers: Type;
}

type TriggerData<Type> = Type extends (infer TriggerType)[]
  ? TriggerType extends TimeRemapTrigger ? BaseTriggerData<Type> & {
      interpolate: boolean;
    }
  : TriggerType extends ZoomTrigger | CameraPanTrigger | CameraFocusTrigger ? BaseTriggerData<Type> & {
      smoothing: number;
    }
  : BaseTriggerData<Type>
  : Type extends Record<number, (infer TriggerType)[]> ? TriggerType extends LayerTrigger ? BaseTriggerData<Type> & {
        interpolate: boolean;
      }
    : BaseTriggerData<Type>
  : BaseTriggerData<Type>;

interface TriggerMetadata<Type> {
  readonly DISPLAY_NAME: string;
  readonly FUNC?: string;
  readonly TEMPLATE: Type;
}

type GenericTriggerDataLookup = Record<TRIGGER_ID, TriggerData<Trigger[] | Trigger[][] | Record<number, Trigger[]>>>;

export interface TriggerDataLookup extends GenericTriggerDataLookup {
  [TRIGGER_ID.ZOOM]: TriggerData<ZoomTrigger[]>;
  [TRIGGER_ID.PAN]: TriggerData<CameraPanTrigger[]>;
  [TRIGGER_ID.FOCUS]: TriggerData<CameraFocusTrigger[]>;
  [TRIGGER_ID.TIME]: TriggerData<TimeRemapTrigger[]>;
  [TRIGGER_ID.SKIN]: TriggerData<SkinCssTrigger[]>;
  [TRIGGER_ID.GRAVITY]: TriggerData<GravityTrigger[][]>;
  [TRIGGER_ID.LAYER]: TriggerData<Record<number, LayerTrigger[]>>;
}

type GenericTriggerMetadataLookup = Record<TRIGGER_ID, TriggerMetadata<Trigger | Trigger[]>>;

export interface TriggerMetadataLookup extends GenericTriggerMetadataLookup {
  [TRIGGER_ID.ZOOM]: TriggerMetadata<ZoomTrigger>;
  [TRIGGER_ID.PAN]: TriggerMetadata<CameraPanTrigger>;
  [TRIGGER_ID.FOCUS]: TriggerMetadata<CameraFocusTrigger>;
  [TRIGGER_ID.TIME]: TriggerMetadata<TimeRemapTrigger>;
  [TRIGGER_ID.SKIN]: TriggerMetadata<SkinCssTrigger>;
  [TRIGGER_ID.GRAVITY]: TriggerMetadata<GravityTrigger>;
  [TRIGGER_ID.LAYER]: TriggerMetadata<LayerTrigger>;
}
