'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import dynamicImport from 'next/dynamic';
import { MapPin, Navigation, Phone, Star, X } from 'lucide-react';

const LiveMap = dynamicImport(() => import('@/components/maps/LiveMap'), { ssr: false });

const STATUS_STEPS = ['searching', 'accepted', 'arriving', 'in_progress', 'completed'];

export default function RideTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [ride, setRide] = useState<any>(null);
  const [driver, setDriver] = useState<any>(null);
  const [driverLoc, setDriverLoc] = useState({ lat: 0, lng: 0 });
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  useEffect(() => {
    fetchRide();
    const channel = supabase
      .channel(`ride-${params.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rides', filter: `id=eq.${params.id}` }, (payload) => {
        setRide(payload.new);
        if (payload.new.status === 'completed') setShowRating(true);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ride_tracking', filter: `ride_id=eq.${params.id}` }, (payload: any) => {
        setDriverLoc({ lat: payload.new.driver_lat, lng: payload.new.driver_lng });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [params.id]);

  const fetchRide = async () => {
    const { data } = await supabase.from('rides').select('*, driver:driver_id(full_name, phone, avatar_url, driver_profiles!inner(vehicle_make, vehicle_model, vehicle_plate, vehicle_color, rating))').eq('id', params.id).single();
    if (data) { setRide(data); setDriver(data.driver?.driver_profiles); }
  };

  const handleCancel = async () => {
    if (!cancelReason) { toast.error('Please provide a reason'); return; }
    const { error } = await supabase.from('rides').update({ status: 'cancelled', cancelled_by: 'customer', cancel_reason: cancelReason }).eq('id', params.id);
    if (error) toast.error('Failed to cancel');
    else { toast.success('Ride cancelled'); setShowCancel(false); }
  };

  const handleRate = async () => {
    if (rating === 0) { toast.error('Please select a rating'); return; }
    await supabase.from('rides').update({ customer_rating: rating, customer_review: review }).eq('id', params.id);
    toast.success('Thanks for your feedback!');
    setShowRating(false);
    router.push('/customer/dashboard');
  };

  if (!ride) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  const currentStep = STATUS_STEPS.indexOf(ride.status);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="relative flex-1">
        <LiveMap rideId={params.id as string} driverLat={driverLoc.lat} driverLng={driverLoc.lng} pickupLat={ride.pickup_lat} pickupLng={ride.pickup_lng} />
      </div>
      <div className="bg-white border-t p-4 space-y-3 max-h-[40vh] overflow-y-auto">
        {/* Status Steps */}
        <div className="flex items-center justify-between px-2">
          {STATUS_STEPS.slice(0, 4).map((step, i) => (
            <div key={step} className="flex items-center gap-1">
              <div className={`w-2.5 h-2.5 rounded-full ${i <= currentStep ? 'bg-black' : 'bg-gray-200'}`} />
              <span className={`text-[10px] capitalize ${i <= currentStep ? 'text-black font-medium' : 'text-gray-400'}`}>{step.replace('_',' ')}</span>
              {i < 3 && <div className={`w-4 h-0.5 ${i < currentStep ? 'bg-black' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Driver Info */}
        {ride.driver && (
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-lg font-bold">{ride.driver.full_name?.[0]}</div>
            <div className="flex-1">
              <p className="font-semibold">{ride.driver.full_name}</p>
              <p className="text-xs text-gray-500">{ride.driver.driver_profiles?.vehicle_make} {ride.driver.driver_profiles?.vehicle_model} • {ride.driver.driver_profiles?.vehicle_plate}</p>
              <div className="flex items-center gap-1 text-xs text-brand"><Star className="w-3 h-3 fill-brand" /> {ride.driver.driver_profiles?.rating?.toFixed(1) || '5.0'}</div>
            </div>
            <a href={`tel:${ride.driver.phone}`} className="p-2 bg-green-500 text-white rounded-full"><Phone className="w-4 h-4" /></a>
          </div>
        )}

        {/* Price */}
        {ride.estimated_price && (
          <div className="flex justify-between items-center font-bold text-lg">
            <span>Price</span>
            <span>{formatCurrency(ride.final_price || ride.estimated_price)}</span>
          </div>
        )}

        {/* Actions */}
        {ride.status === 'searching' && (
          <div className="text-center py-4">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm font-medium">Searching for nearby drivers...</p>
          </div>
        )}
        {ride.status !== 'completed' && ride.status !== 'cancelled' && (
          <button onClick={() => setShowCancel(true)} className="w-full py-2 text-red-500 text-sm font-medium">Cancel Ride</button>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl p-6 space-y-4">
            <h3 className="font-bold text-lg">Cancel Ride</h3>
            <textarea className="w-full border rounded-xl p-3 text-sm" rows={3} placeholder="Reason for cancellation..." value={cancelReason} onChange={e => setCancelReason(e.target.value)} />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowCancel(false)}>Back</Button>
              <Button variant="destructive" className="flex-1" onClick={handleCancel}>Cancel Ride</Button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRating && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="font-bold text-lg text-center">Rate Your Ride</h3>
            <div className="flex justify-center gap-1">
              {[1,2,3,4,5].map(i => (
                <button key={i} onClick={() => setRating(i)}><Star className={`w-8 h-8 ${i <= rating ? 'fill-brand text-brand' : 'text-gray-300'}`} /></button>
              ))}
            </div>
            <textarea className="w-full border rounded-xl p-3 text-sm" rows={2} placeholder="Leave a review..." value={review} onChange={e => setReview(e.target.value)} />
            <Button className="w-full" onClick={handleRate}>Submit</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export const dynamic = "force-dynamic";
