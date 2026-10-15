import { Injectable, PipeTransform } from '@nestjs/common';

/** Valida e converte os query params com o parser da rota antes do controller; recusa com 400 */
@Injectable()
export class ParseQueryPipe<Query, Parsed> implements PipeTransform<
  Query,
  Parsed
> {
  constructor(private readonly parse: (query: Query) => Parsed) {}

  transform(query: Query): Parsed {
    return this.parse(query);
  }
}
