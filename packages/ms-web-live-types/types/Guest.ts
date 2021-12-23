import { object, string, Infer } from "superstruct";

export const GuestStruct = object({
  id: string(),
});

export type Guest = Infer<typeof GuestStruct>;
