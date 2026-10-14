export type AttributesPreviewState =
  | { status: 'empty' | 'invalid' }
  | { status: 'ready'; items: { label: string; value: number }[]; potential?: number }

export interface AttributesPreviewProps {
  preview: AttributesPreviewState
}
