import axios from "axios";

export const semanticSearchAPI = async (query: string, userId: string) => {
  const response = await axios.post("/file-service/semantic-search", { query, userId });
  return response.data;
};