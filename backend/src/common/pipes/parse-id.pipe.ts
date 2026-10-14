import { Injectable, PipeTransform } from '@nestjs/common';
import { NotFoundError } from '../errors/domain.errors.js';

const MAX_ID = 2_147_483_647;
const ID_REGEX = /^[1-9]\d*$/;

/** Id de URL: inteiro positivo só com dígitos, sem zeros à esquerda e até 2.147.483.647; senão conta como inexistente (V8). */
@Injectable()
export class ParseIdPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const id = Number(value);
    if (!ID_REGEX.test(value) || id > MAX_ID) {
      throw new NotFoundError('Recurso não encontrado');
    }
    return id;
  }
}
