
import { NextRequest, NextResponse } from "next/server";

const dummyUser = {
  email: "test@demo.com",
  password: "password123",
  name: "John Doe",
};

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.email === dummyUser.email && body.password === dummyUser.password) {
    return NextResponse.json({ message: "Login successful", user: dummyUser });
  }

  return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
}
