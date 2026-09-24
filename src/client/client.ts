import type { components } from "../schema";

type Schemas = components["schemas"];
type Workout = Schemas["Workout"];
type PaginatedWorkoutEvents = Schemas["PaginatedWorkoutEvents"];
type Routine = Schemas["Routine"];
type RoutineFolder = Schemas["RoutineFolder"];
type ExerciseTemplate = Schemas["ExerciseTemplate"];
type ExerciseHistoryEntry = Schemas["ExerciseHistoryEntry"];
type BodyMeasurement = Schemas["BodyMeasurement"];
type UserInfo = Schemas["UserInfo"];

export type WorkoutInput = Schemas["PostWorkoutsRequestBody"]["workout"];
export type NewRoutineInput = NonNullable<
  Schemas["PostRoutinesRequestBody"]["routine"]
>;
export type RoutineUpdateInput = NonNullable<
  Schemas["PutRoutinesRequestBody"]["routine"]
>;
export type RoutineFolderInput = NonNullable<
  Schemas["PostRoutineFolderRequestBody"]["routine_folder"]
>;
export type CustomExerciseInput =
  Schemas["CreateCustomExerciseRequestBody"]["exercise"];
export type BodyMeasurementUpdate = Schemas["PutBodyMeasurement"];

export interface HevyClientOptions {
  /** Your Hevy API key. Omit when `altBaseUrl` points at a proxy that adds it server-side. */
  apiKey?: string;
  /** Override the API base URL, e.g. `"/api/hevy"` for your own proxy route. */
  altBaseUrl?: string;
}

export class HevyError extends Error {
  constructor(
    public status: number,
    public body: string,
  ) {
    super(`Hevy API Error ${status}: ${body}`);
    this.name = "HevyError";
  }
}

interface Paginated {
  page: number;
  page_count: number;
}
export interface PaginatedWorkouts extends Paginated {
  workouts: Workout[];
}
export interface PaginatedRoutines extends Paginated {
  routines: Routine[];
}
export interface PaginatedRoutineFolders extends Paginated {
  routine_folders: RoutineFolder[];
}
export interface PaginatedExerciseTemplates extends Paginated {
  exercise_templates: ExerciseTemplate[];
}
export interface PaginatedBodyMeasurements extends Paginated {
  body_measurements: BodyMeasurement[];
}

const requireId = (method: string, id: string | number) => {
  if (id === "" || id === undefined || id === null) {
    throw new Error(`${method}: id is required`);
  }
  return encodeURIComponent(String(id));
};

export const createHevyClient = ({ apiKey, altBaseUrl }: HevyClientOptions) => {
  const baseUrl: string = altBaseUrl ?? "https://api.hevyapp.com/v1";

  const request = async <T>(
    method: "GET" | "POST" | "PUT",
    path: string,
    {
      params,
      body,
    }: {
      params?: Record<string, number | string | undefined>;
      body?: unknown;
    } = {},
  ): Promise<T> => {
    // The origin lets relative proxy paths like "/api/hevy" resolve in the browser.
    const url = new URL(baseUrl + path, globalThis.location?.origin);
    for (const [key, value] of Object.entries(params ?? {})) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }

    const res = await fetch(url, {
      method,
      headers: {
        ...(apiKey && { "api-key": apiKey }),
        Accept: "application/json",
        ...(body !== undefined && { "Content-Type": "application/json" }),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      throw new HevyError(res.status, await res.text());
    }
    // Some endpoints (e.g. body measurement writes) return an empty body.
    const text = await res.text();
    return (text ? JSON.parse(text) : undefined) as T;
  };

  return {
    // workout endpoints
    /** pageSize max 10 */
    getWorkouts: (page?: number, pageSize?: number) =>
      request<PaginatedWorkouts>("GET", "/workouts", {
        params: { page, pageSize },
      }),

    getTotalWorkouts: async () =>
      (await request<{ workout_count: number }>("GET", "/workouts/count"))
        .workout_count,

    /** pageSize max 10 */
    getWorkoutsSinceDate: ({
      since,
      page,
      pageSize,
    }: {
      since: string;
      page?: number;
      pageSize?: number;
    }) =>
      request<PaginatedWorkoutEvents>("GET", "/workouts/events", {
        params: { since, page, pageSize },
      }),

    getWorkout: (id: string) =>
      request<Workout>("GET", "/workouts/" + requireId("getWorkout", id)),

    createWorkout: (workout: WorkoutInput) =>
      request<Workout>("POST", "/workouts", { body: { workout } }),

    updateWorkout: (id: string, workout: WorkoutInput) =>
      request<Workout>("PUT", "/workouts/" + requireId("updateWorkout", id), {
        body: { workout },
      }),

    // user endpoints
    getUserInfo: async () =>
      (await request<Schemas["UserInfoResponse"]>("GET", "/user/info"))
        .data as UserInfo,

    // routine endpoints
    /** pageSize max 10 */
    getRoutines: (page?: number, pageSize?: number) =>
      request<PaginatedRoutines>("GET", "/routines", {
        params: { page, pageSize },
      }),

    getRoutine: async (id: string) =>
      (
        await request<{ routine: Routine }>(
          "GET",
          "/routines/" + requireId("getRoutine", id),
        )
      ).routine,

    createRoutine: (routine: NewRoutineInput) =>
      request<Routine>("POST", "/routines", { body: { routine } }),

    updateRoutine: (id: string, routine: RoutineUpdateInput) =>
      request<Routine>("PUT", "/routines/" + requireId("updateRoutine", id), {
        body: { routine },
      }),

    // routine folder endpoints
    /** pageSize max 10 */
    getRoutineFolders: (page?: number, pageSize?: number) =>
      request<PaginatedRoutineFolders>("GET", "/routine_folders", {
        params: { page, pageSize },
      }),

    getRoutineFolder: (id: number | string) =>
      request<RoutineFolder>(
        "GET",
        "/routine_folders/" + requireId("getRoutineFolder", id),
      ),

    createRoutineFolder: (routine_folder: RoutineFolderInput) =>
      request<RoutineFolder>("POST", "/routine_folders", {
        body: { routine_folder },
      }),

    // exercise template endpoints
    /** pageSize max 100 */
    getExerciseTemplates: (page?: number, pageSize?: number) =>
      request<PaginatedExerciseTemplates>("GET", "/exercise_templates", {
        params: { page, pageSize },
      }),

    getExerciseTemplate: (id: string) =>
      request<ExerciseTemplate>(
        "GET",
        "/exercise_templates/" + requireId("getExerciseTemplate", id),
      ),

    /** Returns the id of the new custom exercise template. */
    createExerciseTemplate: async (exercise: CustomExerciseInput) =>
      (
        await request<{ id: number }>("POST", "/exercise_templates", {
          body: { exercise },
        })
      ).id,

    // exercise history endpoints
    getExerciseHistory: async (
      exerciseTemplateId: string,
      { startDate, endDate }: { startDate?: string; endDate?: string } = {},
    ) =>
      (
        await request<{ exercise_history: ExerciseHistoryEntry[] }>(
          "GET",
          "/exercise_history/" +
            requireId("getExerciseHistory", exerciseTemplateId),
          { params: { start_date: startDate, end_date: endDate } },
        )
      ).exercise_history,

    // body measurement endpoints
    /** pageSize max 10 */
    getBodyMeasurements: (page?: number, pageSize?: number) =>
      request<PaginatedBodyMeasurements>("GET", "/body_measurements", {
        params: { page, pageSize },
      }),

    /** date is YYYY-MM-DD */
    getBodyMeasurement: (date: string) =>
      request<BodyMeasurement>(
        "GET",
        "/body_measurements/" + requireId("getBodyMeasurement", date),
      ),

    createBodyMeasurement: (measurement: BodyMeasurement) =>
      request<void>("POST", "/body_measurements", { body: measurement }),

    /** date is YYYY-MM-DD */
    updateBodyMeasurement: (date: string, measurement: BodyMeasurementUpdate) =>
      request<void>(
        "PUT",
        "/body_measurements/" + requireId("updateBodyMeasurement", date),
        { body: measurement },
      ),
  };
};

export type HevyClient = ReturnType<typeof createHevyClient>;
