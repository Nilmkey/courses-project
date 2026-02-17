import { SetStateAction, Dispatch, createContext } from "react";

interface ZoomContextType {
  zoom: number;
  setZoom: Dispatch<SetStateAction<number>>;
}

export const ZoomContext = createContext<ZoomContextType | undefined>(
  undefined,
);
