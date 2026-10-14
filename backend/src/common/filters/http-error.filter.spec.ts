import {
  ArgumentsHost,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../errors/domain.errors.js';
import { HttpErrorFilter } from './http-error.filter.js';

function makeHost() {
  const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
  const host = {
    switchToHttp: () => ({ getResponse: () => res }),
  } as unknown as ArgumentsHost;
  return { host, res };
}

describe('HttpErrorFilter', () => {
  const filter = new HttpErrorFilter();

  it.each([
    [new ValidationError('inválido'), 400],
    [new NotFoundError('não achei'), 404],
    [new ConflictError('conflito'), 409],
  ])('deve traduzir %s para %i com formato { message }', (error, status) => {
    const { host, res } = makeHost();
    filter.catch(error, host);
    expect(res.status).toHaveBeenCalledWith(status);
    expect(res.json).toHaveBeenCalledWith({
      message: error.message,
    });
  });

  it('deve retornar 409 quando o Prisma violar unique (P2002)', () => {
    const { host, res } = makeHost();
    const error = new Prisma.PrismaClientKnownRequestError('unique', {
      code: 'P2002',
      clientVersion: 'x',
    });
    filter.catch(error, host);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Registro já cadastrado',
    });
  });

  it('deve formatar mensagens do BadRequestException como string única', () => {
    const { host, res } = makeHost();
    filter.catch(new BadRequestException(['a inválido', 'b inválido']), host);
    expect(res.json).toHaveBeenCalledWith({
      message: 'a inválido; b inválido',
    });
  });

  it('deve traduzir rota inexistente para 404', () => {
    const { host, res } = makeHost();
    filter.catch(new NotFoundException('Cannot GET /x'), host);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Recurso não encontrado',
    });
  });

  it('deve esconder detalhes de erros inesperados', () => {
    const { host, res } = makeHost();
    vi.spyOn(filter['logger'], 'error').mockImplementation(() => undefined);
    filter.catch(new Error('senha do banco vazou no stack'), host);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Erro interno do servidor',
    });
  });
});
