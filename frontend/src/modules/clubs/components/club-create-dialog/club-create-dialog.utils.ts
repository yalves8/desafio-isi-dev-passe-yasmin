/**
 * Campo citado no 409 do POST /clubs, para marcá-lo no formulário:
 * "Clube com este nome já cadastrado" → name; "...esta sigla..." → acronym;
 * o limite de 20 clubes não é de nenhum campo.
 */
export function conflictField(message: string | undefined): 'name' | 'acronym' | undefined {
  if (!message) return undefined
  if (/sigla/i.test(message)) return 'acronym'
  if (/nome/i.test(message)) return 'name'
  return undefined
}
