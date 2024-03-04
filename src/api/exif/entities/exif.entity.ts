import { MediaEntity } from 'src/api/media/entities/media.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'exif' })
export class ExifEntity {
  @Column({ nullable: true, type: 'float8' })
  apertureValue?: number;

  @Column({ nullable: true, type: 'float8' })
  brightnessValue?: number;

  @Column({ nullable: true, type: 'float8' })
  colorSpace?: number;

  @Column({ nullable: true })
  contrast?: string;

  @Column({ nullable: true })
  createDate?: string;

  @Column({ nullable: true })
  customRendered?: string;

  @Column({ nullable: true })
  dateTimeOriginal?: string;

  @Column({ nullable: true, type: 'float8' })
  digitalZoomRatio?: number;

  @Column({ nullable: true, type: 'float8' })
  exifImageHeight?: number;

  @Column({ nullable: true, type: 'float8' })
  exifImageWidth?: number;

  @Column({ nullable: true })
  exifVersion?: string;

  @Column({ nullable: true, type: 'float8' })
  exposureCompensation?: number;

  @Column({ nullable: true })
  flashpixVersion?: string;

  @Column({ nullable: true, type: 'float8' })
  fnumber?: number;

  @Column({ nullable: true, type: 'float8' })
  focalLength?: number;

  @Column({ nullable: true, type: 'float8' })
  iSO?: number;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'float8' })
  imageHeight?: number;

  @Column({ nullable: true, type: 'float8' })
  imageWidth?: number;

  @Column({ nullable: true, type: 'float8' })
  latitude?: number;

  @Column({ nullable: true })
  lensModel?: string;

  @Column({ nullable: true, type: 'float8' })
  longitude?: number;

  @Column({ nullable: true })
  make?: string;

  @Column({ nullable: true, type: 'float8' })
  maxApertureValue?: number;

  @OneToOne(() => MediaEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mediaId', referencedColumnName: 'id' })
  media?: MediaEntity;

  @Index({ unique: true })
  @Column({ nullable: true, type: 'uuid' })
  mediaId?: string;

  @Column({ nullable: true })
  mediaName?: string;

  @Column({ nullable: true })
  mediaSize?: number;

  @Column({ nullable: true })
  meteringMode?: string;

  @Column({ nullable: true })
  model?: string;

  @Column({ nullable: true })
  modifyDate?: string;

  @Column({ nullable: true })
  orientation?: string;

  @Column({ nullable: true })
  resolutionUnit?: string;

  @Column({ nullable: true })
  saturation?: string;

  @Column({ nullable: true })
  sceneCaptureType?: string;

  @Column({ nullable: true })
  sceneType?: string;

  @Column({ nullable: true })
  sharpness?: string;

  @Column({ nullable: true, type: 'float8' })
  shutterSpeedValue?: number;

  @Column({ nullable: true })
  software?: string;
}
