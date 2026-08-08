import { BadRequestException } from '@nestjs/common'
import { createZodValidationPipe, ZodValidationPipe as NestZodValidationPipe } from 'nestjs-zod'
import { z } from 'zod'

export const ZodValidationPipe: typeof NestZodValidationPipe = createZodValidationPipe({
  strictSchemaDeclaration: true,
  createValidationException: error => new BadRequestException({
    message: 'Dados de entrada inválidos',
    errors: error instanceof z.ZodError ? error.flatten : error,
  }),
})
