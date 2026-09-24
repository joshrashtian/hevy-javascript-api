interface HevyClientType {
  apiKey: string;
  altBaseUrl: string;
}

export const createHevyClient = ({ apiKey, altBaseUrl }: HevyClientType) => {
  const baseUrl: string = "https://api.hevyapp.com/v1";
  return {};
};
