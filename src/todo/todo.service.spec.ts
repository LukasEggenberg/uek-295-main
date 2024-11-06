import { Test, TestingModule } from '@nestjs/testing';
import { TodoService } from './todo.service';
import { Todo } from './entities/todo.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { UpdateResult } from 'typeorm';
import { DeleteResult } from 'typeorm';

describe('TodoService', () => {
  let service: TodoService;
  let repository: Repository<Todo>;

  const mockTodo = { id: 1, title: 'Test Todo', description: 'Test description', closed: true };
  const mockTodoArray = [mockTodo];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        {
          provide: getRepositoryToken(Todo),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<TodoService>(TodoService);
    repository = module.get<Repository<Todo>>(getRepositoryToken(Todo));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a todo', async () => {
      const createTodoDto: CreateTodoDto = { title: 'New Todo', description: 'New Description' };
      const mockResult = { ...createTodoDto, id: 1, closed: false };
      jest.spyOn(repository, 'create').mockReturnValue(mockResult);
      jest.spyOn(repository, 'save').mockResolvedValue(mockResult); // Simulate a successful save

      const result = await service.create(createTodoDto);
      expect(result).toEqual(mockResult);
      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining(createTodoDto));
    });

    it('should throw BadRequestException on invalid data', async () => {
      const invalidCreateTodoDto: CreateTodoDto = { title: '', description: '' }; // Invalid data
      jest.spyOn(repository, 'save').mockRejectedValue(new Error()); // Simulate an error from the repository

      await expect(service.create(invalidCreateTodoDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return an array of todos', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue(mockTodoArray);

      const result = await service.findAll();
      expect(result).toEqual(mockTodoArray);
      expect(repository.find).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on error', async () => {
      jest.spyOn(repository, 'find').mockRejectedValue(new Error());

      await expect(service.findAll()).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findOne', () => {
    it('should return a todo if found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockTodo);

      const result = await service.findOne(1);
      expect(result).toEqual(mockTodo);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if todo not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(undefined);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return the updated todo', async () => {
      const updateTodoDto: UpdateTodoDto = { title: 'Updated Todo', description: 'Updated Description' };
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(mockTodo);
      jest.spyOn(repository, 'update').mockResolvedValue({
        affected: 1,
        raw: [],
        generatedMaps: [],
      } as UpdateResult);
      jest.spyOn(service, 'findOne').mockResolvedValue({ ...mockTodo, ...updateTodoDto });

      const result = await service.update(1, updateTodoDto);
      expect(result).toEqual({ ...mockTodo, ...updateTodoDto });
      expect(repository.update).toHaveBeenCalledWith(1, updateTodoDto);
    });

    it('should throw BadRequestException on update failure', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockTodo);
      jest.spyOn(repository, 'update').mockRejectedValue(new Error());

      await expect(service.update(1, { title: '', description: '' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete a todo', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockTodo);
      jest.spyOn(repository, 'delete').mockResolvedValue({
        affected: 1,
        raw: [],
        generatedMaps: [],
      } as DeleteResult);

      await expect(service.remove(1)).resolves.toBeUndefined();
      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw InternalServerErrorException on delete failure', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockTodo);
      jest.spyOn(repository, 'delete').mockRejectedValue(new Error());

      await expect(service.remove(1)).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw NotFoundException if todo not found for deletion', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});
