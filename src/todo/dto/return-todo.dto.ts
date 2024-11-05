import { PartialType } from '@nestjs/swagger';
import { CreateTodoDto } from './create-todo.dto';

export class ReturnTodoDto extends PartialType(CreateTodoDto) {
  id: number;
  title: string;
  description: string;
  closed: boolean;
}
