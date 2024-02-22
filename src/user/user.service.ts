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

import type {
  CreateUserDto,
  DeleteUserResultDto,
  EncryptUserCredentialsResultDto,
  UpdateUserDto,
} from './dto';

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

      await this.validateUserExistsByEmail(email);

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

  async findAll(): Promise<UserEntity[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<UserEntity> {
    return this.userRepository.findOneBy({ id });
  }

  async findUserByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOneBy({ email });
  }

  async remove(id: string): Promise<DeleteUserResultDto> {
    try {
      await this.validateUserExistsById(id);

      const result = await this.userRepository.delete(id);

      if (!result?.affected) {
        throw new BadRequestException('User was not removed');
      }

      Logger.log(`User with id ${id} was removed`);

      return {
        deleted: true,
        id,
      } as DeleteUserResultDto;
    } catch (err) {
      logErrorDetailed(err, 'Error while removing a user');
      throw err;
    }
  }

  async runUpdateValidations(
    id: string,
    updateUserDto: UpdateUserDto
  ): Promise<void> {
    await this.validateUserExistsById(id);

    if (objectIsEmpty(updateUserDto)) {
      throw new BadRequestException('No fields to update');
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    try {
      await this.runUpdateValidations(id, updateUserDto);

      const existingUser = await this.findOne(id);

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

  async validateUserExistsByEmail(email: string): Promise<void> {
    const userExists = await this.findUserByEmail(email);

    if (userExists) {
      throw new BadRequestException('User already exists');
    }
  }

  async validateUserExistsById(id: string): Promise<void> {
    const userExists = await this.findOne(id);

    if (!userExists) {
      throw new BadRequestException('User not found');
    }
  }
}
