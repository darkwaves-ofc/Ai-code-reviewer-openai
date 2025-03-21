"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/app/actions/auth"
import { getUserSubscriptionPlan } from "@/app/actions/stripe"

// Schema for team creation validation
const createTeamSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters"),
})

// Schema for team invitation validation
const inviteTeamMemberSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  role: z.enum(["member", "admin"]),
})

export async function createTeam(formData: FormData) {
  const user = await getCurrentUser()

  if (!user) {
    return {
      error: "You must be logged in to create a team",
    }
  }

  const name = formData.get("name") as string

  // Validate form data
  const validatedFields = createTeamSchema.safeParse({
    name,
  })

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    }
  }

  // Check user's subscription
  const subscription = await getUserSubscriptionPlan()

  if (subscription.plan !== "team") {
    return {
      error: "You need a team subscription to create a team",
      upgradeRequired: true,
    }
  }

  try {
    // Create a slug from the team name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")

    // Check if slug already exists
    const existingTeam = await db.team.findUnique({
      where: {
        slug,
      },
    })

    if (existingTeam) {
      return {
        error: {
          name: ["A team with this name already exists"],
        },
      }
    }

    // Create the team
    const team = await db.team.create({
      data: {
        name,
        slug,
        members: {
          create: {
            userId: user.id,
            role: "owner",
          },
        },
      },
    })

    revalidatePath("/dashboard/teams")

    return {
      success: true,
      team,
    }
  } catch (error) {
    console.error("Error creating team:", error)
    return {
      error: "Failed to create team. Please try again.",
    }
  }
}

export async function inviteTeamMember(teamId: string, formData: FormData) {
  const user = await getCurrentUser()

  if (!user) {
    return {
      error: "You must be logged in to invite team members",
    }
  }

  const email = formData.get("email") as string
  const role = formData.get("role") as string

  // Validate form data
  const validatedFields = inviteTeamMemberSchema.safeParse({
    email,
    role,
  })

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    }
  }

  try {
    // Check if user is a team admin or owner
    const teamMember = await db.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: user.id,
          teamId,
        },
      },
    })

    if (!teamMember || !["owner", "admin"].includes(teamMember.role)) {
      return {
        error: "You don't have permission to invite members to this team",
      }
    }

    // Check if user exists
    const invitedUser = await db.user.findUnique({
      where: {
        email,
      },
    })

    if (!invitedUser) {
      return {
        error: "User with this email doesn't exist",
      }
    }

    // Check if user is already a member
    const existingMember = await db.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: invitedUser.id,
          teamId,
        },
      },
    })

    if (existingMember) {
      return {
        error: "User is already a member of this team",
      }
    }

    // Add user to team
    await db.teamMember.create({
      data: {
        userId: invitedUser.id,
        teamId,
        role: role as "member" | "admin",
      },
    })

    revalidatePath(`/dashboard/teams`)

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error inviting team member:", error)
    return {
      error: "Failed to invite team member. Please try again.",
    }
  }
}

export async function removeTeamMember(teamId: string, memberId: string) {
  const user = await getCurrentUser()

  if (!user) {
    return {
      error: "You must be logged in to remove team members",
    }
  }

  try {
    // Check if user is a team admin or owner
    const teamMember = await db.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: user.id,
          teamId,
        },
      },
    })

    if (!teamMember || !["owner", "admin"].includes(teamMember.role)) {
      return {
        error: "You don't have permission to remove members from this team",
      }
    }

    // Get the member to be removed
    const memberToRemove = await db.teamMember.findUnique({
      where: {
        id: memberId,
      },
    })

    if (!memberToRemove) {
      return {
        error: "Team member not found",
      }
    }

    // Prevent removing the owner
    if (memberToRemove.role === "owner") {
      return {
        error: "You cannot remove the team owner",
      }
    }

    // Remove the member
    await db.teamMember.delete({
      where: {
        id: memberId,
      },
    })

    revalidatePath(`/dashboard/teams`)

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error removing team member:", error)
    return {
      error: "Failed to remove team member. Please try again.",
    }
  }
}

export async function getUserTeams() {
  const user = await getCurrentUser()

  if (!user) {
    return []
  }

  const teamMembers = await db.teamMember.findMany({
    where: {
      userId: user.id,
    },
    include: {
      team: true,
    },
  })

  return teamMembers.map((member) => ({
    ...member.team,
    role: member.role,
  }))
}

export async function getTeamMembers(teamId: string) {
  const user = await getCurrentUser()

  if (!user) {
    return []
  }

  // Check if user is a team member
  const teamMember = await db.teamMember.findUnique({
    where: {
      userId_teamId: {
        userId: user.id,
        teamId,
      },
    },
  })

  if (!teamMember) {
    return []
  }

  const members = await db.teamMember.findMany({
    where: {
      teamId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  })

  return members
}

