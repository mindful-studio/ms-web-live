import { createContext, useContext } from "react";
import { Session } from "@mindfulstudio/ms-web-live-types";

export const SessionContext = createContext<Session | undefined>(undefined);

const useSession = () => {
  return useContext(SessionContext);
};

export default useSession;
