"use server"

import { z } from "zod"
import { hash } from "bcrypt"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { signIn } from "@/auth"

// Schema for signup validation
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

// Schema for login validation
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Please enter your password"),
})

export async function signup(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // Validate form data
  const validatedFields = signupSchema.safeParse({
    name,
    email,
    password,
  })

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    }
  }

  // Check if user already exists
  const existingUser = await db.user.findUnique({
    where: {
      email,
    },
  })

  if (existingUser) {
    return {
      error: {
        email: ["User with this email already exists"],
      },
    }
  }

  // Hash password
  const hashedPassword = await hash(password, 10)

  // Create user
  const user = await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  })

  // Create free subscription for the user
  await db.subscription.create({
    data: {
      stripeCustomerId: `cus_free_${user.id}`,
      plan: "free",
      userId: user.id,
    },
  })

  // Sign in the user
  await signIn("credentials", {
    email,
    password,
    redirectTo: "/dashboard",
  })
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // Validate form data
  const validatedFields = loginSchema.safeParse({
    email,
    password,
  })

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    })
  } catch (error) {
    return {
      error: {
        _form: ["Invalid email or password"],
      },
    }
  }
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

export async function logout() {
  redirect("/api/auth/signout")
}

