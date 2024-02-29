import type { NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

import { Injectable, Logger } from '@nestjs/common';

export type MediaManagerLoggerRequestInfo = {
  baseUrl: string;
  contentAgent: string;
  contentLength: string;
  ip: string;
  method: string;
};

@Injectable()
export class MediaManagerLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('MediaManagerHTTP');

  private extractMediaManagerLoggerInfo(
    req: Request
  ): MediaManagerLoggerRequestInfo {
    const { baseUrl = '', ip = '', method = '' } = req;
    const contentLength = req.get('content-length') ?? '';
    const contentAgent = req.get('content-agent') ?? '';

    return {
      baseUrl,
      contentAgent,
      contentLength,
      ip,
      method,
    };
  }

  use(req: Request, res: Response, next: NextFunction) {
    const { baseUrl, contentAgent, contentLength, ip, method } =
      this.extractMediaManagerLoggerInfo(req);

    res.on('close', () => {
      const { statusCode } = res;

      this.logger.log(
        `[${method}] ${baseUrl} - ${statusCode} - ${ip} - ${contentLength} - ${contentAgent}`
      );
    });

    next();
  }
}
