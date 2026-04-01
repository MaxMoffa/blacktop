<script>
  import { onMount } from 'svelte'

  let isFullscreen = false
  let wakeLock = null

  let deferredInstallPrompt = null
  let canInstallPwa = false
  let isPwaInstalled = false

  async function enableWakeLock() {
    if (!('wakeLock' in navigator) || wakeLock || !isFullscreen) return

    try {
      wakeLock = await navigator.wakeLock.request('screen')
      wakeLock.addEventListener('release', () => {
        wakeLock = null

        if (isFullscreen && document.visibilityState === 'visible') {
          enableWakeLock()
        }
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
    const standaloneIOS = window.navigator.standalone === true

    isPwaInstalled = standaloneMedia || standaloneIOS
    if (isPwaInstalled) {
      canInstallPwa = false
      deferredInstallPrompt = null
    }
  }

  function syncFullscreenState() {
    isFullscreen = !!document.fullscreenElement

    if (isFullscreen) {
      enableWakeLock()
      return
    }

    releaseWakeLock()
  }

  function onVisibilityChange() {
    if (!isFullscreen) return

    if (document.visibilityState === 'visible') {
      enableWakeLock()
      return
    }

    releaseWakeLock()
  }

  function enterFullscreen() {
    document.documentElement
      .requestFullscreen()
      .then(syncFullscreenState)
      .catch((err) => {
        console.error('Fullscreen request failed:', err)
      })
  }

  function exitFullscreen() {
    if (!document.fullscreenElement) {
      isFullscreen = false
      releaseWakeLock()
      return
    }

    document.exitFullscreen()
      .then(() => releaseWakeLock())
      .catch((err) => {
        console.error('Exiting fullscreen failed:', err)
      })
  }

  async function installPwa() {
    if (!deferredInstallPrompt) return

    deferredInstallPrompt.prompt()
    const choice = await deferredInstallPrompt.userChoice

    if (choice.outcome === 'accepted') {
      canInstallPwa = false
    }

    deferredInstallPrompt = null
  }

  onMount(() => {
    const beforeInstallHandler = (event) => {
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

<style>
  :global(html),
  :global(body),
  :global(#app) {
    width: 100%;
    min-height: 100%;
    margin: 0;
  }

  :global(body) {
    font-family: 'Inter', 'Space Grotesk', system-ui, sans-serif;
    color: #f4f8ff;
    background:
      radial-gradient(1100px 700px at 20% -10%, rgba(77, 123, 255, 0.26), transparent 60%),
      radial-gradient(1000px 680px at 110% 10%, rgba(122, 76, 255, 0.2), transparent 60%),
      linear-gradient(165deg, #03050a 0%, #070912 45%, #050608 100%);
  }

  .screen {
    width: 100%;
    min-height: 100%;
    display: grid;
    place-items: center;
    padding: clamp(20px, 4vw, 40px);
    box-sizing: border-box;
  }

  .dialog {
    width: min(500px, 100%);
    padding: clamp(28px, 5vw, 44px);
    border-radius: 30px;
    text-align: center;
    background: linear-gradient(160deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.03));
    border: 1px solid rgba(255, 255, 255, 0.17);
    backdrop-filter: blur(16px);
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.55);
  }

  .badge {
    margin: 0 auto 14px;
    width: 124px;
    height: 124px;
    border-radius: 50%;
    background:
      radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.5), transparent 45%),
      radial-gradient(circle at center, rgba(68, 121, 255, 0.36), rgba(68, 121, 255, 0) 72%);
  }

  h1 {
    margin: 0;
    font-size: clamp(2.4rem, 8vw, 3.5rem);
    letter-spacing: 0.08em;
    font-weight: 700;
  }

  p {
    margin: 14px auto 28px;
    max-width: 30ch;
    font-size: clamp(1rem, 2.7vw, 1.1rem);
    line-height: 1.45;
    color: rgba(236, 244, 255, 0.78);
  }

  .actions {
    display: grid;
    gap: 12px;
    width: 100%;
  }

  button {
    width: 100%;
    padding: 14px 18px;
    border-radius: 999px;
    border: 1px solid transparent;
    font-size: 1.02rem;
    font-weight: 600;
    letter-spacing: 0.01em;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  }

  .primary {
    color: white;
    background: linear-gradient(135deg, #2f64ff, #7b43ff);
    box-shadow: 0 10px 28px rgba(77, 81, 255, 0.38);
  }

  .secondary {
    color: rgba(237, 244, 255, 0.95);
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.22);
  }

  button:hover {
    transform: translateY(-2px);
  }

  .fullscreen-overlay {
    position: fixed;
    inset: 0;
    background: #000;
    cursor: pointer;
  }
</style>

{#if isFullscreen}
  <div
    class="fullscreen-overlay"
    on:click={exitFullscreen}
    aria-label="Exit fullscreen"
    role="button"
    tabindex="0"
    on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && exitFullscreen()}
  ></div>
{:else}
  <main class="screen">
    <section class="dialog">
      <div class="badge"></div>
      <h1>Blacktop</h1>
      <p>Full-screen OLED-friendly overlay for Android desktop setups.</p>

      <div class="actions">
        <button class="primary" on:click={enterFullscreen}>Enter Fullscreen</button>
        {#if canInstallPwa && !isPwaInstalled}
          <button class="secondary" on:click={installPwa}>Install App</button>
        {/if}
      </div>
    </section>
  </main>
{/if}
