import type { ConfigService } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

const entities = [
  'dist/**/*.entity{.ts,.js}',
  'src/**/*.entity{.ts,.js',
  `${__dirname}/../**/*.entity.{ts,js}`,
];

export const typeOrmDatabaseConfiguration = (
  configService: ConfigService
): TypeOrmModuleOptions => ({
  database: configService.get<string>('DATABASE_NAME'),
  entities,
  host: configService.get<string>('DATABASE_HOST'),
  password: configService.get<string>('DATABASE_PASSWORD'),
  port: parseInt(configService.get<string>('DATABASE_PORT'), 10),
  synchronize: true,
  type: 'postgres',
  username: configService.get<string>('DATABASE_USER'),
});
