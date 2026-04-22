import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { prisma } from "./prisma";

type AppUser = Awaited<ReturnType<typeof prisma.user.findFirst>>;

async function getClerkPrimaryEmail(userId: string): Promise<string | null> {
  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);

  return (
    clerkUser.emailAddresses.find(
      (email) => email.id === clerkUser.primaryEmailAddressId
    )?.emailAddress ?? null
  );
}

async function syncUserFromClerk(userId: string): Promise<AppUser> {
  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);

  const primaryEmail =
    clerkUser.emailAddresses.find(
      (email) => email.id === clerkUser.primaryEmailAddressId
    )?.emailAddress ?? null;

  if (!primaryEmail) {
    throw new Error("Authenticated user is missing a primary email address.");
  }

  const normalizedName =
    clerkUser.firstName && clerkUser.lastName
      ? `${clerkUser.firstName} ${clerkUser.lastName}`.trim()
      : clerkUser.firstName || clerkUser.lastName || primaryEmail;

  const existingUser = await prisma.user.findUnique({
    where: { email: primaryEmail },
  });

  if (existingUser) {
    return prisma.user.update({
      where: { id: existingUser.id },
      data: {
        clerkId: userId,
        name: normalizedName,
        image: clerkUser.imageUrl,
      },
    });
  }

  return prisma.user.create({
    data: {
      clerkId: userId,
      email: primaryEmail,
      name: normalizedName,
      image: clerkUser.imageUrl,
      role: "USER",
    },
  });
}

export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const primaryEmail = await getClerkPrimaryEmail(userId);

  if (!primaryEmail) {
    throw new Error("Authenticated user is missing a primary email address.");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: primaryEmail },
  });

  if (existingUser) {
    return existingUser;
  }

  return syncUserFromClerk(userId);
}

export async function requireAuth(options?: {
  redirectTo?: string;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(options?.redirectTo ?? "/signin");
  }

  return user;
}

export async function requireAdmin(options?: {
  redirectTo?: string;
}) {
  const user = await requireAuth(options);

  if (user.role !== "ADMIN") {
    redirect(options?.redirectTo ?? "/");
  }

  return user;
}

export async function getAuthUserId() {
  const { userId } = await auth();
  return userId ?? null;
}
