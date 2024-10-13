interface Document {
    webkitFullscreenElement: Element | null
    webkitExitFullscreen(): Promise<void>
}

interface HTMLElement {
    webkitRequestFullScreen(options?: FullscreenOptions): Promise<void>
}
