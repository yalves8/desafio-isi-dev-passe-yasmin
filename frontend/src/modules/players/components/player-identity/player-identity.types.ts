export interface PlayerIdentityProps {
  id: number
  name: string
  /** Linha menor embaixo do nome (ex.: posição, "ATA · Águias FC") */
  detail?: string
  className?: string
}
