import { auth } from "@/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.githubUsername) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { email } = await req.json();
    if (!email) {
      return new NextResponse("Email is required", { status: 400 });
    }

    // Update user's email
    await prisma.user.update({
      where: {
        githubId: session.user.githubUsername,
      },
      data: {
        email,
      },
    });

    return new NextResponse("Email updated successfully", { status: 200 });
  } catch (error) {
    console.error("Error updating email:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
