import { Colors } from "./colors";

export default interface Player {
  id: string;
  username: string;
  color: Colors;
  bot: boolean;
  socketId?: string;
}
