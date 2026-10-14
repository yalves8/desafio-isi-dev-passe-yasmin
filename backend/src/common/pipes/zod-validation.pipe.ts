import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { ZodType } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType<unknown>) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    if (metadata.type === 'body') {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw new BadRequestException(
          'O corpo da requisição deve ser um objeto JSON',
        );
      }
    }

    const result = this.schema.safeParse(value);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      const message = firstIssue?.message || 'Dado ou parâmetro inválido';
      throw new BadRequestException(message);
    }

    return result.data;
  }
}
