import useSWR, { mutate } from "swr";
import api from "../services/api";

const ENDPOINT = "/interview-goal";

export function useInterviewGoal() {
  const { data, error, isLoading } = useSWR(ENDPOINT, (url) =>
    api.get(url).then((res) => res.data)
  );

  // Create a new goal
  const saveGoal = async (payload) => {
    await api.post(ENDPOINT, payload);
    mutate(ENDPOINT);
  };

  // Delete goal by ID
  const removeGoal = async (id) => {
    await api.delete(`${ENDPOINT}/${id}`);
    mutate(ENDPOINT);
  };

  // Update a goal using PATCH
  const updateGoal = async (id, payload) => {
    const { data: updatedGoal } = await api.patch(`${ENDPOINT}/${id}`, payload);
    mutate(ENDPOINT);
    return updatedGoal;
  };

  // Get a single goal
  const getGoal = async (id) => {
    const { data:goal } = await api.get(`${ENDPOINT}/${id}`);
    return goal;
  };

  return {
    goal: data,
    isLoading,
    error,
    saveGoal,
    removeGoal,
    updateGoal,
    getGoal,
  };
}
