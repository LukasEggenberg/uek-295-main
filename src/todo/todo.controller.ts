import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { ReturnTodoDto } from './dto/return-todo.dto';
import { JwtAuthGuard } from '../sample/modules/auth/guards/jwt-auth.guard';
import { RoleGuard } from '../sample/modules/auth/guards/role.guard';
import { Roles } from '../sample/decorators/roles.decorator';
import { Todo } from './entities/todo.entity';

@ApiTags('Todos')
@ApiBearerAuth()
@Controller('todo')
@UseGuards(JwtAuthGuard, RoleGuard)
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Post()
  @Roles('user', 'admin')
  @ApiOperation({ summary: 'Create a new ToDo item' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'ToDo created successfully', type: ReturnTodoDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid data provided' })
  create(@Body() createTodoDto: CreateTodoDto): Promise<Todo> {
    return this.todoService.create(createTodoDto);
  }

  @Get()
  @Roles('user', 'admin')
  @ApiOperation({ summary: 'List all ToDo items' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of ToDo items', type: [ReturnTodoDto] })
  findAll(): Promise<Todo[]> {
    return this.todoService.findAll();
  }

  @Get(':id')
  @Roles('user', 'admin')
  @ApiOperation({ summary: 'Retrieve a specific ToDo item by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'ToDo found', type: ReturnTodoDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'ToDo not found' })
  findOne(@Param('id') id: string): Promise<Todo | undefined> {
    return this.todoService.findOne(+id);
  }

  @Patch(':id')
  @Roles('user', 'admin')
  @ApiOperation({ summary: 'Update specific fields of a ToDo item' })
  @ApiResponse({ status: HttpStatus.OK, description: 'ToDo updated successfully', type: ReturnTodoDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'ToDo not found' })
  updatePartial(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto): Promise<Todo | undefined> {
    return this.todoService.update(+id, updateTodoDto);
  }

  @Put(':id')
  @Roles('user', 'admin')
  @ApiOperation({ summary: 'Replace a ToDo item entirely' })
  @ApiResponse({ status: HttpStatus.OK, description: 'ToDo replaced successfully', type: ReturnTodoDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'ToDo not found' })
  updateFull(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto): Promise<Todo | undefined> {
    return this.todoService.update(+id, updateTodoDto);
  }

  @Delete(':id')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @ApiOperation({ summary: 'Delete a ToDo item' })
  @ApiResponse({ status: HttpStatus.OK, description: 'ToDo deleted successfully', type: ReturnTodoDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'ToDo not found' })
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<Todo> {
    const todo = await this.todoService.findOne(+id);
    await this.todoService.remove(+id);
    return todo;
  }
}
