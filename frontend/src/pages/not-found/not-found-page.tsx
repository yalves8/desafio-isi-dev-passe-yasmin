import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h1 className="mt-2 text-2xl font-bold">Página não encontrada</h1>
      <p className="mt-1 text-sm text-muted-foreground">O endereço não existe ou foi alterado.</p>
      <Button asChild className="mt-6">
        <Link to="/">Ir para o início</Link>
      </Button>
    </div>
  )
}
