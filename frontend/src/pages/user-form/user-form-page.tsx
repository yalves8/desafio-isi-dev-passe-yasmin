import { ArrowLeft } from 'lucide-react'
import { Controller } from 'react-hook-form'
import { Link } from 'react-router'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUserFormPage } from './user-form-page.hook'

export function UserFormPage() {
  const { form, onSubmit, submitting } = useUserFormPage()
  const { errors } = form.formState

  return (
    <>
      <Button variant="ghost" size="sm" asChild className="mb-3 -ml-2">
        <Link to="/usuarios">
          <ArrowLeft /> Usuários
        </Link>
      </Button>
      <PageHeader title="Novo usuário" />

      <form onSubmit={onSubmit} noValidate className="max-w-lg">
        <FieldGroup>
          <Field data-invalid={!!errors.name}>
            <FieldLabel htmlFor="name">Nome</FieldLabel>
            <Input id="name" aria-invalid={!!errors.name} {...form.register('name')} />
            <FieldError errors={[errors.name]} />
          </Field>
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email">E-mail</FieldLabel>
            <Input
              id="email"
              type="email"
              aria-invalid={!!errors.email}
              {...form.register('email')}
            />
            <FieldError errors={[errors.email]} />
          </Field>
          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="password">Senha inicial</FieldLabel>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              {...form.register('password')}
            />
            <FieldDescription>
              Mínimo de 6 caracteres. Repasse para a pessoa por um canal seguro.
            </FieldDescription>
            <FieldError errors={[errors.password]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="role">Perfil</FieldLabel>
            <Controller
              control={form.control}
              name="role"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="role" className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">Usuário</SelectItem>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <FieldDescription>Administradores gerenciam salas e usuários.</FieldDescription>
          </Field>
          <div className="flex gap-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Cadastrando…' : 'Cadastrar usuário'}
            </Button>
            <Button variant="outline" asChild>
              <Link to="/usuarios">Cancelar</Link>
            </Button>
          </div>
        </FieldGroup>
      </form>
    </>
  )
}
