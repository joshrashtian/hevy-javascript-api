import { getWorkouts } from "../functions/workouts";

interface HevyClientType {
  apiKey: string;
  altBaseUrl: string;
}

export const createHevyClient = ({ apiKey, altBaseUrl }: HevyClientType) => {
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
      throw new Error(`Hevy API Error ${res.status}: ${await res.text()}`);
    }
    return res.json() as Promise<T>;
  };

  return {
    getWorkouts: async (page?: number, pageSize?: number) => {
      return getRequest("/workouts", { page, pageSize });
    },

    getTotalWorkouts: async () => {
      return getRequest("/workouts/count");
    },

    getWorkoutsSinceDate: async ({
      page,
      pageSize,
      event,
    }: {
      page: number;
      pageSize: number;
      event: string;
    }) => {
      return getRequest("/workouts/events", { page, pageSize, event });
    },

    getWorkout: async (id: string) => {
      if (!id) throw "Error: No workout id in getWorkout method.";
      return getRequest("/workouts/" + id);
    },
  };
};
