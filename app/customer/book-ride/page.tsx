'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useMapStore } from '@/store/mapStore';
import { calculateDistance, calculatePrice, estimateDuration } from '@/lib/utils';
import toast from 'react-hot-toast';
import dynamicImport from 'next/dynamic';
import { MapPin, Navigation, Car, Users, Briefcase } from 'lucide-react';

const BookingMap = dynamicImport(() => import('@/components/maps/BookingMap'), { ssr: false });

const VEHICLE_TYPES = [
  { id: 'economy' as const, name: 'Economy', icon: Car, desc: 'Affordable rides' },
  { id: 'comfort' as const, name: 'Comfort', icon: Users, desc: 'Mid-size comfort' },
  { id: 'xl' as const, name: 'XL', icon: Briefcase, desc: 'Extra space' },
];

export default function BookRidePage() {
  const router = useRouter();
  const supabase = createClient();
  const { pickup, dropoff, setPickup, setDropoff } = useMapStore();
  const [step, setStep] = useState<'pickup' | 'dropoff' | 'confirm'>('pickup');
  const [pickupText, setPickupText] = useState(pickup?.address || '');
  const [dropoffText, setDropoffText] = useState(dropoff?.address || '');
  const [vehicleType, setVehicleType] = useState<'economy' | 'comfort' | 'xl'>('economy');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [loading, setLoading] = useState(false);
  const [priceEstimate, setPriceEstimate] = useState<any>(null);
  const [searchingDriver, setSearchingDriver] = useState(false);

  const handleConfirmLocations = async () => {
    if (!pickup || !dropoff) { toast.error('Select both locations'); return; }
    const dist = calculateDistance(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);
    const dur = estimateDuration(dist);
    
    const { data: pricing } = await supabase.from('pricing_config').select('*').eq('vehicle_type', vehicleType).single();
    const price = pricing ? calculatePrice(dist, dur, pricing) : dist * 2;
    
    setPriceEstimate({ distance: Math.round(dist * 10) / 10, duration: dur, price });
    setStep('confirm');
  };

  const handleBookRide = async () => {
    if (!pickup || !dropoff || !priceEstimate) return;
    setSearchingDriver(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error('Please login'); return; }

    const { data: ride, error } = await supabase.from('rides').insert({
      customer_id: user.id,
      pickup_address: pickup.address || pickupText,
      pickup_lat: pickup.lat,
      pickup_lng: pickup.lng,
      dropoff_address: dropoff.address || dropoffText,
      dropoff_lat: dropoff.lat,
      dropoff_lng: dropoff.lng,
      vehicle_type: vehicleType,
      estimated_price: priceEstimate.price,
      distance_km: priceEstimate.distance,
      duration_minutes: priceEstimate.duration,
      payment_method: paymentMethod,
      status: 'searching',
    }).select().single();

    if (error) { toast.error('Failed to book ride'); setSearchingDriver(false); return; }

    toast.success('Looking for nearby drivers...');
    router.push(`/customer/ride-tracking/${ride.id}`);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex-1 relative">
        <BookingMap onPickupSelect={setPickup} onDropoffSelect={setDropoff} selecting={step} />
      </div>
      <div className="bg-white border-t p-4 space-y-3">
        {step === 'pickup' && (
          <>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-black" />
              <input className="flex-1 text-sm py-2 border-b focus:outline-none" placeholder="Enter pickup location" value={pickupText} onChange={e => setPickupText(e.target.value)} />
            </div>
            <button onClick={() => setStep('dropoff')} disabled={!pickup} className="w-full bg-black text-white py-3 rounded-xl font-semibold disabled:opacity-50">Confirm Pickup</button>
          </>
        )}
        {step === 'dropoff' && (
          <>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <input className="flex-1 text-sm py-2 border-b focus:outline-none" placeholder="Enter dropoff location" value={dropoffText} onChange={e => setDropoffText(e.target.value)} />
            </div>
            <button onClick={() => setStep('pickup')} className="text-sm text-gray-500 underline">Change pickup</button>
            <button onClick={handleConfirmLocations} disabled={!dropoff} className="w-full bg-black text-white py-3 rounded-xl font-semibold disabled:opacity-50">Confirm Locations</button>
          </>
        )}
        {step === 'confirm' && priceEstimate && (
          <>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {VEHICLE_TYPES.map(v => (
                <button key={v.id} onClick={() => setVehicleType(v.id)}
                  className={`flex-1 min-w-[90px] p-3 rounded-xl border text-center transition-colors ${vehicleType === v.id ? 'border-black bg-black text-white' : 'border-gray-200'}`}>
                  <v.icon className="w-5 h-5 mx-auto mb-1" />
                  <p className="text-xs font-semibold">{v.name}</p>
                </button>
              ))}
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm"><span>Distance</span><span className="font-medium">{priceEstimate.distance} km</span></div>
              <div className="flex justify-between text-sm"><span>Duration</span><span className="font-medium">~{priceEstimate.duration} min</span></div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t"><span>Price</span><span>${priceEstimate.price.toFixed(2)}</span></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setPaymentMethod('cash')} className={`flex-1 py-2 rounded-xl text-sm font-medium border ${paymentMethod === 'cash' ? 'border-black bg-black text-white' : ''}`}>Cash</button>
              <button onClick={() => setPaymentMethod('card')} className={`flex-1 py-2 rounded-xl text-sm font-medium border ${paymentMethod === 'card' ? 'border-black bg-black text-white' : ''}`}>Card</button>
            </div>
            <button onClick={handleBookRide} disabled={searchingDriver} className="w-full bg-brand text-black py-3 rounded-xl font-bold disabled:opacity-50">
              {searchingDriver ? 'Searching for drivers...' : 'Find Driver'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
