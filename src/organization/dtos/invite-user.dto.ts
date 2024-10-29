import { IsEmail } from 'class-validator';

export class InviteUserDto {
  @IsEmail()
  user_email: string;
}
