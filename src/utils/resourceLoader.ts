/**
 * Utility for handling external resource loading with fallbacks
 */

export const loadExternalResource = async (url: string, type: 'script' | 'style'): Promise<boolean> => {
  return new Promise((resolve) => {
    const element = type === 'script' 
      ? document.createElement('script')
      : document.createElement('link')

    const onLoad = () => {
      cleanup()
      resolve(true)
    }

    const onError = () => {
      cleanup()

      resolve(false)
    }

    const cleanup = () => {
      element.removeEventListener('load', onLoad)
      element.removeEventListener('error', onError)
    }

    element.addEventListener('load', onLoad)
    element.addEventListener('error', onError)

    if (type === 'script') {
      (element as HTMLScriptElement).src = url
      (element as HTMLScriptElement).async = true
    } else {
      (element as HTMLLinkElement).rel = 'stylesheet'
      (element as HTMLLinkElement).href = url
    }

    document.head.appendChild(element)

    // Timeout after 10 seconds
    setTimeout(() => {
      if (element.parentNode) {
        onError()
      }
    }, 10000)
  })
}

export const handleResourceErrors = () => {
  // Global error handler for resource loading
  window.addEventListener('error', (event) => {
    if (event.target && (event.target as any).tagName) {
      const target = event.target as HTMLElement
      if (target.tagName === 'LINK' || target.tagName === 'SCRIPT') {

        // Don't let these errors bubble up and break the app
        event.preventDefault()
      }
    }
  }, true)
}