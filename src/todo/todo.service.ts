import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo } from './entities/todo.entity';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>,
  ) {}

  async create(createTodoDto: CreateTodoDto): Promise<Todo> {
    if (!createTodoDto.description) {
      throw new BadRequestException('The required field description is missing in the object!');
    }
    try {
      const newTodo = this.todoRepository.create(createTodoDto);
      return await this.todoRepository.save(newTodo);
    } catch {
      // If save fails or any error occurs, we throw a BadRequestException
      throw new BadRequestException('The required field title is missing in the object!');
    }
  }

  async findAll(): Promise<Todo[]> {
    try {
      return await this.todoRepository.find();
    } catch {
      throw new InternalServerErrorException('Failed to retrieve ToDo items');
    }
  }

  async findOne(id: number): Promise<Todo> {
    const todo = await this.todoRepository.findOne({ where: { id } });
    if (!todo) {
      throw new NotFoundException(`ToDo with ID ${id} not found`);
    }
    return todo;
  }

  async update(id: number, updateTodoDto: UpdateTodoDto): Promise<Todo> {
    try {
      await this.todoRepository.update(id, updateTodoDto);
      return await this.findOne(id);
    } catch {
      throw new BadRequestException('Invalid data provided');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.todoRepository.delete(id);
    } catch {
      throw new InternalServerErrorException(`Failed to delete ToDo with ID ${id}`);
    }
  }
}
