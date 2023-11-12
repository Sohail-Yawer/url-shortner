import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Link {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column({ unique: true })
  urlHash: string;
}
