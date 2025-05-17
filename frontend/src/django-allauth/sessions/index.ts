import {
  GetSessionInvalidSessionResponse,
  GetSessionNotAuthenticatedResponse,
  GetSessionSuccessResponse,
} from "./types";

async function getSession() {
  const response = await fetch(
    `${process.env.REACT_APP_API_URL}/_allauth/browser/v1/auth/session`,
    {
      credentials: "include",
    }
  );
  const responseData:
    | GetSessionSuccessResponse
    | GetSessionNotAuthenticatedResponse
    | GetSessionInvalidSessionResponse = await response.json();

  const okCodes = [200, 401, 410];
  if (okCodes.indexOf(response.status) === -1) {
    throw new Error(JSON.stringify(responseData));
  }
  const isAuthenticated = responseData.meta.is_authenticated;

  const user =
    response.status === 200
      ? (responseData as GetSessionSuccessResponse).data.user
      : null;
  return { isAuthenticated, user};
}

export const sessionsApi = { getSession };
