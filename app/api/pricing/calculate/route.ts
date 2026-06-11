import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { distance, duration, vehicle_type } = body;

    const supabase = createClient();
    const { data: config } = await supabase.from("pricing_config").select("*").eq("vehicle_type", vehicle_type).eq("is_active", true).single();

    if (!config) return NextResponse.json({ error: "Pricing not found" }, { status: 404 });

    const price = (config.base_fare + distance * config.per_km_rate + duration * config.per_minute_rate) * config.surge_multiplier;
    const final = Math.max(price, config.minimum_fare);

    return NextResponse.json({
      estimated_price: Math.round(final * 100) / 100,
      breakdown: { base_fare: config.base_fare, distance_charge: Math.round(distance * config.per_km_rate * 100) / 100, time_charge: Math.round(duration * config.per_minute_rate * 100) / 100, surge: config.surge_multiplier, minimum_fare: config.minimum_fare }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
