import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password, name, inviteCode } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Username, email e password sono obbligatori" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La password deve avere almeno 6 caratteri" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email o username già in uso" },
        { status: 409 }
      );
    }

    // Generate unique invite code
    const userInviteCode = username.toUpperCase() + Math.random().toString(36).slice(2, 8).toUpperCase();

    const passwordHash = await bcrypt.hash(password, 12);

    // Validate invite code if provided
    let referrerCode: string | null = null;
    if (inviteCode && inviteCode.trim()) {
      const referrer = await prisma.user.findFirst({
        where: { inviteCode: inviteCode.trim().toUpperCase() },
      });
      if (referrer) {
        referrerCode = referrer.inviteCode;
      }
    }

    const user = await prisma.user.create({
      data: {
        username,
        email,
        name,
        passwordHash,
        balance: 10000,
        inviteCode: userInviteCode,
        referredBy: referrerCode,
      },
    });

    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: "DEPOSIT",
        amount: 10000,
        balance: 10000,
        reference: "Bonus di benvenuto",
      },
    });

    // Auto-add referrer as friend and give bonus
    if (referrerCode) {
      const referrer = await prisma.user.findFirst({ where: { inviteCode: referrerCode } });
      if (referrer) {
        await prisma.friendship.create({
          data: {
            initiatorId: referrer.id,
            receiverId: user.id,
            status: "ACCEPTED",
          },
        });
        // Give referrer bonus
        const bonus = 500;
        await prisma.user.update({
          where: { id: referrer.id },
          data: { balance: { increment: bonus } },
        });
        const referrerBalance = await prisma.user.findUnique({
          where: { id: referrer.id },
          select: { balance: true },
        });
        await prisma.transaction.create({
          data: {
            userId: referrer.id,
            type: "REFERRAL_BONUS",
            amount: bonus,
            balance: referrerBalance!.balance,
            reference: `Referral da @${username}`,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
