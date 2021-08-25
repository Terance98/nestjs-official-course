import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coffee } from './entities/coffee.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
@Injectable()
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee)
    private readonly coffeeRepository: Repository<Coffee>,
  ) {}

  findAll() {
    return this.coffeeRepository.find();
  }

  async findOne(id: string) {
    const coffee = await this.coffeeRepository.findOne(id);
    if (!coffee) throw new NotFoundException(`Coffee #${id} not found`);
    return coffee;
  }

  create(createCoffeeDto: CreateCoffeeDto) {
    // this.coffees.push(createCoffeeDto);
    const coffee = this.coffeeRepository.create(createCoffeeDto);
    return this.coffeeRepository.save(coffee);
  }

  async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
    // Preload will first check in the database if the entity already exists, if so it will update with the new values
    // If the entity is not already found, it will return undefined
    const coffee = await this.coffeeRepository.preload({
      id: +id,
      ...updateCoffeeDto,
    });
    if (!coffee) throw new NotFoundException(`Coffee #${id} not found`);
    return this.coffeeRepository.save(coffee);
  }

  async remove(id: string) {
    const coffee = await this.findOne(id);
    return this.coffeeRepository.remove(coffee);
  }
}
