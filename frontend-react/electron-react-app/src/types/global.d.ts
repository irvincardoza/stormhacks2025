export {}

declare global {
  interface Window {
    overlayAPI?: {
      captureScreen: () => Promise<string>
    }
  }
}

