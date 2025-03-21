"use server";

import { signIn as nextAuthSignIn } from "next-auth/react";

export async function signIn(provider: string, data: any) {
  try {
    await nextAuthSignIn(provider, data);
  } catch (error: any) {
    if (error && typeof error === "object" && "type" in error) {
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
