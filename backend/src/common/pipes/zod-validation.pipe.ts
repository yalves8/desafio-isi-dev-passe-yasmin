import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { ZodType, type core } from 'zod';

type ZodIssue = core.$ZodIssue;

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
      const message =
        (firstIssue && wrongTypeMessage(firstIssue, value)) ||
        firstIssue?.message ||
        'Dado ou parâmetro inválido';
      throw new BadRequestException(message);
    }

    return result.data;
  }
}

const TYPE_LABEL: Record<string, string> = {
  number: 'um número',
  string: 'um texto',
  boolean: 'verdadeiro ou falso',
  object: 'um objeto',
  array: 'uma lista',
};

/**
 * Vários schemas usam "<campo> é obrigatório" para todo erro de tipo. Quando o campo veio,
 * mas com o tipo errado ("30" no lugar de 30), a mensagem diz o tipo esperado. Mensagens de
 * tipo mais específicas do schema (ex.: "club_id é obrigatório e deve ser um inteiro") ficam.
 */
function wrongTypeMessage(issue: ZodIssue, value: unknown): string | undefined {
  const field = issue.path.join('.');
  if (
    issue.code !== 'invalid_type' ||
    issue.message !== `${field} é obrigatório`
  )
    return;
  const received = issue.path.reduce<unknown>(
    (current, key) =>
      typeof current === 'object' && current !== null
        ? (current as Record<PropertyKey, unknown>)[key]
        : undefined,
    value,
  );
  if (received === undefined || received === null) return;
  const label = TYPE_LABEL[issue.expected];
  return label && `${field} deve ser ${label}`;
}
