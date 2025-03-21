"use server"

import { AuthError } from "next-auth/providers/credentials"
import { signIn as nextAuthSignIn } from "next-auth/react"

export async function signIn(provider: string, data: any) {
  try {
    await nextAuthSignIn(provider, data)
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials." }
        default:
          return { error: "Something went wrong." }
      }
    }
    throw error
  }
}

