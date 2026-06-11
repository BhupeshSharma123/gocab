-- GoCab - Complete Database Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('customer', 'driver', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE vehicle_type_enum AS ENUM ('economy', 'comfort', 'xl');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE driver_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE ride_status AS ENUM ('searching', 'accepted', 'arriving', 'in_progress', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_method_enum AS ENUM ('cash', 'card');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status_enum AS ENUM ('pending', 'paid', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE discount_type_enum AS ENUM ('percentage', 'fixed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM ('ride_request', 'ride_accepted', 'driver_arriving', 'ride_completed', 'payment', 'system');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    role user_role DEFAULT 'customer',
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS driver_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    license_number TEXT,
    license_expiry DATE,
    vehicle_make TEXT,
    vehicle_model TEXT,
    vehicle_year INTEGER,
    vehicle_color TEXT,
    vehicle_plate TEXT,
    vehicle_type vehicle_type_enum DEFAULT 'economy',
    vehicle_image_url TEXT,
    license_image_url TEXT,
    status driver_status DEFAULT 'pending',
    is_online BOOLEAN DEFAULT false,
    current_lat DOUBLE PRECISION,
    current_lng DOUBLE PRECISION,
    rating DOUBLE PRECISION DEFAULT 5.0,
    total_rides INTEGER DEFAULT 0,
    total_earnings DOUBLE PRECISION DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES profiles(id),
    driver_id UUID REFERENCES profiles(id),
    pickup_address TEXT NOT NULL,
    pickup_lat DOUBLE PRECISION NOT NULL,
    pickup_lng DOUBLE PRECISION NOT NULL,
    dropoff_address TEXT NOT NULL,
    dropoff_lat DOUBLE PRECISION NOT NULL,
    dropoff_lng DOUBLE PRECISION NOT NULL,
    status ride_status DEFAULT 'searching',
    vehicle_type vehicle_type_enum DEFAULT 'economy',
    estimated_price DOUBLE PRECISION,
    final_price DOUBLE PRECISION,
    distance_km DOUBLE PRECISION,
    duration_minutes INTEGER,
    payment_method payment_method_enum DEFAULT 'cash',
    payment_status payment_status_enum DEFAULT 'pending',
    stripe_payment_id TEXT,
    customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
    driver_rating INTEGER CHECK (driver_rating >= 1 AND driver_rating <= 5),
    customer_review TEXT,
    driver_review TEXT,
    cancelled_by TEXT,
    cancel_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS ride_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
    driver_lat DOUBLE PRECISION,
    driver_lng DOUBLE PRECISION,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT,
    message TEXT,
    type notification_type DEFAULT 'system',
    is_read BOOLEAN DEFAULT false,
    ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pricing_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_type vehicle_type_enum UNIQUE NOT NULL,
    base_fare DOUBLE PRECISION NOT NULL,
    per_km_rate DOUBLE PRECISION NOT NULL,
    per_minute_rate DOUBLE PRECISION NOT NULL,
    minimum_fare DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    surge_multiplier DOUBLE PRECISION DEFAULT 1.0,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS promo_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    discount_type discount_type_enum NOT NULL,
    discount_value DOUBLE PRECISION NOT NULL,
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    expiry_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ride_id UUID REFERENCES rides(id),
    driver_id UUID REFERENCES profiles(id),
    customer_id UUID REFERENCES profiles(id),
    gross_amount DOUBLE PRECISION,
    platform_fee DOUBLE PRECISION,
    driver_earning DOUBLE PRECISION,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    ride_id UUID REFERENCES rides(id),
    subject TEXT NOT NULL,
    message TEXT,
    status ticket_status DEFAULT 'open',
    admin_reply TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_rides_customer ON rides(customer_id);
CREATE INDEX IF NOT EXISTS idx_rides_driver ON rides(driver_id);
CREATE INDEX IF NOT EXISTS idx_rides_status ON rides(status);
CREATE INDEX IF NOT EXISTS idx_rides_created ON rides(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_status ON driver_profiles(status);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_online ON driver_profiles(is_online);
CREATE INDEX IF NOT EXISTS idx_driver_location ON driver_profiles(current_lat, current_lng);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_tracking_ride ON ride_tracking(ride_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE ride_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Profiles: users read/update own, admin reads all
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin reads all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Driver profiles: read own, admin all
CREATE POLICY "Drivers read own" ON driver_profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Drivers update own" ON driver_profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admin manages drivers" ON driver_profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Public read online drivers" ON driver_profiles FOR SELECT USING (status = 'approved');

-- Rides: customer sees own, driver sees own, admin all
CREATE POLICY "Customer reads own rides" ON rides FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "Driver reads own rides" ON rides FOR SELECT USING (driver_id = auth.uid());
CREATE POLICY "Customer creates ride" ON rides FOR INSERT WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Driver updates assigned rides" ON rides FOR UPDATE USING (driver_id = auth.uid());
CREATE POLICY "Admin reads all rides" ON rides FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Notifications: user sees own
CREATE POLICY "User reads own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System creates notifications" ON notifications FOR INSERT WITH CHECK (true);

-- Support tickets: user sees own, admin all
CREATE POLICY "User manages own tickets" ON support_tickets FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Admin manages all tickets" ON support_tickets FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Pricing: admin only
CREATE POLICY "Admin manages pricing" ON pricing_config FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Public reads pricing" ON pricing_config FOR SELECT USING (true);

-- Promo codes: admin manages, public reads active
CREATE POLICY "Admin manages promos" ON promo_codes FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Public reads active promos" ON promo_codes FOR SELECT USING (is_active = true);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'customer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Distance calculation (Haversine formula)
CREATE OR REPLACE FUNCTION haversine_distance(
  lat1 DOUBLE PRECISION, lng1 DOUBLE PRECISION,
  lat2 DOUBLE PRECISION, lng2 DOUBLE PRECISION
) RETURNS DOUBLE PRECISION AS $$
DECLARE
  R DOUBLE PRECISION := 6371; -- Earth radius in km
  dlat DOUBLE PRECISION;
  dlng DOUBLE PRECISION;
  a DOUBLE PRECISION;
  c DOUBLE PRECISION;
BEGIN
  dlat := radians(lat2 - lat1);
  dlng := radians(lng2 - lng1);
  a := sin(dlat/2)^2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng/2)^2;
  c := 2 * asin(sqrt(a));
  RETURN R * c;
END;
$$ LANGUAGE plpgsql;

-- Find nearest drivers
CREATE OR REPLACE FUNCTION find_nearest_drivers(
  pickup_lat DOUBLE PRECISION,
  pickup_lng DOUBLE PRECISION,
  max_distance DOUBLE PRECISION DEFAULT 10,
  max_results INTEGER DEFAULT 5
) RETURNS TABLE (
  user_id UUID,
  driver_id UUID,
  distance DOUBLE PRECISION,
  vehicle_type vehicle_type_enum,
  rating DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT dp.user_id, dp.id, 
    haversine_distance(pickup_lat, pickup_lng, dp.current_lat, dp.current_lng) as dist,
    dp.vehicle_type, dp.rating
  FROM driver_profiles dp
  WHERE dp.status = 'approved' AND dp.is_online = true
    AND haversine_distance(pickup_lat, pickup_lng, dp.current_lat, dp.current_lng) <= max_distance
  ORDER BY dist ASC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Seed pricing config
INSERT INTO pricing_config (vehicle_type, base_fare, per_km_rate, per_minute_rate, minimum_fare) VALUES
  ('economy', 2.50, 1.20, 0.15, 5.00),
  ('comfort', 4.00, 1.80, 0.25, 8.00),
  ('xl', 6.00, 2.50, 0.35, 12.00)
ON CONFLICT (vehicle_type) DO NOTHING;

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE rides;
ALTER PUBLICATION supabase_realtime ADD TABLE ride_tracking;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE driver_profiles;
