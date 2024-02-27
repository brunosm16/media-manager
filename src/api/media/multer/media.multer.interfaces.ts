import type { Request } from 'express';
import type { UserEntity } from 'src/api/user/entities/user.entity';

export interface MediaMulterRequest extends Request {
  user: UserEntity;
}
