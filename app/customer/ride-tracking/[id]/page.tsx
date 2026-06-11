'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import dynamicImport from 'next/dynamic';
import { MapPin, Phone, Star, X, Shield, MessageCircle, Clock } from 'lucide-react';

const LiveMap = dynamicImport(() => import('@/components/maps/LiveMap'), { ssr: false });
const STATUS_STEPS = ['searching', 'accepted', 'arriving', 'in_progress', 'completed'];

export default function RideTrackingPage() {
  const params = useParams(); const router = useRouter(); const supabase = createClient();
  const [ride, setRide] = useState<any>(null); const [driver, setDriver] = useState<any>(null);
  const [driverLoc, setDriverLoc] = useState({ lat: 0, lng: 0 });
  const [showCancel, setShowCancel] = useState(false); const [cancelReason, setCancelReason] = useState('');
  const [showRating, setShowRating] = useState(false); const [rating, setRating] = useState(0); const [review, setReview] = useState('');

  useEffect(() => {
    fetchRide();
    const channel = supabase.channel('ride-'+params.id)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rides', filter: 'id=eq.'+params.id }, (p: any) => { setRide(p.new); if(p.new.status==='completed') setShowRating(true); })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ride_tracking', filter: 'ride_id=eq.'+params.id }, (p: any) => setDriverLoc({lat:p.new.driver_lat,lng:p.new.driver_lng}))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [params.id]);

  const fetchRide = async () => {
    const { data } = await supabase.from('rides').select('*, driver:driver_id(full_name, phone, driver_profiles!inner(vehicle_make, vehicle_model, vehicle_plate, vehicle_color, rating))').eq('id', params.id).single();
    if(data){setRide(data);setDriver(data.driver?.driver_profiles);}
  };

  const handleCancel = async () => { if(!cancelReason){toast.error('Provide a reason');return;} await supabase.from('rides').update({status:'cancelled',cancelled_by:'customer',cancel_reason:cancelReason}).eq('id',params.id); toast.success('Ride cancelled'); setShowCancel(false); };
  const handleRate = async () => { if(rating===0){toast.error('Select rating');return;} await supabase.from('rides').update({customer_rating:rating,customer_review:review}).eq('id',params.id); toast.success('Thanks!'); setShowRating(false); router.push('/customer/dashboard'); };

  if(!ride) return <div className="h-screen bg-surface flex items-center justify-center"><div className="w-12 h-12 border-2 border-brand border-t-transparent rounded-full animate-spin"/></div>;

  const currentStep = STATUS_STEPS.indexOf(ride.status);
  const statusLabels: Record<string,string> = {searching:'Finding driver',accepted:'Driver on the way',arriving:'Driver arriving',in_progress:'Ride in progress',completed:'Complete'};
  const sClass = (s:string) => { const m: Record<string,string> = {searching:'status-searching',accepted:'status-accepted',arriving:'status-arriving',in_progress:'status-in-progress',completed:'status-completed',cancelled:'status-cancelled'}; return m[s]||''; };

  return (
    <div className="h-screen bg-surface flex flex-col">
      <div className="flex-1 relative">
        <LiveMap rideId={params.id as string} driverLat={driverLoc.lat} driverLng={driverLoc.lng} pickupLat={ride.pickup_lat} pickupLng={ride.pickup_lng} />
        <div className="absolute top-4 left-4 z-10"><button onClick={()=>router.back()} className="w-10 h-10 rounded-xl glass-card flex items-center justify-center"><X className="w-5 h-5 text-foreground/70"/></button></div>
        {ride.status!=='completed'&&ride.status!=='cancelled'&&<div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 glass-card-elevated px-4 py-2 rounded-full"><div className="flex items-center gap-2"><Clock className="w-4 h-4 text-brand animate-pulse-soft"/><span className="text-sm font-semibold text-foreground">{statusLabels[ride.status]||ride.status}</span></div></div>}
      </div>
      <div className="bottom-sheet px-5 py-5 space-y-4 max-h-[50vh] overflow-y-auto">
        <div className="flex items-center justify-between px-1">{STATUS_STEPS.slice(0,4).map((s,i)=><div key={s} className="flex items-center flex-1"><div className={'stepper-dot '+(i<=currentStep?'stepper-dot-active':'stepper-dot-inactive')}/>{i<3&&<div className={'stepper-line '+(i<currentStep?'stepper-line-active':'stepper-line-inactive')}/>}<span className="text-[9px] text-muted-foreground absolute -bottom-5 left-1/2 -translate-x-1/2 capitalize">{s.replace('_',' ')}</span></div>)}</div>
        {ride.driver&&<div className="driver-card mt-8"><div className="w-12 h-12 rounded-full bg-brand/20 flex items-center justify-center text-lg font-bold text-brand shrink-0">{ride.driver.full_name?.[0]}</div><div className="flex-1 min-w-0"><p className="font-semibold text-foreground">{ride.driver.full_name}</p><p className="text-xs text-muted-foreground">{ride.driver.driver_profiles?.vehicle_make} {ride.driver.driver_profiles?.vehicle_model} - {ride.driver.driver_profiles?.vehicle_plate}</p><div className="flex items-center gap-1 text-xs mt-1"><Star className="w-3 h-3 fill-warning text-warning"/><span className="text-warning font-medium">{ride.driver.driver_profiles?.rating?.toFixed(1)||'5.0'}</span></div></div><div className="flex gap-2"><a href={'tel:'+ride.driver.phone} className="w-10 h-10 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center text-success"><Phone className="w-4 h-4"/></a><button className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand"><MessageCircle className="w-4 h-4"/></button></div></div>}
        {ride.status!=='completed'&&ride.status!=='cancelled'&&<div className="flex items-center justify-between pt-2"><div><p className="text-xs text-muted-foreground">Estimated Fare</p><p className="text-xl font-extrabold text-brand">{ride.estimated_price?formatCurrency(ride.estimated_price):'--'}</p></div><button onClick={()=>setShowCancel(true)} className="text-sm text-destructive font-medium px-4 py-2 rounded-xl border border-destructive/20 hover:bg-destructive/10">Cancel</button></div>}
        <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center"><Shield className="w-3.5 h-3.5 text-success"/>Ride tracked for safety</div>
      </div>
      {showCancel&&<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end animate-fade-in"><div className="bg-surface-elevated w-full rounded-t-3xl p-6 space-y-4 border-t border-border"><h3 className="font-bold text-lg text-foreground">Cancel Ride</h3><textarea className="w-full bg-surface border border-border rounded-xl p-3 text-sm text-foreground" rows={3} placeholder="Reason..." value={cancelReason} onChange={e=>setCancelReason(e.target.value)}/><div className="flex gap-2"><button onClick={()=>setShowCancel(false)} className="flex-1 py-3 rounded-xl border border-border text-muted-foreground font-medium">Back</button><button onClick={handleCancel} className="flex-1 py-3 rounded-xl bg-destructive text-white font-semibold">Cancel Ride</button></div></div></div>}
      {showRating&&<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"><div className="bg-surface-elevated rounded-3xl p-6 w-full max-w-sm space-y-5 border border-border"><h3 className="font-bold text-xl text-center text-foreground">Rate Your Ride</h3><div className="flex justify-center gap-2">{[1,2,3,4,5].map(i=><button key={i} onClick={()=>setRating(i)} className="hover:scale-110 transition-transform"><Star className={'w-10 h-10 '+(i<=rating?'fill-warning text-warning':'text-muted')}/></button>)}</div><textarea className="w-full bg-surface border border-border rounded-xl p-3 text-sm text-foreground" rows={2} placeholder="Tell us about your ride..." value={review} onChange={e=>setReview(e.target.value)}/><button onClick={handleRate} className="w-full bg-brand text-white py-3.5 rounded-xl font-bold">Submit Rating</button></div></div>}
    </div>
  );
}
