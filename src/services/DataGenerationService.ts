import { TableRow } from "../types"

export interface DataGenerationOptions {
  count?: number
  chunkSize?: number
  onProgress?: (progress: number, processed: number, total: number) => void
}

export interface APIDataOptions extends DataGenerationOptions {
  endpoint: string
  method?: "GET" | "POST"
  headers?: Record<string, string>
  body?: any
  userCount?: number
}

export interface CSVDataOptions extends DataGenerationOptions {
  file: File
  delimiter?: string
  hasHeader?: boolean
}

export interface SyntheticDataOptions extends DataGenerationOptions {
  count: number
}

export type DataSource = "synthetic" | "api" | "csv"

export class DataGenerationService {
  private worker: ServiceWorker | null = null
  private isRegistered = false
  private activeRequests = new Map<
    string,
    {
      messageHandler: (event: MessageEvent) => void
      timeoutId: number
    }
  >()

  async initialize(): Promise<void> {
    if (!("serviceWorker" in navigator)) {
      throw new Error("Service workers are not supported in this browser")
    }

    try {
      // Register the service worker
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      })

      // Wait for the service worker to be ready
      const readyRegistration = await navigator.serviceWorker.ready

      // Get the active service worker
      this.worker = navigator.serviceWorker.controller

      if (!this.worker) {
        // Try to get the worker from the registration
        this.worker = readyRegistration.active
        if (!this.worker) {
          throw new Error("Service worker controller not available")
        }
      }

      this.isRegistered = true
    } catch (error) {
      console.error("Failed to register service worker:", error)
      throw error
    }
  }

  async generateData(options: DataGenerationOptions): Promise<TableRow[]> {
    if (!this.isRegistered || !this.worker) {
      throw new Error("Service worker not initialized")
    }

    const { count, chunkSize = 1000, onProgress } = options
    const requestId = `request-${Date.now()}-${Math.random()}`
    const worker = this.worker // Store reference to avoid null check issues

    return new Promise((resolve, reject) => {
      const messageHandler = (event: MessageEvent) => {
        const {
          type,
          data,
          progress,
          processed,
          total,
          requestId: responseRequestId,
        } = event.data

        if (responseRequestId !== requestId) {
          return // Ignore messages for other requests
        }

        switch (type) {
          case "PROGRESS":
            if (onProgress) {
              onProgress(progress, processed, total)
            }
            break

          case "COMPLETE":
            this.cleanupRequest(requestId)
            resolve(data)
            break

          case "ERROR":
            this.cleanupRequest(requestId)
            reject(new Error(data))
            break
        }
      }

      // Set a timeout to prevent hanging
      const timeoutId = window.setTimeout(() => {
        this.cleanupRequest(requestId)
        reject(new Error("Data generation timeout"))
      }, 300000) // 5 minutes timeout

      // Store the request for cleanup
      this.activeRequests.set(requestId, {
        messageHandler,
        timeoutId,
      })

      // Listen for messages from the service worker
      navigator.serviceWorker.addEventListener("message", messageHandler)

      // Send the generation request (without the onProgress function)
      worker.postMessage({
        type: "GENERATE_DATA",
        count,
        chunkSize,
        requestId,
      })
    })
  }

  async generateSyntheticData(
    options: SyntheticDataOptions
  ): Promise<TableRow[]> {
    return this.generateData(options)
  }

  async fetchAPIData(options: APIDataOptions): Promise<TableRow[]> {
    if (!this.isRegistered || !this.worker) {
      throw new Error("Service worker not initialized")
    }

    const { chunkSize = 1000, onProgress } = options
    const requestId = `api-${Date.now()}-${Math.random()}`
    const worker = this.worker

    return new Promise((resolve, reject) => {
      const messageHandler = (event: MessageEvent) => {
        const {
          type,
          data,
          progress,
          processed,
          total,
          requestId: responseRequestId,
        } = event.data

        if (responseRequestId !== requestId) {
          return
        }

        switch (type) {
          case "API_PROGRESS":
            if (onProgress) {
              onProgress(progress, processed, total)
            }
            break

          case "API_COMPLETE":
            this.cleanupRequest(requestId)
            resolve(data)
            break

          case "API_ERROR":
            this.cleanupRequest(requestId)
            reject(new Error(data))
            break
        }
      }

      // Set a timeout to prevent hanging
      const timeoutId = window.setTimeout(() => {
        this.cleanupRequest(requestId)
        reject(new Error("API data fetch timeout"))
      }, 300000)

      // Store the request for cleanup
      this.activeRequests.set(requestId, {
        messageHandler,
        timeoutId,
      })

      navigator.serviceWorker.addEventListener("message", messageHandler)

      // Remove the onProgress function from the message to avoid cloning error
      const { onProgress: _, ...messageOptions } = options
      worker.postMessage({
        type: "FETCH_API_DATA",
        ...messageOptions,
        chunkSize,
        requestId,
      })
    })
  }

  async parseCSVData(options: CSVDataOptions): Promise<TableRow[]> {
    if (!this.isRegistered || !this.worker) {
      throw new Error("Service worker not initialized")
    }

    const { chunkSize = 1000, onProgress } = options
    const requestId = `csv-${Date.now()}-${Math.random()}`
    const worker = this.worker

    return new Promise((resolve, reject) => {
      const messageHandler = (event: MessageEvent) => {
        const {
          type,
          data,
          progress,
          processed,
          total,
          requestId: responseRequestId,
        } = event.data

        if (responseRequestId !== requestId) {
          return
        }

        switch (type) {
          case "CSV_PROGRESS":
            if (onProgress) {
              onProgress(progress, processed, total)
            }
            break

          case "CSV_COMPLETE":
            this.cleanupRequest(requestId)
            resolve(data)
            break

          case "CSV_ERROR":
            this.cleanupRequest(requestId)
            reject(new Error(data))
            break
        }
      }

      // Set a timeout to prevent hanging
      const timeoutId = window.setTimeout(() => {
        this.cleanupRequest(requestId)
        reject(new Error("CSV parsing timeout"))
      }, 300000)

      // Store the request for cleanup
      this.activeRequests.set(requestId, {
        messageHandler,
        timeoutId,
      })

      navigator.serviceWorker.addEventListener("message", messageHandler)

      // Remove the onProgress function from the message to avoid cloning error
      const { onProgress: _, ...messageOptions } = options
      worker.postMessage({
        type: "PARSE_CSV_DATA",
        ...messageOptions,
        chunkSize,
        requestId,
      })
    })
  }

  private cleanupRequest(requestId: string): void {
    const request = this.activeRequests.get(requestId)
    if (request) {
      navigator.serviceWorker.removeEventListener(
        "message",
        request.messageHandler
      )
      clearTimeout(request.timeoutId)
      this.activeRequests.delete(requestId)
    }
  }

  cancelAllRequests(): void {
    this.activeRequests.forEach((request, requestId) => {
      navigator.serviceWorker.removeEventListener(
        "message",
        request.messageHandler
      )
      clearTimeout(request.timeoutId)
    })
    this.activeRequests.clear()
  }

  isAvailable(): boolean {
    return this.isRegistered && this.worker !== null
  }

  async terminate(): Promise<void> {
    // Cancel all active requests
    this.cancelAllRequests()

    if (this.worker) {
      // Unregister the service worker
      const registrations = await navigator.serviceWorker.getRegistrations()
      for (const registration of registrations) {
        if (registration.scope.includes("/sw.js")) {
          await registration.unregister()
        }
      }
      this.worker = null
      this.isRegistered = false
    }
  }
}

// Singleton instance
export const dataGenerationService = new DataGenerationService()
