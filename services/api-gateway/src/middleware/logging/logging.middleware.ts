import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {

  private logger = new Logger()

  use(req: Request, res: Response, next: () => void) {

    const { method, originalUrl, ip } = req
    const userAgent = req.get("User-Agent") || ''
    const startTime = Date.now()

    this.logger.log(`Chamada da Requsição: ${method} ${originalUrl} - IP: ${ip} - User Agent: ${userAgent}`)

    res.on("finish", () => {
      const { statusCode } = res
      const contentLength = res.get("Content-Length")
      const duration = Date.now() - startTime

      this.logger.log(`Resposta: ${method} ${originalUrl} - ${statusCode} - ${contentLength || 0}b - ${duration}ms`)

      if (statusCode >= 400) {
        this.logger.error(`Resposta de erro: ${method} ${originalUrl} - ${statusCode} - ${duration}`)
      }

      res.on('error', (error) => {
        this.logger.error(
          `Response Error: ${method} ${originalUrl} - ${error.message}`,
        )
      })

      req.on('timeout', () => {
        this.logger.warn(
          `Request Timeout: ${method} ${originalUrl} - ${Date.now() - startTime}ms`,
        )
      })

    })

    next()
  }
}
