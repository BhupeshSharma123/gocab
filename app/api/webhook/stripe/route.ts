import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ received: true, mode: "demo" });
    }
    const Stripe = require("stripe");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sig = request.headers.get("stripe-signature") || "";
    const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET || "");
    return NextResponse.json({ received: true, type: event.type });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
