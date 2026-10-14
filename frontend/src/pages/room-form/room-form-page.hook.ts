import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { z } from 'zod'
import { getErrorMessage, getErrorStatus } from '@/api/client'
import { roomsService } from '@/api/rooms.service'

export const roomSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Informe o nome (mínimo 2 caracteres)')
    .max(80, 'Máximo de 80 caracteres'),
  capacity: z
    .number({ error: 'Informe a capacidade' })
    .int('A capacidade deve ser um número inteiro')
    .min(1, 'A capacidade deve ser maior que zero')
    .max(10000, 'A capacidade deve ser no máximo 10000'),
})

export type RoomForm = z.infer<typeof roomSchema>

export function useRoomFormPage() {
  const { id } = useParams()
  const roomId = id ? Number(id) : undefined
  const isEdit = roomId !== undefined
  const navigate = useNavigate()
  const [loading, setLoading] = useState(isEdit)
  const [loadError, setLoadError] = useState<string | null>(null)

  const form = useForm<RoomForm>({
    resolver: zodResolver(roomSchema),
    defaultValues: { name: '', capacity: undefined },
  })

  useEffect(() => {
    if (!isEdit) return
    let ignore = false
    roomsService
      .get(roomId)
      .then((room) => !ignore && form.reset({ name: room.name, capacity: room.capacity }))
      .catch((e) => !ignore && setLoadError(getErrorMessage(e)))
      .finally(() => !ignore && setLoading(false))
    return () => {
      ignore = true
    }
  }, [isEdit, roomId, form])

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (isEdit) {
        await roomsService.update(roomId, values)
        toast.success('Alterações salvas')
      } else {
        await roomsService.create(values)
        toast.success('Sala cadastrada')
      }
      await navigate('/salas')
    } catch (e) {
      // 409 (nome duplicado) aparece no próprio campo; o resto vira toast
      if (getErrorStatus(e) === 409) form.setError('name', { message: getErrorMessage(e) })
      else toast.error(getErrorMessage(e))
    }
  })

  return { form, onSubmit, isEdit, loading, loadError, submitting: form.formState.isSubmitting }
}
