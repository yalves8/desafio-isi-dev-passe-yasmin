import { Injectable, PipeTransform } from '@nestjs/common';
import { NotFoundError } from '../errors/domain.errors.js';
import { MAX_ID, POSITIVE_INT_REGEX } from '../utils/id.js';

/** Id de URL: inteiro positivo só com dígitos, sem zeros à esquerda e até 2.147.483.647; senão conta como inexistente (V8). */
@Injectable()
export class ParseIdPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const id = Number(value);
    if (!POSITIVE_INT_REGEX.test(value) || id > MAX_ID) {
      throw new NotFoundError('Recurso não encontrado');
    }
    return id;
  }
}
