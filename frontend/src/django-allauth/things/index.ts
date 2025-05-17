import { getCSRFToken } from "../../utils/cookies";

interface ThingResponse {
  id: number;
}

export async function listThingsQuery(): Promise<ThingResponse[]> {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/crud/`, {
    credentials: "include",
  });
  return response.json();
}

export async function createThingMutation() {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/crud/`, {
    credentials: "include",
    method: "POST",
    headers: { "X-CSRFTOKEN": getCSRFToken() || "" },
  });
  return response.json();
}

export async function deleteThingMutation(id: number) {
  await fetch(`${process.env.REACT_APP_API_URL}/crud/${id}/`, {
    credentials: "include",
    method: "DELETE",
    headers: { "X-CSRFTOKEN": getCSRFToken() || "" },
  });
}
