import env from "../enviroment/env";

export const getFSStoragePath = () => {
  if (env.docker) {
    return "/data/";
  } else {
    return env.fsDirectory;
  }
};
