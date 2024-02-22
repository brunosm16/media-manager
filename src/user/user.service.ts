import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import {
  assignObjectToAnother,
  objectIsEmpty,
  removeObjectEmptyValues,
} from 'src/utils';
import { logErrorDetailed } from 'src/utils/logs';
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

  async buildUserToUpdate(
    existingUser: UserEntity,
    payload: UpdateUserDto
  ): Promise<UserEntity> {
    if (payload?.password) {
      const encryptedCredentials = await this.encryptUserCredentials(payload);
      Object.assign(existingUser, encryptedCredentials);
      Object.assign(payload, { password: undefined });
    }

    const nonEmptyFields = removeObjectEmptyValues(payload);

    const result = assignObjectToAnother(
      existingUser,
      nonEmptyFields
    ) as UserEntity;

    return result;
  }

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
    user: CreateUserDto | UpdateUserDto
  ): Promise<EncryptUserCredentialsResultDto> {
    const salt = await bcrypt.genSalt();

    return {
      hash: await bcrypt.hash(user.password, salt),
      salt,
    };
  }

  findAll() {
    return this.userRepository.find();
  }

  findOne(id: string) {
    return this.userRepository.findOneBy({ id });
  }

  async findUserByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOneBy({ email });
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  runUpdateValidations(
    existingUser: UserEntity | null,
    updateUserDto: UpdateUserDto
  ): void {
    if (!existingUser) {
      throw new BadRequestException('User not found');
    }

    if (objectIsEmpty(updateUserDto)) {
      throw new BadRequestException('No fields to update');
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    try {
      const existingUser = await this.findOne(id);

      this.runUpdateValidations(existingUser, updateUserDto);

      const user = await this.buildUserToUpdate(existingUser, updateUserDto);
      const result = await this.userRepository.save(user);

      if (!result) {
        throw new BadRequestException('User was not updated');
      }

      Logger.log(`User with id ${id} was updated`);

      return result;
    } catch (err) {
      logErrorDetailed(err, 'Error while updating a user');
      throw err;
    }
  }
}
