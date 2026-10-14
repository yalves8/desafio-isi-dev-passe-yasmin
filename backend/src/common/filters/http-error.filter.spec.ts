import {
  ArgumentsHost,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
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
    [new UnauthorizedError('sem login'), 401],
    [new ForbiddenError('proibido'), 403],
    [new NotFoundError('não achei'), 404],
    [new ConflictError('conflito'), 409],
  ])('deve traduzir %s para %i', (error, status) => {
    const { host, res } = makeHost();
    filter.catch(error, host);
    expect(res.status).toHaveBeenCalledWith(status);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: status,
      message: [error.message],
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
      statusCode: 409,
      message: ['Registro já cadastrado'],
    });
  });

  it('deve manter a lista de mensagens do ValidationPipe', () => {
    const { host, res } = makeHost();
    filter.catch(new BadRequestException(['a inválido', 'b inválido']), host);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: 400,
      message: ['a inválido', 'b inválido'],
    });
  });

  it('deve traduzir rota inexistente', () => {
    const { host, res } = makeHost();
    filter.catch(new NotFoundException('Cannot GET /x'), host);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: 404,
      message: ['Rota não encontrada'],
    });
  });

  it('deve esconder detalhes de erros inesperados', () => {
    const { host, res } = makeHost();
    vi.spyOn(filter['logger'], 'error').mockImplementation(() => undefined);
    filter.catch(new Error('senha do banco vazou no stack'), host);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: 500,
      message: ['Erro interno do servidor'],
    });
  });
});
