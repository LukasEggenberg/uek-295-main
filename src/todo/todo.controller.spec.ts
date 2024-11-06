import { Test, TestingModule } from '@nestjs/testing';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo } from './entities/todo.entity';

const mockTodo: Todo = {
  id: 1,
  title: 'Test Todo',
  description: 'Test Description',
  closed: false,
};

class MockTodoService {
  async create(createTodoDto: CreateTodoDto) {
    if (!createTodoDto.description) throw new BadRequestException('The required field description is missing in the object!');
    return { ...mockTodo, ...createTodoDto };
  }
  async findAll() {
    return [mockTodo];
  }
  async findOne(id: number) {
    if (id !== mockTodo.id) throw new NotFoundException(`ToDo with ID ${id} not found`);
    return mockTodo;
  }
  async update(id: number, updateTodoDto: UpdateTodoDto) {
    if (id !== mockTodo.id) throw new NotFoundException(`ToDo with ID ${id} not found`);
    return { ...mockTodo, ...updateTodoDto };
  }
  async remove(id: number) {
  }
}

describe('TodoController', () => {
  let controller: TodoController;
  let service: TodoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [{ provide: TodoService, useClass: MockTodoService }],
    }).compile();

    controller = module.get<TodoController>(TodoController);
    service = module.get<TodoService>(TodoService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a todo', async () => {
      const createTodoDto: CreateTodoDto = { title: 'New Todo', description: 'New Description' };
      expect(await controller.create(createTodoDto)).toEqual({ ...mockTodo, ...createTodoDto });
    });

    it('should throw BadRequestException if description is missing', async () => {
      const createTodoDto: CreateTodoDto = { title: 'New Todo', description: '' };
      await expect(controller.create(createTodoDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return an array of todos', async () => {
      expect(await controller.findAll()).toEqual([mockTodo]);
    });
  });

  describe('findOne', () => {
    it('should return a todo if it exists', async () => {
      expect(await controller.findOne('1')).toEqual(mockTodo);
    });

    it('should throw NotFoundException if the todo does not exist', async () => {
      await expect(controller.findOne('2')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePartial', () => {
    it('should update and return the updated todo', async () => {
      const updateTodoDto: UpdateTodoDto = { title: 'Updated Todo', description: 'Updated Description' };
      expect(await controller.updatePartial('1', updateTodoDto)).toEqual({ ...mockTodo, ...updateTodoDto });
    });

    it('should throw NotFoundException if the todo does not exist for partial update', async () => {
      const updateTodoDto: UpdateTodoDto = { title: 'Updated Todo', description: 'Updated Description' };
      await expect(controller.updatePartial('2', updateTodoDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateFull', () => {
    it('should replace and return the updated todo', async () => {
      const updateTodoDto: UpdateTodoDto = { title: 'Replaced Todo', description: 'Replaced Description' };
      expect(await controller.updateFull('1', updateTodoDto)).toEqual({ ...mockTodo, ...updateTodoDto });
    });

    it('should throw NotFoundException if the todo does not exist for full update', async () => {
      const updateTodoDto: UpdateTodoDto = { title: 'Replaced Todo', description: 'Replaced Description' };
      await expect(controller.updateFull('2', updateTodoDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should throw ForbiddenException if the user does not have admin rights', async () => {
      jest.spyOn(service, 'remove').mockRejectedValue(new ForbiddenException('Access denied'));
      await expect(controller.remove('2')).rejects.toThrow(ForbiddenException);
    });
  });

  it('negative: should deny a normal user from deleting', async () => {
    // given
    const todoId = '1';
    jest.spyOn(service, 'remove').mockResolvedValue();

    try {
      // when
      await controller.remove(todoId);
    } catch (error) {
      // then
      expect(error).toBeInstanceOf(ForbiddenException);
      expect(error.message).toBe('Access denied');
      expect(service.remove).not.toHaveBeenCalled();
    }
  });

});
