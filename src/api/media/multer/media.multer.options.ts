import type { HttpException } from '@nestjs/common';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import type { Request } from 'express';

import { BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';

import type { MediaMulterRequest } from './media.multer.interfaces';

import {
  ACCEPTED_FILES_REGEX,
  MEDIA_FOLDER_NAME,
} from './media.multer.constants';
import { createMediasDirectory } from './media.multer.utils';

const makeFileNotSupportedError = (fileName: null | string): HttpException => {
  const extension = extname(fileName);
  return new BadRequestException(
    `File with this extension is not supported ${extension}`
  );
};

const makeRequiredFieldError = (fieldName: string): BadRequestException => {
  throw new BadRequestException(`Field ${fieldName} is required`);
};

const extractRequestFields = (req: MediaMulterRequest, cb: any) => {
  const userId = req.user?.id;
  const dispositiveId = req?.body?.dispositiveId;

  if (!userId) {
    cb(makeRequiredFieldError('userId'), false);
  }

  if (!dispositiveId) {
    cb(makeRequiredFieldError('dispositiveId'), false);
  }

  return { dispositiveId, userId };
};

const getFilename = (file: Express.Multer.File, cb: any) => {
  const { originalname } = file;

  if (!originalname) {
    cb(makeRequiredFieldError('file name'), false);
  }

  return originalname;
};

export const mediaMulterOptions: MulterOptions = {
  fileFilter: (req: Request, file: Express.Multer.File, cb: any) => {
    const fileIsSupported = file.mimetype.match(ACCEPTED_FILES_REGEX);

    if (fileIsSupported) {
      cb(null, true);
    } else {
      cb(makeFileNotSupportedError(file?.originalname), false);
    }
  },

  storage: diskStorage({
    destination: (
      req: MediaMulterRequest,
      file: Express.Multer.File,
      cb: any
    ) => {
      const uploadPath = process.env.MEDIA_UPLOAD_PATH;

      if (!uploadPath) {
        cb(makeRequiredFieldError('Upload Path'), false);
      }

      const { dispositiveId, userId } = extractRequestFields(req, cb);

      const mediaDirectory = createMediasDirectory(
        uploadPath,
        userId,
        dispositiveId,
        MEDIA_FOLDER_NAME
      );

      if (!existsSync(mediaDirectory)) {
        mkdirSync(mediaDirectory, { recursive: true });
      }

      cb(null, mediaDirectory);
    },

    filename: (req: Request, file: Express.Multer.File, cb: any) => {
      const filename = getFilename(file, cb);
      cb(null, `${filename}`);
    },
  }),
};
