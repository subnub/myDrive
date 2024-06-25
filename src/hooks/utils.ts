import { useMemo } from "react";
import { useParams } from "react-router-dom";

export const useUtils = () => {
  const params = useParams();

  const isHome = useMemo(() => {
    return !params.id;
  }, [params.id]);

  return { isHome };
};
