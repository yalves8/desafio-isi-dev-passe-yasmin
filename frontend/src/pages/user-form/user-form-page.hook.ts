import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { z } from 'zod'
import { getErrorMessage, getErrorStatus } from '@/api/client'
import { usersService } from '@/api/users.service'

export const userSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome (mínimo 2 caracteres)').max(120),
  email: z.email('Informe um e-mail válido'),
  password: z.string().min(6, 'A senha precisa ter ao menos 6 caracteres'),
  role: z.enum(['ADMIN', 'USER']),
})

export type UserForm = z.infer<typeof userSchema>

export function useUserFormPage() {
  const navigate = useNavigate()
  const form = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: '', email: '', password: '', role: 'USER' },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await usersService.create(values)
      toast.success('Usuário cadastrado')
      await navigate('/usuarios')
    } catch (e) {
      if (getErrorStatus(e) === 409) form.setError('email', { message: getErrorMessage(e) })
      else toast.error(getErrorMessage(e))
    }
  })

  return { form, onSubmit, submitting: form.formState.isSubmitting }
}
