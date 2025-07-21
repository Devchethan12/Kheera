import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('users')
export class AuthEntity {
  @PrimaryColumn({ type: 'varchar', length: 30 })
  email: string;

  @Column({ type: 'varchar', length: 30 })
  username: string;

  @Column({ type: 'varchar', length: 100 })
  password: string;
}
