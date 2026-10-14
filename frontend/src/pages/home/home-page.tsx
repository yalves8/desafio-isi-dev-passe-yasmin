import { Fragment } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  HandCoins,
  History,
  Shield,
  ShoppingCart,
  Swords,
  Trophy,
  UserRound,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useHomePage } from './home-page.hook'

const STEPS = [
  {
    number: '01',
    title: 'Jogadores',
    description: 'Nascem livres e Apto; o valor de mercado vem da condição, agilidade e idade.',
    icon: Users,
  },
  {
    number: '02',
    title: 'Clubes',
    description: 'Começam com 300,00 em caixa e sem jogadores.',
    icon: Shield,
  },
  {
    number: '03',
    title: 'Compra',
    description: 'Valor + taxa, até 50% do caixa, com contrato de fidelidade.',
    icon: ShoppingCart,
  },
  {
    number: '04',
    title: 'Venda',
    description: 'Multa antes do fim da fidelidade e comissão sobre o lucro.',
    icon: HandCoins,
  },
  {
    number: '05',
    title: 'Histórico',
    description: 'Toda compra e venda fica registrada, com totais e CSV.',
    icon: History,
  },
  {
    number: '06',
    title: 'Liga',
    description: 'Escale 5 titulares e jogue partidas que entram na classificação.',
    icon: Trophy,
  },
]

const STAT_DIVIDER = <span aria-hidden="true" className="size-[3px] rounded-full bg-zinc-300" />

export function HomePage() {
  const { stats, startNavigation } = useHomePage()

  const statItems = [
    { icon: Users, value: stats.totalPlayers, label: 'jogadores' },
    { icon: UserRound, value: stats.freePlayers, label: 'livres' },
    { icon: Shield, value: stats.totalClubs, label: 'clubes' },
    { icon: Swords, value: stats.totalMatches, label: 'partidas' },
  ]

  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-white px-4 py-8 xl:p-0">
      {/* Moldura do campo (Figma: campo 1200x700 + traves = 1234x702, tamanho nativo do SVG) */}
      <div className="relative flex w-full max-w-[1234px] flex-col items-center min-[1800px]:[zoom:1.2] xl:h-[702px] xl:w-[1234px] xl:shrink-0">
        <img
          src="/assets/campo-decoracao.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden size-full select-none xl:block"
        />

        {/* Conteúdo central (Figma: padding 32px 48px, gap 22px, radius 24px) — cobre a linha do meio-campo */}
        <div className="relative z-10 flex flex-col items-center gap-[22px] rounded-[24px] bg-white px-4 py-8 text-center sm:px-12 xl:mt-8 xl:w-[720px]">
          {/* Marca (Figma: gap 20px, logo 56x56 r16, Passe 32px tracking -0.03em) */}
          <div className="flex items-center gap-5">
            <img src="/assets/logo-passe.svg" alt="" className="size-14 rounded-2xl" />
            <span className="font-heading text-[32px] leading-10 font-semibold tracking-[-0.03em] text-[#09090B]">
              Passe
            </span>
          </div>

          {/* Selo da liga (Figma: padding 5px 12px 5px 10px, gap 8px, pill) */}
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white py-[5px] pr-3 pl-[10px] text-xs leading-4 shadow-2xs">
            <span className="size-2 rounded-full bg-[#00813A]" />
            <span className="font-medium text-[#09090B]">Liga Fictícia 2026</span>
            <span className="text-zinc-400">·</span>
            <span className="text-[#686872]">
              {stats.leader
                ? `líder: ${stats.leader.name}, ${stats.leader.points} pontos`
                : 'nenhuma partida ainda'}
            </span>
          </div>

          {/* Título e descrição (Figma: gap 12px, h1 40/48 tracking -0.025em, p 16/24) */}
          <div className="flex flex-col items-center gap-3">
            <h1 className="font-heading text-[28px] leading-9 font-semibold tracking-[-0.025em] text-[#09090B] sm:text-4xl sm:leading-[44px] xl:text-[40px] xl:leading-[48px] xl:whitespace-nowrap">
              Gestão da liga, do mercado à classificação
            </h1>
            <p className="max-w-[624px] text-base leading-6 text-[#686872]">
              Cadastre jogadores, monte os clubes e negocie com contrato de fidelidade. Depois,
              escale os titulares e jogue partidas com placar calculado pelos atributos.
            </p>
          </div>

          {/* Ação principal (Figma: gap 14px, botão 200x40 r8) */}
          <div className="flex flex-col items-center gap-3.5 sm:flex-row">
            <Button
              type="button"
              onClick={startNavigation}
              className="h-10 w-[200px] gap-2 rounded-lg bg-[#155DFC] text-sm font-medium text-white shadow-xs hover:bg-[#155DFC]/90"
            >
              Iniciar
              <ArrowRight className="size-4" />
            </Button>
            <span className="flex items-center gap-1.5 text-sm text-[#686872]">
              ou tecle
              <kbd className="inline-flex h-5 items-center rounded border border-zinc-200 bg-[#F4F4F5] px-1.5 font-sans text-xs text-[#686872]">
                Enter
              </kbd>
            </span>
          </div>

          {/* Números da liga (Figma: gap 16px, separador 3x3) */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs leading-4 text-[#686872]">
            {statItems.map(({ icon: Icon, value, label }) => (
              <Fragment key={label}>
                <span className="flex items-center gap-1.5">
                  <Icon className="size-3.5 text-[#686872]" />
                  <span className="font-medium text-[#09090B]">{value}</span>
                  {label}
                </span>
                {STAT_DIVIDER}
              </Fragment>
            ))}
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-[#686872]" />
              Não precisa de login
            </span>
          </div>
        </div>

        {/* Como funciona (Figma: 6 cards 172x157, 32px entre eles, 4px das linhas laterais) */}
        <ol className="relative z-10 mt-6 grid w-full grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:mt-8 xl:flex xl:w-[1192px] xl:items-center xl:gap-0">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            return (
              <Fragment key={step.number}>
                <li className="flex flex-col rounded-xl border border-zinc-200 bg-white p-3.5 text-left xl:h-[157px] xl:w-[172px] xl:shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-[10px] bg-[#EFF6FF] text-[#155DFC]">
                      <Icon className="size-4" />
                    </span>
                    <span className="font-mono text-xs text-[#686872]">{step.number}</span>
                  </div>
                  <h3 className="mt-2.5 text-sm leading-5 font-medium text-[#09090B]">
                    {step.title}
                  </h3>
                  <p className="mt-0.5 text-xs leading-4 text-[#686872]">{step.description}</p>
                </li>
                {index < STEPS.length - 1 && (
                  <li aria-hidden="true" className="hidden w-8 shrink-0 justify-center xl:flex">
                    <ChevronRight className="size-4 text-zinc-500" />
                  </li>
                )}
              </Fragment>
            )
          })}
        </ol>

        {/* Rodapé */}
        <p className="relative z-10 mt-6 flex items-center gap-1.5 text-xs leading-4 text-[#686872] xl:mt-8">
          <Clock className="size-3.5" />
          Liga Fictícia 2026 · Horário de Brasília (UTC−3)
        </p>
      </div>
    </div>
  )
}
