import { ExifEntity } from 'src/api/exif/entities/exif.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { MediaTypeEnum } from '../enums/media.enums';

@Entity({ name: 'medias' })
export class MediaEntity {
  @CreateDateColumn()
  createdAt: string;

  @DeleteDateColumn({ nullable: true })
  deletedAt: string;

  @Column()
  description: string;

  @Column('uuid')
  dispositiveId: string;

  @OneToOne(() => ExifEntity, (exifEntity) => exifEntity.media)
  exif: string;

  @PrimaryGeneratedColumn('uuid')
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
  mediaVideoThumbnailPath: string;

  @Column({ nullable: true })
  mimeType: string;

  @UpdateDateColumn()
  updatedAt: string;

  @Column('uuid')
  userId: string;
}
