import { firebaseAuthErrorTypeGaurd } from "./typegaurds";

export const handleError = (err: unknown) => {
  if (firebaseAuthErrorTypeGaurd(err)) {
    alert(err.message);
  }
};
