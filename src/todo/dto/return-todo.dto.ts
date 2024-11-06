import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateTodoDto } from './create-todo.dto';

export class ReturnTodoDto extends PartialType(CreateTodoDto) {
  @ApiProperty({ description: 'ID of the ToDo item', example: 1 })
  id: number;

  @ApiProperty({ description: 'Title of the ToDo item', example: 'Shopping' })
  title: string;

  @ApiProperty({ description: 'Description of the ToDo item', example: 'Buy milk and bread' })
  description: string;

  @ApiProperty({ description: 'Status of the ToDo item', example: false })
  closed: boolean;
}
