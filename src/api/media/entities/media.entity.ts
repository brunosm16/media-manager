import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { MediaTypeEnum } from '../enums/media.enums';

export class Media {
  @CreateDateColumn()
  createdAt: string;

  @DeleteDateColumn({ nullable: true })
  deletedAt: string;

  @Column()
  description: string;

  @Column('uuid')
  dispositiveId: string;

  @PrimaryGeneratedColumn()
  id: string;

  @Column({
    default: false,
    type: 'boolean',
  })
  isFavorite: boolean;

  @Column({ nullable: true })
  mediaFilePath: string;

  @Column({ nullable: true })
  mediaImageRescalePath: string;

  @Column({
    default: MediaTypeEnum.OTHER,
    enum: MediaTypeEnum,
    type: 'enum',
  })
  mediaType: MediaTypeEnum;

  @Column({ nullable: true })
  mediaVideoThumbnail: string;

  @Column({ nullable: true })
  mimeType: string;

  @UpdateDateColumn()
  updatedAt: string;

  @Column('uuid')
  userId: string;
}
