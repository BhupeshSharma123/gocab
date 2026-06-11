import { create } from "zustand";

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface MapState {
  pickup: Location | null;
  dropoff: Location | null;
  setPickup: (l: Location) => void;
  setDropoff: (l: Location) => void;
  reset: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  pickup: null,
  dropoff: null,
  setPickup: (pickup) => set({ pickup }),
  setDropoff: (dropoff) => set({ dropoff }),
  reset: () => set({ pickup: null, dropoff: null }),
}));
