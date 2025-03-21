"use server";

import { signIn as nextAuthSignIn } from "next-auth/react";

interface AuthError {
    type: string;
}
export async function signIn(provider: string, data: any) {
  try {
    await nextAuthSignIn(provider, data);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials." };
        default:
          return { error: "Something went wrong." };
      }
    }
    throw error;
  }
}
