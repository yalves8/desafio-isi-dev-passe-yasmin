import { CircleCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useReturnFocus } from '@/hooks/use-return-focus'
import { cn } from '@/lib/utils'
import type { ActionDialogProps, ActionDialogSize } from './action-dialog.types'

const SIZES: Record<ActionDialogSize, string> = {
  sm: 'sm:max-w-[460px]',
  md: 'sm:max-w-[520px]',
  lg: 'sm:max-w-[560px]',
  xl: 'sm:max-w-[852px]',
}

/**
 * Estrutura única dos diálogos de ação (Figma): título, descrição, corpo e rodapé com
 * Cancelar + ação principal. Enquanto `busy`, não fecha e a ação não é enviada de novo.
 */
export function ActionDialog({
  title,
  description,
  success = false,
  size = 'md',
  className,
  alert = false,
  busy = false,
  onClose,
  confirm,
  cancelLabel = 'Cancelar',
  secondaryActions,
  footerNote,
  children,
}: ActionDialogProps) {
  const returnFocus = useReturnFocus()

  return (
    <Dialog open onOpenChange={(open) => !open && !busy && onClose()}>
      <DialogContent
        role={alert ? 'alertdialog' : 'dialog'}
        showCloseButton={!alert}
        onInteractOutside={alert ? (e) => e.preventDefault() : undefined}
        onCloseAutoFocus={returnFocus}
        className={cn(
          // Filhos do grid com min-w-0: texto longo sem espaço (nome de jogador) não alarga o
          // diálogo nem cria rolagem lateral
          'max-h-[calc(100dvh-2rem)] gap-5 overflow-y-auto p-6 *:min-w-0',
          SIZES[size],
          className,
        )}
      >
        <DialogHeader className="gap-1.5">
          {success && (
            <span
              data-slot="dialog-success-icon"
              className="mb-2 flex size-9 items-center justify-center rounded-full bg-green-50 text-green-700"
            >
              <CircleCheck className="size-5" aria-hidden />
            </span>
          )}
          <DialogTitle className="text-lg font-semibold wrap-anywhere">{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {children}

        <div className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-end">
          {footerNote && (
            <div className="text-xs text-muted-foreground sm:mr-auto">{footerNote}</div>
          )}
          {cancelLabel !== false && (
            <Button variant="outline" size="md" onClick={onClose} disabled={busy}>
              {cancelLabel}
            </Button>
          )}
          {secondaryActions}
          <Button
            size="md"
            type={confirm.form ? 'submit' : 'button'}
            form={confirm.form}
            onClick={confirm.onClick}
            disabled={busy || confirm.disabled}
            className={cn(
              confirm.variant === 'destructive' &&
                'bg-destructive text-white hover:bg-destructive/90',
            )}
          >
            {confirm.icon}
            {busy && confirm.busyLabel ? confirm.busyLabel : confirm.label}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
