export const checkIsDemoMode = () => {
  // @ts-ignore
  const envURL = import.meta.env.VITE_DEMO_MODE === "true";

  return envURL;
};
