import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity("waitlist_entries")
export class WaitlistEntry {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 120 })
  fullName!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 254 })
  email!: string;

  @Column({ type: "varchar", length: 64 })
  role!: string;

  @Column({ type: "varchar", length: 200, nullable: true })
  institution!: string | null;

  @CreateDateColumn({ type: "datetime" })
  createdAt!: Date;
}
