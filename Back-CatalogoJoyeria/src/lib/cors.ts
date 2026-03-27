import { NextResponse } from "next/server";

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

export function withCors(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", FRONTEND_ORIGIN);
  response.headers.set("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

export function corsJson(body: unknown, init?: ResponseInit) {
  return withCors(NextResponse.json(body, init));
}

export function corsPreflight() {
  return withCors(new NextResponse(null, { status: 204 }));
}
