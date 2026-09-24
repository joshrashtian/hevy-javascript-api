import { createHevyClient } from "./client/client";
import type { components, paths } from "./schema";

export type { components, paths };

type Schemas = components["schemas"];

export type Workout = Schemas["Workout"];
export type Exercise = Schemas["Exercise"];
export type Set = Schemas["Set"];
export type Routine = Schemas["Routine"];
export type RoutineFolder = Schemas["RoutineFolder"];
export type ExerciseTemplate = Schemas["ExerciseTemplate"];
export type ExerciseHistoryEntry = Schemas["ExerciseHistoryEntry"];
export type BodyMeasurement = Schemas["BodyMeasurement"];
export type UserInfo = Schemas["UserInfo"];
export type PaginatedWorkoutEvents = Schemas["PaginatedWorkoutEvents"];

export { createHevyClient, HevyError } from "./client/client";
export type {
  HevyClient,
  HevyClientOptions,
  PaginatedWorkouts,
} from "./client/client";
