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

  @Column()
  brand: string;

  @JoinTable()
  @ManyToMany((type) => Flavour, (flavour) => flavour.coffees, {
    cascade: true, //['insert'] => flavours with coffee will automatically be inserted into the coffee table
  })
  flavours: Flavour[];
}
