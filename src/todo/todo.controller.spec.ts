import { Test, TestingModule } from '@nestjs/testing';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Todo } from './entities/todo.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleGuard } from '../sample/modules/auth/guards/role.guard';

// Mock data for Todo entity
const mockTodo = { id: 1, title: 'Test Todo', description: 'Test description' };
const nonAdminUser = { name: 'User', roles: ['user'] }; // Mock non-admin user
const adminUser = { name: 'Admin', roles: ['admin'] }; // Mock admin user

describe('TodoController', () => {
  let todoController: TodoController;
  let todoService: TodoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [
        TodoService,
        {
          provide: getRepositoryToken(Todo),
          useClass: Repository,
        },
      ],
    }).compile();

    todoController = module.get<TodoController>(TodoController);
    todoService = module.get<TodoService>(TodoService);
  });

  it('controller should be defined', () => {
    expect(todoController).toBeDefined();
  });

  describe('findOne', () => {
    it('positive: should return a valid todo item', async () => {
      const id = '1'; // id should be a string, as per the controller route parameter
      const result = { id: 1, title: 'Test Todo', description: 'Test Descr', closed: true };

      jest.spyOn(todoService, 'findOne').mockResolvedValue(result);

      const foundTodo = await todoController.findOne(id);
      expect(foundTodo).toBe(result);
      expect(todoService.findOne).toHaveBeenCalledWith(1); // We can still convert the string to a number in the service
    });

    
  });

  describe('delete', () => {
    it('positive: should delete a todo', async () => {
      jest.spyOn(todoService, 'remove').mockResolvedValue(undefined); // Mocking the service's `remove` method to return `undefined`

      // Call the `remove` method with the ID of the Todo and an admin user
      await expect(todoController.remove('1')).resolves.toBeUndefined(); // ID should be passed as string (as per the route param)
      
      // Ensure the remove method in the service is called with the correct ID (converted to number inside the service)
      expect(todoService.remove).toHaveBeenCalledWith(1); // Service expects a number, so we verify it is passed as a number
    });
  });
});
