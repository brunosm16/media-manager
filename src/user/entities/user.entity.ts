import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @CreateDateColumn()
  createdAt: string;

  @Column()
  email: string;

  @Column({ select: false })
  hash: string;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ select: false })
  password: string;

  @Column({ select: false })
  salt: string;
}
