import type { Club } from '@/api/types'

export interface ClubTagProps {
  /** Sem clube, mostra "Livre" */
  club?: Club
  /** `link`: sigla + nome com link para o clube; `acronym`: só a sigla */
  variant?: 'link' | 'acronym'
}
