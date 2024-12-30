import { useCallback, useEffect } from "react";
import { getAccessToken } from "../api/userAPI";
import uuid from "uuid";

const useAccessTokenHandler = () => {
  const refreshAccessToken = useCallback(async () => {
    try {
      const randomID = uuid.v4();
      localStorage.setItem("browser-id", randomID);
      await getAccessToken(randomID);
    } catch (e) {
      console.log("Error refreshing access token", e);
    }
  }, []);

  const visibilityChange = useCallback(() => {
    if (document.visibilityState === "visible") {
      refreshAccessToken();
    }
  }, [refreshAccessToken]);

  useEffect(() => {
    refreshAccessToken();

    const timer = setInterval(refreshAccessToken, 60 * 1000 * 20);
    document.addEventListener("visibilitychange", visibilityChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", visibilityChange);
    };
  }, [refreshAccessToken, visibilityChange]);
};

export default useAccessTokenHandler;
