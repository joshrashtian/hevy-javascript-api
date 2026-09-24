import axios from "axios";

export const createHevyClient = (apiKey: string) => {
  return axios.create({
    baseURL: "https://api.hevyapp.com/v1",
    headers: {
      Accept: "application/json",
      "api-key": apiKey,
    },
  });
};
