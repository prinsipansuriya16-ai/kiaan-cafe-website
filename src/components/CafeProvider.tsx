import { createContext, useContext, useState, type ReactNode } from "react";
import type { MenuItem } from "@/data/menu";
import { OrderModal } from "./OrderModal";
import { ReservationModal } from "./ReservationModal";

type CafeCtx = {
  openOrder: (item?: MenuItem) => void;
  openReservation: () => void;
};

const Ctx = createContext<CafeCtx | null>(null);

export function useCafe() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCafe outside provider");
  return c;
}

export function CafeProvider({ children }: { children: ReactNode }) {
  const [orderOpen, setOrderOpen] = useState(false);
  const [reservationOpen, setReservationOpen] = useState(false);
  const [seedItem, setSeedItem] = useState<MenuItem | undefined>();

  return (
    <Ctx.Provider
      value={{
        openOrder: (item) => {
          setSeedItem(item);
          setOrderOpen(true);
        },
        openReservation: () => setReservationOpen(true),
      }}
    >
      {children}
      <OrderModal
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        seedItem={seedItem}
      />
      <ReservationModal
        open={reservationOpen}
        onClose={() => setReservationOpen(false)}
      />
    </Ctx.Provider>
  );
}