import { Injectable } from '@nestjs/common';
import { Coffee } from './entities/coffee.entity';
@Injectable()
export class CoffeesService {
  private coffees: Coffee[] = [
    {
      id: 1,
      name: 'Utrapower',
      brand: 'Bru',
      flavours: ['chocolate', 'vanilla'],
    },
  ];

  findAll() {
    return this.coffees;
  }

  findOne(id: string) {
    return this.coffees.find((item) => item.id === +id);
  }

  create(createCoffeeDto: any) {
    this.coffees.push(createCoffeeDto);
    return createCoffeeDto;
  }

  update(id: string, updateCoffeeDto: any) {
    const existingCoffee = this.findOne(id);
    if (existingCoffee) {
      //update the existing coffee
    }
  }

  remove(id: string) {
    this.coffees = this.coffees.filter((item) => item.id !== +id);
  }
}
