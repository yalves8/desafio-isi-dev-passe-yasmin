import { useState } from 'react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/api/client'
import type { User } from '@/api/types'
import { usersService } from '@/api/users.service'
import { useAuth } from '@/hooks/use-auth'
import { useFetch } from '@/hooks/use-fetch'

export function useUsersPage() {
  const { user: currentUser } = useAuth()
  const [reloadKey, setReloadKey] = useState(0)
  const { data, loading, error } = useFetch(String(reloadKey), () => usersService.list())
  const items: User[] = data ?? []

  const reload = () => setReloadKey((k) => k + 1)

  const deactivate = async (user: User) => {
    try {
      await usersService.deactivate(user.id)
      toast.success(`Usuário "${user.name}" inativado`)
      reload()
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }

  return { items, loading, error, reload, deactivate, currentUserId: currentUser?.id }
}
