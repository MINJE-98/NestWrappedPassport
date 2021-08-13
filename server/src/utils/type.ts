import { User } from "../typeorm";

export type UserDetails = {
  username: string;
  profileUrl: string;
  nodeId: string;
  provider: string;
  accessToken: string;
};

export type Done = (err: Error, user: User) => void;
