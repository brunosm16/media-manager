import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { logErrorDetailed } from 'src/errors/error-logs';
import { Repository } from 'typeorm';

import type { CreateUserDto, UpdateUserDto } from './dto';
import type { EncryptUserCredentialsResultDto } from './dto/encrypt-user-data.result.dto';

import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    try {
      const { email } = createUserDto;

      const userExists = await this.findUserByEmail(email);

      if (userExists) {
        throw new BadRequestException('User already exists');
      }

      return await this.userRepository.save({
        email,
        ...(await this.encryptUserCredentials(createUserDto)),
      });
    } catch (err) {
      logErrorDetailed(err, 'Error while saving a user');
      throw err;
    }
  }

  async encryptUserCredentials(
    user: CreateUserDto
  ): Promise<EncryptUserCredentialsResultDto> {
    const salt = await bcrypt.genSalt();

    return {
      hash: await bcrypt.hash(user.password, salt),
      salt,
    };
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async findUserByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOneBy({ email });
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }
}
