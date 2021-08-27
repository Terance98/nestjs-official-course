import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Flavour } from './flavour.entity';

@Entity()
export class Coffee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  descriptions: string;

  @Column()
  brand: string;

  @Column({ default: 0 })
  reccomendations: number;

  @JoinTable()
  @ManyToMany((type) => Flavour, (flavour) => flavour.coffees, {
    cascade: true, //['insert'] => flavours with coffee will automatically be inserted into the coffee table
  })
  flavours: Flavour[];
}
