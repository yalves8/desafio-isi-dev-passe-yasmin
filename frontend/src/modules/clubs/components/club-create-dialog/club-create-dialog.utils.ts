/**
 * Campo citado no 409 do POST /clubs, para marcá-lo no formulário:
 * 'Já existe um clube com o nome “Águias FC”.' → name; '...com a sigla “AGU”.' → acronym;
 * o limite de 20 clubes não é de nenhum campo. Só o início da frase conta: o nome do clube
 * citado pode ter qualquer palavra.
 */
export function conflictField(message: string | undefined): 'name' | 'acronym' | undefined {
  if (!message) return undefined
  if (/^Já existe um clube com a sigla/.test(message)) return 'acronym'
  if (/^Já existe um clube com o nome/.test(message)) return 'name'
  return undefined
}
