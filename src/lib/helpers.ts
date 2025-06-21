import { firebaseAuthErrorTypeGaurd } from "./typegaurds";

export const handleError = (err: unknown) => {
  if (firebaseAuthErrorTypeGaurd(err)) {
    const errorCodeMap: Record<string, string> = {
      "auth/invalid-credential": "Invalid credentials",
      "auth/invalid-email": "Invalid email address",
      "auth/user-not-found": "User not found",
      "auth/wrong-password": "Wrong password",
    };
    alert(errorCodeMap[err.code] ?? err.message);
  }
};
