import { create } from "zustand";
import type { Ride, DriverProfile } from "@/types";

interface RideState {
  currentRide: Ride | null;
  activeDrivers: DriverProfile[];
  setCurrentRide: (r: Ride | null) => void;
  setActiveDrivers: (d: DriverProfile[]) => void;
  updateRideStatus: (status: string) => void;
}

export const useRideStore = create<RideState>((set) => ({
  currentRide: null,
  activeDrivers: [],
  setCurrentRide: (currentRide) => set({ currentRide }),
  setActiveDrivers: (activeDrivers) => set({ activeDrivers }),
  updateRideStatus: (status) => set((s) => ({ currentRide: s.currentRide ? { ...s.currentRide, status } as Ride : null })),
}));
