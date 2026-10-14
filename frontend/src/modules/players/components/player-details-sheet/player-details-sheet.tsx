import { ChartColumn, Coins, HeartPulse, Pencil, Tag as TagIcon, TrendingUp } from 'lucide-react'
import { InfoList } from '@/components/data-display/info-list/info-list'
import { StatCard } from '@/components/data-display/stat-card/stat-card'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { formatMoney } from '@/lib/format'
import { ATTRIBUTE_FIELDS, POSITION_LABEL } from '../../players.constants'
import { AttributeBar } from '../attribute-bar/attribute-bar'
import { BuyButton } from '../buy-button/buy-button'
import { ClubTag } from '../club-tag/club-tag'
import { ConditionBadge } from '../condition-badge/condition-badge'
import { PlayerAvatar } from '../player-avatar/player-avatar'
import { PositionBadge } from '../position-badge/position-badge'
import type { PlayerDetailsSheetProps } from './player-details-sheet.types'

export function PlayerDetailsSheet({
  player,
  club,
  onClose,
  onEdit,
  onCondition,
  onBuy,
  buyDisabledReason,
}: PlayerDetailsSheetProps) {
  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="gap-0 overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-[480px]">
        <div className="flex items-start gap-3 p-6 pb-4">
          <PlayerAvatar id={player.id} name={player.name} className="size-10 text-sm" />
          <div className="flex flex-col gap-1.5">
            <SheetTitle className="text-lg font-semibold">{player.name}</SheetTitle>
            <SheetDescription className="sr-only">
              {POSITION_LABEL[player.position]}, detalhes e indicadores técnicos
            </SheetDescription>
            <div className="flex flex-wrap items-center gap-1.5">
              <PositionBadge position={player.position} />
              <ConditionBadge condition={player.condition} />
              <ClubTag club={club} variant="acronym" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 px-6 pb-6">
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Valor de mercado"
              value={formatMoney(player.market_value)}
              hint="Calculado automaticamente"
              icon={Coins}
            />
            <StatCard
              label="Valor base"
              value={formatMoney(player.base_value)}
              hint="Calculado no cadastro"
              icon={TagIcon}
            />
            <StatCard
              label="Overall"
              value={String(player.overall)}
              hint="Calculado pela posição"
              icon={ChartColumn}
            />
            <StatCard
              label="Potencial"
              value={String(player.potential)}
              hint="Informado no cadastro"
              icon={TrendingUp}
            />
          </div>

          <section aria-labelledby="details-attributes" className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <h3 id="details-attributes" className="text-base font-semibold">
                Indicadores técnicos
              </h3>
              <span className="text-xs text-muted-foreground">Escala de 1 a 99</span>
            </div>
            <ul className="flex flex-col gap-3">
              {ATTRIBUTE_FIELDS.map(({ key, label }) => (
                <AttributeBar
                  key={key}
                  label={label}
                  value={player[key]}
                  potential={player.potential}
                />
              ))}
            </ul>
            <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-sm bg-primary" aria-hidden /> Valor do atributo
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-sm bg-blue-200" aria-hidden />
                Até o potencial ({player.potential}), que nenhum atributo passa
              </span>
            </p>
          </section>

          <InfoList
            items={[
              { label: 'Idade', value: `${player.age} anos` },
              { label: 'Agilidade', value: player.agility },
              { label: 'Clube', value: club ? `${club.acronym} · ${club.name}` : 'Livre' },
            ]}
          />
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-2 border-t p-6">
          <Button variant="outline" size="md" onClick={onEdit}>
            <Pencil /> Editar
          </Button>
          <Button variant="outline" size="md" onClick={onCondition}>
            <HeartPulse /> Alterar condição
          </Button>
          {player.club_id === null && (
            <BuyButton className="ml-auto" onClick={onBuy} disabledReason={buyDisabledReason} />
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
