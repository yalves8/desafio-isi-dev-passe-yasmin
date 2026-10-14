import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router'
import { z } from 'zod'
import { getErrorMessage } from '@/api/client'
import { useAuth } from '@/hooks/use-auth'

export const loginSchema = z.object({
  email: z.email('Informe um e-mail válido'),
  password: z.string().min(1, 'Informe a senha'),
})

export type LoginForm = z.infer<typeof loginSchema>

export function useLoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = form.handleSubmit(async ({ email, password }) => {
    setError(null)
    try {
      await login(email, password)
      const from = (location.state as { from?: string } | null)?.from
      await navigate(from ?? '/', { replace: true })
    } catch (e) {
      setError(getErrorMessage(e))
    }
  })

  return { form, onSubmit, error, submitting: form.formState.isSubmitting }
}
