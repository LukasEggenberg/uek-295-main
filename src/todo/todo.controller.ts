import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { JwtAuthGuard } from '../sample/modules/auth/guards/jwt-auth.guard';
import { RoleGuard } from '../sample/modules/auth/guards/role.gard';
import { Roles } from '../sample/decorators/roles.decorator';

@Controller('todo')
@UseGuards(JwtAuthGuard, RoleGuard)
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Post()
  @Roles('user', 'admin')
  create(@Body() createTodoDto: CreateTodoDto) {
    return this.todoService.create(createTodoDto);
  }

  @Get()
  @Roles('user', 'admin')
  findAll() {
    return this.todoService.findAll();
  }

  @Get(':id')
  @Roles('user', 'admin')
  findOne(@Param('id') id: string) {
    return this.todoService.findOne(+id);
  }

  @Patch(':id')
  @Roles('user', 'admin')
  updatePartial(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto) {
    return this.todoService.update(+id, updateTodoDto);
  }

  @Put(':id')
  @Roles('user', 'admin')
  updateFull(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto) {
    return this.todoService.update(+id, updateTodoDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.todoService.remove(+id);
  }
}
