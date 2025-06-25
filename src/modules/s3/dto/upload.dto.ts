import { IsString } from 'class-validator';

export class UploadDto {
  @IsString()
  filename: string;

  @IsString()
  content: string;
}
