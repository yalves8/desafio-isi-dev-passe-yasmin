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

export function HomePage() {
  const { stats, startNavigation } = useHomePage()

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white p-2 sm:p-4 md:p-6 lg:p-8">
      {/* Moldura do Campo (Ocupa ~83% da viewport, proporcional ao Figma 1200/1440 e 700/900 em 1440p e 1080p) */}
      <div className="relative flex w-full max-w-[1240px] flex-col items-center justify-between rounded-3xl bg-white px-2 py-6 sm:px-4 lg:h-[720px] lg:px-6 lg:py-8 2xl:h-[840px] 2xl:max-w-[1580px] 2xl:px-12">
        {/* SVG do Campo de Futebol */}
        <img
          src="/assets/campo-decoracao.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden size-full object-fill select-none lg:block"
        />

        {/* Bloco Superior: Conteúdo Central (Figma: width 720px+, bg white para não sobrepor linha central) */}
        <div className="relative z-10 flex w-full max-w-[720px] flex-col items-center rounded-3xl bg-white px-6 py-4 text-center sm:px-10 sm:py-6 2xl:max-w-[820px] 2xl:py-7">
          {/* Logo e Nome */}
          <div className="flex items-center gap-4">
            <img
              src="/assets/logo-passe.svg"
              alt="Passe"
              className="size-14 rounded-2xl shadow-xs 2xl:size-16"
            />
            <span className="font-heading text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl 2xl:text-5xl">
              Passe
            </span>
          </div>

          {/* Selo Liga Fictícia */}
          <div className="mt-3.5 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 py-1 text-xs text-zinc-600 shadow-2xs 2xl:text-sm">
            <span className="size-2 rounded-full bg-[#00813A]" />
            <span className="font-medium text-zinc-900">Liga Fictícia 2026</span>
            <span className="text-zinc-400">·</span>
            <span className="text-[#686872]">
              {stats.leader
                ? `líder: ${stats.leader.name}, ${stats.leader.points} pontos`
                : 'nenhuma partida ainda'}
            </span>
          </div>

          {/* Headline e Descrição */}
          <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl sm:leading-tight 2xl:text-5xl 2xl:leading-tight">
            Gestão da liga, do mercado à classificação
          </h1>
          <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-[#686872] sm:text-base 2xl:max-w-2xl 2xl:text-lg">
            Cadastre jogadores, monte os clubes e negocie com contrato de fidelidade. Depois, escale
            os titulares e jogue partidas com placar calculado pelos atributos.
          </p>

          {/* Ação Principal: Botão Iniciar + Tecla Enter */}
          <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:gap-3.5 2xl:mt-6">
            <Button
              type="button"
              size="lg"
              onClick={startNavigation}
              className="h-10 w-48 gap-2 rounded-lg bg-[#155DFC] font-medium text-white shadow-xs hover:bg-blue-700 sm:w-[200px] 2xl:h-12 2xl:w-[220px] 2xl:text-base"
            >
              Iniciar
              <ArrowRight className="size-4 2xl:size-5" />
            </Button>
            <span className="flex items-center gap-1.5 text-sm text-[#686872] 2xl:text-base">
              ou tecle
              <kbd className="rounded border border-zinc-200 bg-[#F4F4F5] px-1.5 py-0.5 font-mono text-xs font-medium text-[#686872] 2xl:text-sm">
                Enter
              </kbd>
            </span>
          </div>

          {/* Faixa de Números da Liga */}
          <div className="mt-5 flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-[#686872] 2xl:mt-6 2xl:gap-x-6 2xl:text-sm">
            <div className="flex items-center gap-1.5">
              <Users className="size-3.5 text-zinc-400 2xl:size-4" />
              <span className="font-medium text-zinc-900">{stats.totalPlayers}</span>
              <span>jogadores</span>
            </div>
            <span className="size-1 rounded-full bg-zinc-300" />
            <div className="flex items-center gap-1.5">
              <UserRound className="size-3.5 text-zinc-400 2xl:size-4" />
              <span className="font-medium text-zinc-900">{stats.freePlayers}</span>
              <span>livres</span>
            </div>
            <span className="size-1 rounded-full bg-zinc-300" />
            <div className="flex items-center gap-1.5">
              <Shield className="size-3.5 text-zinc-400 2xl:size-4" />
              <span className="font-medium text-zinc-900">{stats.totalClubs}</span>
              <span>clubes</span>
            </div>
            <span className="size-1 rounded-full bg-zinc-300" />
            <div className="flex items-center gap-1.5">
              <Swords className="size-3.5 text-zinc-400 2xl:size-4" />
              <span className="font-medium text-zinc-900">{stats.totalMatches}</span>
              <span>partidas</span>
            </div>
            <span className="size-1 rounded-full bg-zinc-300" />
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-zinc-400 2xl:size-4" />
              <span>Não precisa de login</span>
            </div>
          </div>
        </div>

        {/* Bloco Inferior: Como o sistema funciona (6 etapas perfeitamente contidas no campo) */}
        <div className="relative z-10 w-full max-w-[1192px] 2xl:max-w-[1510px]">
          <div className="flex flex-col items-center justify-center gap-2 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:flex lg:flex-row lg:items-center lg:justify-between lg:gap-1.5 2xl:gap-2.5">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              return (
                <Fragment key={step.number}>
                  <div className="flex h-[158px] w-full max-w-[280px] flex-col justify-between rounded-[14px] border border-zinc-200/90 bg-white p-3.5 text-left shadow-2xs transition-shadow hover:shadow-xs lg:w-[172px] lg:shrink 2xl:h-[168px] 2xl:w-[220px]">
                    <div className="flex items-center justify-between">
                      <div className="flex size-8 items-center justify-center rounded-[10px] bg-[#EFF6FF] text-[#155DFC] 2xl:size-9">
                        <Icon className="size-4 2xl:size-5" />
                      </div>
                      <span className="font-mono text-xs font-normal text-[#686872] 2xl:text-sm">
                        {step.number}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-zinc-950 2xl:text-base">
                        {step.title}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-[#686872] 2xl:text-[13px]">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {index < STEPS.length - 1 && (
                    <ChevronRight className="hidden size-4 shrink-0 text-zinc-400 lg:block 2xl:size-5" />
                  )}
                </Fragment>
              )
            })}
          </div>

          {/* Rodapé: Horário de Brasília */}
          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[#686872] 2xl:mt-5 2xl:text-sm">
            <Clock className="size-3.5 text-zinc-400 2xl:size-4" />
            <span>Liga Fictícia 2026 · Horário de Brasília (UTC−3)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
