import type { ConfigModuleOptions } from '@nestjs/config';

import * as Joi from 'joi';

export const applicationConfiguration: ConfigModuleOptions = {
  envFilePath: '.env',
  isGlobal: true,
  validationSchema: Joi.object({
    DATABASE_HOST: Joi.string().required(),
    DATABASE_NAME: Joi.string().required(),
    DATABASE_PASSWORD: Joi.string().required(),
    DATABASE_PORT: Joi.number().required(),
    DATABASE_USER: Joi.string().required(),
    DEBUG_PORT: Joi.number().default(9229),
    NGINX_CONTAINER_PORT_1: Joi.number().default(80),
    NGINX_CONTAINER_PORT_2: Joi.number().default(443),
    NGINX_HOST_PORT_1: Joi.number().default(3333),
    NGINX_HOST_PORT_2: Joi.number().default(3334),
    NPM_START_SCRIPT_SUFFIX: Joi.string().default('dev'),
    REDIS_HOST: Joi.string().required(),
    REDIS_PASSWORD: Joi.string().required(),
    REDIS_PORT: Joi.number().required(),
    SERVER_PORT: Joi.number().default(3000),
  }),
};
