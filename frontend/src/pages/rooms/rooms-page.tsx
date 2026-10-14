import { Pencil, Plus, Search, Trash2, Users } from 'lucide-react'
import { Link } from 'react-router'
import type { Room } from '@/api/types'
import { ConfirmDialog } from '@/components/feedback/confirm-dialog'
import { EmptyState, ErrorState, ListSkeleton } from '@/components/feedback/states'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { plural } from '@/lib/format'
import { SORT_OPTIONS, useRoomsPage } from './rooms-page.hook'

export function RoomsPage() {
  const {
    items,
    loading,
    error,
    isAdmin,
    filters,
    nameInput,
    setNameInput,
    setFilter,
    sort,
    setSort,
    hasFilters,
    clearFilters,
    reload,
    deactivate,
  } = useRoomsPage()

  return (
    <>
      <PageHeader
        title="Salas"
        description="Espaços disponíveis para reserva."
        actions={
          isAdmin && (
            <Button asChild>
              <Link to="/salas/nova">
                <Plus /> Nova sala
              </Link>
            </Button>
          )
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_10rem_13rem]">
        <div className="relative">
          <Label htmlFor="filter-name" className="sr-only">
            Buscar por nome
          </Label>
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="filter-name"
            placeholder="Buscar por nome"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="pl-8"
          />
        </div>
        <div>
          <Label htmlFor="filter-capacity" className="sr-only">
            Capacidade mínima
          </Label>
          <Input
            id="filter-capacity"
            type="number"
            min={1}
            inputMode="numeric"
            placeholder="Capacidade mín."
            value={filters.minCapacity ?? ''}
            onChange={(e) => setFilter('minCapacity', e.target.value)}
          />
        </div>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger aria-label="Ordenar por" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <ListSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : items.length === 0 ? (
        hasFilters ? (
          <EmptyState
            title="Nenhuma sala encontrada"
            description="Nenhuma sala corresponde aos filtros aplicados."
            action={
              <Button variant="outline" onClick={clearFilters}>
                Limpar filtros
              </Button>
            }
          />
        ) : (
          <EmptyState
            title="Nenhuma sala cadastrada"
            description={
              isAdmin
                ? 'Cadastre a primeira sala para liberar as reservas.'
                : 'Ainda não há salas disponíveis.'
            }
            action={
              isAdmin && (
                <Button asChild>
                  <Link to="/salas/nova">
                    <Plus /> Nova sala
                  </Link>
                </Button>
              )
            }
          />
        )
      ) : (
        <>
          <p className="mb-2 text-xs text-muted-foreground" aria-live="polite">
            {plural(items.length, 'sala encontrada', 'salas encontradas')}
          </p>

          {/* Desktop: tabela */}
          <div className="hidden rounded-lg border bg-card md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead className="text-right">Capacidade</TableHead>
                  {isAdmin && <TableHead className="w-32 text-right">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      #{room.id}
                    </TableCell>
                    <TableCell className="font-medium">{room.name}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {room.capacity}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <RoomActions room={room} onDeactivate={deactivate} />
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Celular: cards */}
          <ul className="space-y-2 md:hidden">
            {items.map((room) => (
              <li key={room.id} className="flex items-center gap-3 rounded-lg border bg-card p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{room.name}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="size-3.5" aria-hidden />
                    <span className="font-mono tabular-nums">{room.capacity}</span> lugares
                  </p>
                </div>
                {isAdmin && <RoomActions room={room} onDeactivate={deactivate} />}
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}

function RoomActions({
  room,
  onDeactivate,
}: {
  room: Room
  onDeactivate: (room: Room) => Promise<void>
}) {
  return (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon" asChild>
        <Link to={`/salas/${room.id}/editar`} aria-label={`Editar ${room.name}`}>
          <Pencil />
        </Link>
      </Button>
      <ConfirmDialog
        trigger={
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Inativar ${room.name}`}
            className="text-destructive"
          >
            <Trash2 />
          </Button>
        }
        title={`Inativar "${room.name}"?`}
        description="A sala deixa de aparecer nas listagens e não recebe novas reservas. O histórico é mantido."
        confirmLabel="Inativar sala"
        onConfirm={() => onDeactivate(room)}
      />
    </div>
  )
}
