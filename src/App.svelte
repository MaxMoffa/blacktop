<script lang="ts">
  import { onMount } from 'svelte'
  import { Button } from '$lib/components/ui/button/index.js'
  import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
  } from '$lib/components/ui/card/index.js'

  let isFullscreen = $state(false)
  let wakeLock = $state<WakeLockSentinel | null>(null)
  let wakeLockEnabled = $state(true)
  let deferredInstallPrompt = $state<Event | null>(null)
  let canInstallPwa = $state(false)
  let isPwaInstalled = $state(false)

  async function enableWakeLock() {
    if (!wakeLockEnabled || !('wakeLock' in navigator) || wakeLock || !isFullscreen) return
    try {
      wakeLock = await (navigator as Navigator & { wakeLock: { request(type: string): Promise<WakeLockSentinel> } }).wakeLock.request('screen')
      wakeLock.addEventListener('release', () => {
        wakeLock = null
        if (wakeLockEnabled && isFullscreen && document.visibilityState === 'visible') enableWakeLock()
      })
    } catch (err) {
      console.error('Failed to acquire Wake Lock:', err)
    }
  }

  function releaseWakeLock() {
    if (!wakeLock) return
    wakeLock.release()
    wakeLock = null
  }

  function detectPwaInstalled() {
    const standaloneMedia = window.matchMedia('(display-mode: standalone)').matches
    const standaloneIOS = (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    isPwaInstalled = standaloneMedia || standaloneIOS
    if (isPwaInstalled) {
      canInstallPwa = false
      deferredInstallPrompt = null
    }
  }

  function syncFullscreenState() {
    isFullscreen = !!document.fullscreenElement
    if (isFullscreen) { enableWakeLock(); return }
    releaseWakeLock()
  }

  function onVisibilityChange() {
    if (!isFullscreen) return
    if (document.visibilityState === 'visible') { enableWakeLock(); return }
    releaseWakeLock()
  }

  function enterFullscreen() {
    document.documentElement.requestFullscreen().then(syncFullscreenState).catch((err) => {
      console.error('Fullscreen request failed:', err)
    })
  }

  function exitFullscreen() {
    if (!document.fullscreenElement) { isFullscreen = false; releaseWakeLock(); return }
    document.exitFullscreen().then(() => releaseWakeLock()).catch((err) => {
      console.error('Exiting fullscreen failed:', err)
    })
  }

  async function installPwa() {
    if (!deferredInstallPrompt) return
    const prompt = deferredInstallPrompt as Event & { prompt(): void; userChoice: Promise<{ outcome: string }> }
    prompt.prompt()
    const choice = await prompt.userChoice
    if (choice.outcome === 'accepted') canInstallPwa = false
    deferredInstallPrompt = null
  }

  onMount(() => {
    const beforeInstallHandler = (event: Event) => {
      event.preventDefault()
      deferredInstallPrompt = event
      canInstallPwa = !isPwaInstalled
    }
    const appInstalledHandler = () => {
      isPwaInstalled = true
      canInstallPwa = false
      deferredInstallPrompt = null
    }

    document.addEventListener('fullscreenchange', syncFullscreenState)
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('beforeinstallprompt', beforeInstallHandler)
    window.addEventListener('appinstalled', appInstalledHandler)
    detectPwaInstalled()
    syncFullscreenState()

    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreenState)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('beforeinstallprompt', beforeInstallHandler)
      window.removeEventListener('appinstalled', appInstalledHandler)
      releaseWakeLock()
    }
  })
</script>

{#if isFullscreen}
  <div
    class="fixed inset-0 bg-black cursor-pointer"
    onclick={exitFullscreen}
    onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && exitFullscreen()}
    aria-label="Exit fullscreen"
    role="button"
    tabindex="0"
  ></div>
{:else}
  <main class="grid place-items-center w-screen h-dvh bg-black px-5 py-8">
    <!-- Ambient glow backdrop -->
    <div class="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      <div class="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl"></div>
      <div class="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-violet-600/10 blur-2xl"></div>
    </div>

    <Card class="w-full max-w-sm text-center relative">
      <CardHeader class="items-center pb-2">
        <!-- Icon badge -->
        <div class="mb-2 relative">
          <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 shadow-lg shadow-blue-900/40 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
              <rect x="8" y="8" width="24" height="24" rx="4" fill="white" fill-opacity="0.15"/>
              <rect x="12" y="12" width="16" height="16" rx="2" fill="white" fill-opacity="0.9"/>
            </svg>
          </div>
          <div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 blur-lg opacity-40 -z-10"></div>
        </div>

        <CardTitle class="text-4xl font-bold tracking-tight bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent">
          Blacktop
        </CardTitle>
        <CardDescription class="text-white/45 text-sm max-w-[22ch] mx-auto leading-relaxed mt-1">
          Full-screen OLED overlay for Android desktop setups
        </CardDescription>
      </CardHeader>

      <CardContent class="pt-4 pb-0">
        <!-- Divider -->
        <div class="w-full h-px bg-gradient-to-r from-transparent via-white/8 to-transparent mb-4"></div>

        <!-- Wake lock toggle -->
        <label class="flex items-center justify-between gap-3 cursor-pointer select-none px-1">
          <div class="text-left">
            <span class="text-sm font-medium text-white/80">Keep screen on</span>
            <p class="text-xs text-white/35 mt-0.5">Prevent display from sleeping in fullscreen</p>
          </div>
          <button
            role="switch"
            aria-label="Keep screen on"
            aria-checked={wakeLockEnabled}
            onclick={() => (wakeLockEnabled = !wakeLockEnabled)}
            class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer {wakeLockEnabled ? 'bg-blue-600' : 'bg-white/15'}"
          >
            <span
              class="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 {wakeLockEnabled ? 'translate-x-5' : 'translate-x-0.5'}"
            ></span>
          </button>
        </label>
      </CardContent>

      <CardFooter class="pt-5 gap-3">
        <Button
          class="w-full text-base font-semibold"
          size="lg"
          onclick={enterFullscreen}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="opacity-80" aria-hidden="true">
            <polyline points="15 3 21 3 21 9"></polyline>
            <polyline points="9 21 3 21 3 15"></polyline>
            <line x1="21" y1="3" x2="14" y2="10"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
          Enter Fullscreen
        </Button>

        {#if canInstallPwa && !isPwaInstalled}
          <Button
            variant="outline"
            class="w-full text-sm"
            size="lg"
            onclick={installPwa}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="opacity-70" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Install App
          </Button>
        {/if}
      </CardFooter>
    </Card>
  </main>
{/if}
