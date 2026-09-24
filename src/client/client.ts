import type { components } from "../schema";

type Workout = components["schemas"]["Workout"];
type PaginatedWorkoutEvents = components["schemas"]["PaginatedWorkoutEvents"];

export interface HevyClientOptions {
  apiKey: string;
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

export interface PaginatedWorkouts {
  page: number;
  page_count: number;
  workouts: Workout[];
}

export const createHevyClient = ({ apiKey, altBaseUrl }: HevyClientOptions) => {
  const baseUrl: string = altBaseUrl ?? "https://api.hevyapp.com/v1";

  const getRequest = async <T>(
    path: string,
    params?: Record<string, number | string | undefined>,
  ): Promise<T> => {
    const url = new URL(baseUrl + path);

    for (const [key, value] of Object.entries(params ?? {})) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }

    const res = await fetch(url, {
      method: "GET",
      headers: { "api-key": apiKey, Accept: "application/json" },
    });
    if (!res.ok) {
      throw new HevyError(res.status, await res.text());
    }
    return res.json() as Promise<T>;
  };

  return {
    getWorkouts: (page?: number, pageSize?: number) =>
      getRequest<PaginatedWorkouts>("/workouts", { page, pageSize }),

    getTotalWorkouts: async () =>
      (await getRequest<{ workout_count: number }>("/workouts/count"))
        .workout_count,

    getWorkoutsSinceDate: ({
      since,
      page,
      pageSize,
    }: {
      since: string;
      page?: number;
      pageSize?: number;
    }) =>
      getRequest<PaginatedWorkoutEvents>("/workouts/events", {
        since,
        page,
        pageSize,
      }),

    getWorkout: (id: string) => {
      if (!id) throw new Error("getWorkout: id is required");
      return getRequest<Workout>("/workouts/" + encodeURIComponent(id));
    },
  };
};

export type HevyClient = ReturnType<typeof createHevyClient>;
