import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { getErrorMessage } from '@/api/client'
import { roomsService, type RoomFilters } from '@/api/rooms.service'
import type { Room } from '@/api/types'
import { useAuth } from '@/hooks/use-auth'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useFetch } from '@/hooks/use-fetch'

export const SORT_OPTIONS = [
  { value: 'name:asc', label: 'Nome (A–Z)' },
  { value: 'name:desc', label: 'Nome (Z–A)' },
  { value: 'capacity:desc', label: 'Maior capacidade' },
  { value: 'capacity:asc', label: 'Menor capacidade' },
  { value: 'createdAt:desc', label: 'Mais recentes' },
] as const

/** Filtros e ordenação ficam na URL: recarregar a página mantém a busca. */
export function useRoomsPage() {
  const { isAdmin } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [reloadKey, setReloadKey] = useState(0)
  const [nameInput, setNameInput] = useState(searchParams.get('name') ?? '')
  const debouncedName = useDebouncedValue(nameInput)

  const filters: RoomFilters = Object.fromEntries(searchParams)
  const sort = `${filters.sort ?? 'name'}:${filters.order ?? 'asc'}`
  const hasFilters = Boolean(filters.name || filters.minCapacity)

  const setFilter = useCallback(
    (key: string, value: string) =>
      setSearchParams(
        (prev) => {
          if (value) prev.set(key, value)
          else prev.delete(key)
          return prev
        },
        { replace: true },
      ),
    [setSearchParams],
  )

  useEffect(() => setFilter('name', debouncedName.trim()), [debouncedName, setFilter])

  const { data, loading, error } = useFetch(`${searchParams.toString()}#${reloadKey}`, () =>
    roomsService.list(Object.fromEntries(searchParams)),
  )
  const items: Room[] = data ?? []

  const setSort = (value: string) => {
    const [field, order] = value.split(':')
    setSearchParams(
      (prev) => {
        prev.set('sort', field)
        prev.set('order', order)
        return prev
      },
      { replace: true },
    )
  }

  const clearFilters = () => {
    setNameInput('')
    setSearchParams({}, { replace: true })
  }

  const reload = () => setReloadKey((k) => k + 1)

  const deactivate = async (room: Room) => {
    try {
      await roomsService.deactivate(room.id)
      toast.success(`Sala "${room.name}" inativada`)
      reload()
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }

  return {
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
  }
}
