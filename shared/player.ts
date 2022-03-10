import { Colors } from "./colors";

export default interface Player {
  id: string;
  username: string;
  color: Colors;
  socketId?: string;
}
