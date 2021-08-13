import { User } from "src/typeorm";
import { UserDetails } from "src/utils/type";

export interface AuthenticationProvider {
  validateUser(details: UserDetails);
  createUser(details: UserDetails);
  findUser(discordId: string): Promise<User | undefined>;
}
