import { firebaseAuthErrorTypeGaurd } from "./typegaurds";

export const handleError = (err: unknown) => {
  if (firebaseAuthErrorTypeGaurd(err)) {
    const errorCodeMap: Record<string, string> = {
      "auth/invalid-credential": "Invalid credentials",
    };
    alert(errorCodeMap[err.code] ?? err.message);
  }
};
