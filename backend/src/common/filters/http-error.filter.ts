import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';
import { Prisma } from '../../generated/prisma/client.js';
import {
  ConflictError,
  DomainError,
  NotFoundError,
  ValidationError,
} from '../errors/domain.errors.js';

const STATUS = new Map<Function, number>([
  [ValidationError, HttpStatus.BAD_REQUEST],
  [NotFoundError, HttpStatus.NOT_FOUND],
  [ConflictError, HttpStatus.CONFLICT],
]);

export interface ErrorResponse {
  message: string;
}

/** Erro lançado pelo body-parser do Express (JSON malformado, corpo grande demais...). */
function isBodyParserError(
  exception: unknown,
): exception is { status: number; message: string } {
  return (
    typeof exception === 'object' &&
    exception !== null &&
    'type' in exception &&
    typeof (exception as { type: unknown }).type === 'string' &&
    (exception as { type: string }).type.startsWith('entity.')
  );
}

/** Único lugar que conhece HTTP: formato de erro padronizado e sem stack trace na resposta. */
@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpErrorFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const send = (statusCode: number, message: string | string[]) =>
      res.status(statusCode).json({
        message: Array.isArray(message) ? message.join('; ') : message,
      } satisfies ErrorResponse);

    if (exception instanceof DomainError) {
      return send(
        STATUS.get(exception.constructor) ?? HttpStatus.BAD_REQUEST,
        exception.message,
      );
    }
    if (isBodyParserError(exception)) {
      return send(HttpStatus.BAD_REQUEST, 'Corpo da requisição inválido');
    }
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002')
        return send(HttpStatus.CONFLICT, 'Registro já cadastrado');
      if (exception.code === 'P2025')
        return send(HttpStatus.NOT_FOUND, 'Registro não encontrado');
    }
    if (exception instanceof NotFoundException) {
      return send(HttpStatus.NOT_FOUND, 'Recurso não encontrado');
    }
    if (exception instanceof HttpException) {
      const body = exception.getResponse() as
        { message?: string | string[] } | string;
      const message =
        typeof body === 'string' ? body : (body.message ?? exception.message);
      return send(exception.getStatus(), message);
    }

    this.logger.error(exception); // stack só no log
    return send(HttpStatus.INTERNAL_SERVER_ERROR, 'Erro interno do servidor');
  }
}
