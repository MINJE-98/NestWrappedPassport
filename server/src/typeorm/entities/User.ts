import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "nodeId", unique: true })
  nodeId: string;

  @Column()
  username: string;

  @Column()
  profileUrl: string;

  @Column({ nullable: true })
  provider: string;

  @Column({ name: "access_token" })
  accessToken: string;

  // @Column({ name: "refresh_token" })
  // refreshToken: string;
}
