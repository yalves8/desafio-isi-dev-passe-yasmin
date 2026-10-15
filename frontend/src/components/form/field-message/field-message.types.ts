export interface FieldMessageProps {
  /** id do controle; a mensagem recebe `${id}-message` para o aria-describedby */
  id: string
  hint?: string
  error?: string
}
