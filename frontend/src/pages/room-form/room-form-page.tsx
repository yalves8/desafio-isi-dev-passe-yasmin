import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'
import { ErrorState, Spinner } from '@/components/feedback/states'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useRoomFormPage } from './room-form-page.hook'

export function RoomFormPage() {
  const { form, onSubmit, isEdit, loading, loadError, submitting } = useRoomFormPage()
  const { errors } = form.formState

  return (
    <>
      <Button variant="ghost" size="sm" asChild className="mb-3 -ml-2">
        <Link to="/salas">
          <ArrowLeft /> Salas
        </Link>
      </Button>
      <PageHeader title={isEdit ? 'Editar sala' : 'Nova sala'} />

      {loading ? (
        <Spinner label="Carregando sala" />
      ) : loadError ? (
        <ErrorState message={loadError} />
      ) : (
        <form onSubmit={onSubmit} noValidate className="max-w-lg">
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Nome</FieldLabel>
              <Input id="name" aria-invalid={!!errors.name} {...form.register('name')} />
              <FieldError errors={[errors.name]} />
            </Field>
            <Field data-invalid={!!errors.capacity}>
              <FieldLabel htmlFor="capacity">Capacidade</FieldLabel>
              <Input
                id="capacity"
                type="number"
                inputMode="numeric"
                min={1}
                className="w-32 font-mono"
                aria-invalid={!!errors.capacity}
                {...form.register('capacity', {
                  setValueAs: (v) => (v === '' ? undefined : Number(v)),
                })}
              />
              <FieldDescription>Número máximo de pessoas na sala.</FieldDescription>
              <FieldError errors={[errors.capacity]} />
            </Field>
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Cadastrar sala'}
              </Button>
              <Button variant="outline" asChild>
                <Link to="/salas">Cancelar</Link>
              </Button>
            </div>
          </FieldGroup>
        </form>
      )}
    </>
  )
}
