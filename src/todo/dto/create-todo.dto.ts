import { ApiProperty } from '@nestjs/swagger';

export class CreateTodoDto {
  @ApiProperty({ description: 'Titel des ToDo-Elements', example: 'Einkaufen' })
  title: string;

  @ApiProperty({ description: 'Beschreibung des ToDo-Elements', example: 'Milch und Brot kaufen' })
  description: string;
}
