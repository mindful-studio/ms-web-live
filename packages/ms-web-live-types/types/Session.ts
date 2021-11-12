import { object, Infer } from "superstruct";
import { io } from "socket.io-client";
import { GuestStruct } from "./Guest";

export const SessionStruct = object({
  guest: GuestStruct,
});

export interface Session extends Infer<typeof SessionStruct> {
  socket: ReturnType<typeof io>;
  stream: MediaStream;
}
