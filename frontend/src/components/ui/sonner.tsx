"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4 text-success" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        // Figma (J13): ícone alinhado ao título, descrição em cinza e o X no canto superior direito
        classNames: {
          toast: "cn-toast !items-start !gap-3 !p-4 !pr-10 !shadow-lg",
          icon: "!mt-0.5",
          title: "!text-sm !font-medium",
          description: "!mt-0.5 !text-sm !text-muted-foreground",
          closeButton:
            "!left-auto !right-3 !top-3 !size-5 !transform-none !border-0 !bg-transparent !text-muted-foreground hover:!text-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
