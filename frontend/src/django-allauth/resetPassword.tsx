import { getCSRFToken } from "../utils/cookies";

  const csrfToken = getCSRFToken();
export async function resetPassword(email: string) {

await fetch(`${process.env.REACT_APP_API_URL}/_allauth/browser/v1/auth/session`, {
  method: "GET",
  credentials: "include",
});
  const response = await fetch(
    `${process.env.REACT_APP_API_URL}/_allauth/browser/v1/auth/password/request`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFTOKEN": csrfToken || "",
      },
      body: JSON.stringify({ email }),
    }
  );

  const responseData = await response.json();
  if (!response.ok) {
    const error = new Error(responseData.detail || "Yêu cầu thất bại");
    throw error;
  }

  return responseData;
}