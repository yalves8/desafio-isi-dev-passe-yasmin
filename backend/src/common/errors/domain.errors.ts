// Erros de domínio sem dependência do Nest: o service lança, o HttpErrorFilter traduz para HTTP.
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends DomainError {} // 400
export class NotFoundError extends DomainError {} // 404
export class ConflictError extends DomainError {} // 409
