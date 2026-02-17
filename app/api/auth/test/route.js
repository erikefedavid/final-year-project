import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Auth routes are set up. Use POST to test register/login.",
    routes: {
      register: "POST /api/auth/register",
      login: "POST /api/auth/login",
      me: "GET /api/auth/me",
      logout: "POST /api/auth/logout",
    },
  });
}