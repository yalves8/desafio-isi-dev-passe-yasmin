import { describe, expect, it } from 'vitest'
import { conflictField } from './club-create-dialog.utils'

describe('conflictField', () => {
  it('deve apontar o nome quando a API recusa o nome repetido', () => {
    expect(conflictField('Já existe um clube com o nome “Águias FC”.')).toBe('name')
    // O nome citado não confunde o campo
    expect(conflictField('Já existe um clube com o nome “Sigla Esporte Clube”.')).toBe('name')
  })

  it('deve apontar a sigla quando a API recusa a sigla repetida', () => {
    expect(conflictField('Já existe um clube com a sigla “AGU”.')).toBe('acronym')
  })

  it('não deve apontar campo no limite de 20 clubes nem sem mensagem', () => {
    expect(conflictField('A liga aceita no máximo 20 clubes')).toBeUndefined()
    expect(conflictField(undefined)).toBeUndefined()
  })
})
