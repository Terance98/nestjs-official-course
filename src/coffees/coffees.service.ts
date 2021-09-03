import { Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { Coffee } from './entities/coffee.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { Flavour } from './entities/flavour.entity';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { Event } from '../events/entities/event.entity';
// import { COFFEE_BRANDS } from './coffees.constants';
import { ConfigService, ConfigType } from '@nestjs/config';
import CoffeesConfig from './config/coffees.config';

// If we declare the service as request scoped, all the other classes which makes use of this service via dependency injection will automatically be request
// scoped as well. The scope basically will bubble up to the upper layers.
// Making the server as request scoped can also have performance drop. It is recommended to keep it in singleton (defualt) scope to optimise for better performance
// Otherwise for each request certain class instances will have to be created. May be even db connections will also get re-established.
// @Injectable({ scope: Scope.REQUEST })
@Injectable()
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee)
    private readonly coffeeRepository: Repository<Coffee>,
    @InjectRepository(Flavour)
    private readonly flavourRepository: Repository<Flavour>,
    private readonly connection: Connection,
    // @Inject(COFFEE_BRANDS) coffeeBrands: string[],
    // Ideal method to import a module dependant config variables. It ensures type safety
    @Inject(CoffeesConfig.KEY)
    private readonly coffeesConfiguration: ConfigType<typeof CoffeesConfig>,
    private readonly configService: ConfigService,
  ) {
    // console.log(coffeeBrands);
    // console.log('Coffee service instantiated');
    // console.log(process.env.DATABASE_HOST);
    // Here the second value localhost is like a default value which will be used if we were not able to read the DATABASE_NAME initially
    // const database = this.configService.get('database.host', 'localhost');
    // const coffeesConfig = this.configService.get('coffees', 'localhost');
    //The below 2 has not much type safety since we are dealing with objects
    // console.log(database);
    // console.log(coffeesConfig);
    //This method has really good type safety since we are dealing with objects here
    // console.log(coffeesConfiguration);
  }

  findAll(paginationQuery: PaginationQueryDto) {
    const { limit, offset } = paginationQuery;
    return this.coffeeRepository.find({
      relations: ['flavours'],
      skip: offset,
      take: limit,
    });
  }

  async findOne(id: string) {
    const coffee = await this.coffeeRepository.findOne(id, {
      relations: ['flavours'],
    });
    if (!coffee) throw new NotFoundException(`Coffee #${id} not found`);
    return coffee;
  }

  async create(createCoffeeDto: CreateCoffeeDto) {
    // This will fetch the flavours if already exists from the flavours table or will create and return
    const flavours = await Promise.all(
      createCoffeeDto.flavours.map((name) => this.preloadFlavourByName(name)),
    );
    const coffee = this.coffeeRepository.create({
      ...createCoffeeDto,
      flavours,
    });
    return this.coffeeRepository.save(coffee);
  }

  async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
    const flavours =
      updateCoffeeDto.flavours &&
      (await Promise.all(
        updateCoffeeDto.flavours.map((name) => this.preloadFlavourByName(name)),
      ));
    // Preload will first check in the database if the entity already exists, if so it will update with the new values
    // If the entity is not already found, it will return undefined
    const coffee = await this.coffeeRepository.preload({
      id: +id,
      ...updateCoffeeDto,
      flavours,
    });
    if (!coffee) throw new NotFoundException(`Coffee #${id} not found`);
    return this.coffeeRepository.save(coffee);
  }

  async remove(id: string) {
    const coffee = await this.findOne(id);
    return this.coffeeRepository.remove(coffee);
  }

  async reccomendCoffee(coffee: Coffee) {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      coffee.reccomendations++;
      const reccomendedEvent = new Event();
      reccomendedEvent.name = 'recommend_coffee';
      reccomendedEvent.type = 'coffee';
      reccomendedEvent.payload = { coffeeId: coffee.id };

      await queryRunner.manager.save(coffee);
      await queryRunner.manager.save(reccomendedEvent);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  private async preloadFlavourByName(name: string): Promise<Flavour> {
    const existingFlavour = await this.flavourRepository.findOne({ name });
    if (existingFlavour) return existingFlavour;
    return this.flavourRepository.create({ name });
  }
}
