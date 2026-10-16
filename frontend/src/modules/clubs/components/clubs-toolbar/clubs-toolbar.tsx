import { Tag } from '@/components/data-display/tag/tag'
import { SortMenu } from '@/components/form/sort-menu/sort-menu'
import { plural } from '@/lib/format'
import { CLUB_SORT_OPTIONS, MAX_CLUBS } from '../../clubs.constants'
import type { ClubsToolbarProps } from './clubs-toolbar.types'

/** Total de clubes, uso do limite da liga e ordenação */
export function ClubsToolbar({ total, sort, onSortChange }: ClubsToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4">
      <p className="flex items-center gap-2 font-medium">
        {plural(total, 'clube')}
        <Tag variant="muted">
          {total} de {MAX_CLUBS}
        </Tag>
      </p>
      <SortMenu
        options={CLUB_SORT_OPTIONS}
        value={sort}
        onChange={onSortChange}
        contentClassName="min-w-72"
      />
    </div>
  )
}
