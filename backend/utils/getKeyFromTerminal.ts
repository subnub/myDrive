import prompts from "prompts";

const getKeyFromTerminal = async () => {
  return new Promise<string>((resolve, _) => {
    setTimeout(async () => {
      const response = await prompts({
        type: "password",
        name: "key",
        message: "Enter Server Encryption Key",
      });

      resolve(response.key);
    }, 1500);
  });
};

export default getKeyFromTerminal;
