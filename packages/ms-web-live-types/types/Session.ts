import { object, Infer, nullable } from "superstruct";
import { GuestStruct } from "./Guest";

export const SessionStruct = nullable(
  object({
    guest: GuestStruct,
  })
);

export type Session = Infer<typeof SessionStruct>;
