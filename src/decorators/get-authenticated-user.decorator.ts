import type { ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { UserEntity } from 'src/api/user/entities/user.entity';
import type { GetAuthenticatedUserDecoratorResult } from 'src/types/media-manager.types';

import { createParamDecorator } from '@nestjs/common';

const extractUserFactory = (data: any, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<Request>();

  const { email, id } = request.user as UserEntity;

  return {
    email,
    id: id.toString(),
  } as GetAuthenticatedUserDecoratorResult;
};

export const GetAuthenticatedUser = createParamDecorator(extractUserFactory);
