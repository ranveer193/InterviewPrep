import useSWR, { mutate } from "swr";
import { useAuth } from "../context/authContext";
import api from "../services/api";

const ENDPOINT = "/interview-goal";

export function useInterviewGoal() {
  const { user, loading: authLoading } = useAuth();

  /* Skip the request while Firebase is initialising or user not logged-in */
  const swrKey = authLoading || !user ? null : ENDPOINT;

  const {
    data,
    error,
    isLoading: swrLoading,
  } = useSWR(swrKey, (url) => api.get(url).then((r) => r.data), {
    errorRetryCount: 1,
  });

  /* ----------------------------- */
  /* CRUD helpers                  */
  /* ----------------------------- */
  const saveGoal = async (payload) => {
    await api.post(ENDPOINT, payload);
    mutate(ENDPOINT);
  };

  const removeGoal = async (id) => {
    await api.delete(`${ENDPOINT}/${id}`);
    mutate(ENDPOINT);
  };

  const updateGoal = async (id, payload) => {
    const { data: updatedGoal } = await api.patch(`${ENDPOINT}/${id}`, payload);
    mutate(ENDPOINT);
    return updatedGoal;
  };

  const getGoal = async (id) => {
    const { data: goal } = await api.get(`${ENDPOINT}/${id}`);
    return goal;
  };

  /* ----------------------------- */
  /* Return                        */
  /* ----------------------------- */
  return {
    goal: data,
    isLoading: authLoading || swrLoading, // true until either auth or SWR ready
    error,
    saveGoal,
    removeGoal,
    updateGoal,
    getGoal,
  };
}
