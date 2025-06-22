import { firebaseErrorTypeGaurd } from "./typegaurds";

export const handleError = (err: unknown) => {
  if (firebaseErrorTypeGaurd(err)) {
    const { code, message } = err;
    console.error(`Firebase error:\nCode: ${code}\nMessage: ${message}`);
    const errorCodeMap: Record<string, string> = {
      "auth/invalid-credential": "Invalid credentials",
      "auth/invalid-email": "Invalid email address",
      "auth/user-not-found": "User not found",
      "auth/wrong-password": "Wrong password",
      "permission-denied": "Permission denied",
    };
    alert(errorCodeMap[code] ?? message);
  } else console.error(err);
};
