import { useEffect, useState } from "react";
import { Guest } from "@mindfulstudio/ms-web-live-types";
import { io } from "socket.io-client";

type Socket = ReturnType<typeof io> | null;

type Props = {
  onUpdate: (guests: Guest[]) => void;
};

const useSocket = ({ onUpdate }: Props) => {
  const [socket, setSocket] = useState<Socket>();

  useEffect(() => {
    const s = io();

    s.on("connect", () => {
      setSocket(s);
    });

    s.on("update", onUpdate);

    return () => {
      s.close();
    };
  }, []);

  return socket;
};

export default useSocket;
