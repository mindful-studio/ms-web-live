import { useEffect, useRef, useState } from "react";
import { Guest } from "@mindfulstudio/ms-web-live-types";
import { io } from "socket.io-client";

type Socket = ReturnType<typeof io> | null;

type Props = {
  onUpdate: (guests: Guest[]) => void;
};

const useSocket = ({ onUpdate }: Props) => {
  const [connected, setConnected] = useState(false);
  const socket = useRef<Socket>(null);

  useEffect(() => {
    socket.current = io();

    socket.current.on("connect", () => {
      setConnected(true);
    });

    socket.current.on("update", onUpdate);

    () => {
      if (socket.current != null) {
        socket.current.close();
      }
    };
  }, []);

  return {
    connected,
    socket,
  };
};

export default useSocket;
