import { getCSRFToken } from "../../../utils/cookies";

export async function signupMutation(details: {
  email: string;
  password: string;
  username: string;
}) {
  // await fetch(
  //   `${process.env.REACT_APP_API_URL}/_allauth/browser/v1/auth/signup`,
  //   {
  //     method: "POST",
  //     credentials: "include",
  //     headers: {
  //       "Content-Type": "application/json",
  //       "X-CSRFTOKEN": getCSRFToken() || "", 
  //     },
  //     body: JSON.stringify(details),
  //   },
  // );
  const response = await fetch(
    `${process.env.REACT_APP_API_URL}/_allauth/browser/v1/auth/signup`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRFTOKEN": getCSRFToken() || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(details),
    },
  );

  const data = await response.json();
  console.log(data); 

  if (!response.ok) {
    throw new Error(JSON.stringify(data)); 
  }

  return data;
}
