import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { z } from 'zod'
import { authService } from '@/api/auth.service'
import { getErrorMessage, getErrorStatus } from '@/api/client'

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Informe o nome (mínimo 2 caracteres)').max(120),
    email: z.email('Informe um e-mail válido'),
    password: z.string().min(6, 'A senha precisa ter ao menos 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não conferem',
  })

export type RegisterForm = z.infer<typeof registerSchema>

export function useRegisterPage() {
  const navigate = useNavigate()
  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = form.handleSubmit(async ({ confirmPassword: _confirm, ...input }) => {
    try {
      await authService.register(input)
      toast.success('Conta criada. Entre com seu e-mail e senha.')
      await navigate('/login', { replace: true })
    } catch (e) {
      if (getErrorStatus(e) === 409) form.setError('email', { message: getErrorMessage(e) })
      else toast.error(getErrorMessage(e))
    }
  })

  return { form, onSubmit, submitting: form.formState.isSubmitting }
}
