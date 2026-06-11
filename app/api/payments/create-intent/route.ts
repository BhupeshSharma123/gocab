import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount } = body;
    // Return mock clientSecret if Stripe not configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ clientSecret: `pi_demo_${Date.now()}_secret_demo`, message: "Demo mode - Stripe not configured" });
    }
    const Stripe = require("stripe");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const pi = await stripe.paymentIntents.create({ amount: Math.round(amount * 100), currency: "usd" });
    return NextResponse.json({ clientSecret: pi.client_secret });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
