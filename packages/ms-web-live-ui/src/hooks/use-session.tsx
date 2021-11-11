import { createContext, useContext } from "react";
import { Session } from "@mindfulstudio/ms-web-live-types";

export const SessionContext = createContext<Session | null>(null);

const useSession = () => {
  return useContext(SessionContext);
};

export default useSession;
