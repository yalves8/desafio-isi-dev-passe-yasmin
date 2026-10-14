import { Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router'
import type { User } from '@/api/types'
import { ConfirmDialog } from '@/components/feedback/confirm-dialog'
import { EmptyState, ErrorState, ListSkeleton } from '@/components/feedback/states'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate } from '@/lib/format'
import { useUsersPage } from './users-page.hook'

const ROLE_LABEL = { ADMIN: 'Administrador', USER: 'Usuário' } as const

export function UsersPage() {
  const { items, loading, error, reload, deactivate, currentUserId } = useUsersPage()

  const deactivateButton = (user: User) =>
    user.id !== currentUserId && (
      <ConfirmDialog
        trigger={
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Inativar ${user.name}`}
            className="text-destructive"
          >
            <Trash2 />
          </Button>
        }
        title={`Inativar ${user.name}?`}
        description="A pessoa perde o acesso ao sistema. O e-mail fica livre para um novo cadastro."
        confirmLabel="Inativar usuário"
        onConfirm={() => deactivate(user)}
      />
    )

  return (
    <>
      <PageHeader
        title="Usuários"
        description="Pessoas com acesso ao sistema."
        actions={
          <Button asChild>
            <Link to="/usuarios/novo">
              <Plus /> Novo usuário
            </Link>
          </Button>
        }
      />

      {loading ? (
        <ListSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : items.length === 0 ? (
        <EmptyState title="Nenhum usuário ativo" />
      ) : (
        <>
          <div className="hidden rounded-lg border bg-card md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Desde</TableHead>
                  <TableHead className="w-20 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.name}
                      {user.id === currentUserId && (
                        <span className="ml-2 text-xs text-muted-foreground">(você)</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <RoleBadge role={user.role} />
                    </TableCell>
                    <TableCell className="font-mono text-xs tabular-nums">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">{deactivateButton(user)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <ul className="space-y-2 md:hidden">
            {items.map((user) => (
              <li key={user.id} className="flex items-center gap-3 rounded-lg border bg-card p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {user.name}
                    {user.id === currentUserId && (
                      <span className="ml-2 text-xs text-muted-foreground">(você)</span>
                    )}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                  <RoleBadge role={user.role} className="mt-2" />
                </div>
                {deactivateButton(user)}
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}

function RoleBadge({ role, className }: { role: User['role']; className?: string }) {
  return (
    <Badge variant={role === 'ADMIN' ? 'default' : 'secondary'} className={className}>
      {ROLE_LABEL[role]}
    </Badge>
  )
}
