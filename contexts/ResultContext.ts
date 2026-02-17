import { createContext } from "react";

interface ResultContextType {
  result: string | null;
  setResult: (val: string) => void;
}

export const ResultContext = createContext<ResultContextType | undefined>(
  undefined,
);
