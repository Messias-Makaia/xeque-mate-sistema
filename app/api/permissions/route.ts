import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";


export async function GET() {
  const permissions = await prisma.permission.findMany();
  return NextResponse.json(permissions);
}