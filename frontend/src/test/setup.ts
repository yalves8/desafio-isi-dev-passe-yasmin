import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'

// APIs de layout/ponteiro que o jsdom não tem e os menus do Radix usam
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver
Element.prototype.hasPointerCapture ??= () => false
Element.prototype.releasePointerCapture ??= () => {}
Element.prototype.scrollIntoView ??= () => {}

afterEach(() => {
  cleanup()
  localStorage.clear()
})
