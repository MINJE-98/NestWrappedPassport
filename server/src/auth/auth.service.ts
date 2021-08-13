import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async validateUser(details) {
    const { nodeId } = details;
    const user = await this.userRepo.findOne({ nodeId });
    if (user) {
      await this.userRepo.update({ nodeId }, details);
      console.log("Updated");
      return user;
    }
    return this.createUser(details);
  }

  createUser(details) {
    const user = this.userRepo.create(details);
    return this.userRepo.save(user);
  }

  findUser(nodeId: string): Promise<User | undefined> {
    return this.userRepo.findOne({ nodeId });
  }

  status(user) {
    return "ok";
  }
}
