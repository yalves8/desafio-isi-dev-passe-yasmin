import { BadRequestException } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';

/**
 * Adaptador Express da API. O padrão do Nest devolve a mensagem crua do parser de JSON
 * ("Expected double-quoted property name..."); aqui ela vira uma mensagem para o cliente.
 */
export class AppExpressAdapter extends ExpressAdapter {
  override mapException(error: unknown): unknown {
    if (error instanceof SyntaxError) {
      return new BadRequestException(
        'O corpo da requisição não é um JSON válido',
      );
    }
    return super.mapException(error);
  }
}
