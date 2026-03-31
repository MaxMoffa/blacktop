<script>
  import { onMount } from 'svelte'

  let isFullscreen = false

  function syncFullscreenState() {
    isFullscreen = !!document.fullscreenElement
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
      return
    }

    document.exitFullscreen().catch((err) => {
      console.error('Exiting fullscreen failed:', err)
    })
  }

  onMount(() => {
    document.addEventListener('fullscreenchange', syncFullscreenState)
    syncFullscreenState()

    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreenState)
    }
  })
</script>

<style>
  :global(html),
  :global(body),
  :global(#app) {
    width: 100%;
    height: 100%;
    margin: 0;
  }

  :global(body) {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    background: radial-gradient(circle at top, #111 0%, #050505 60%, #000 100%);
    color: #f1f1f1;
  }

  .screen {
    width: 100%;
    min-height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    box-sizing: border-box;
  }

  .dialog {
    text-align: center;
    max-width: 460px;
    width: 100%;
    padding: 2rem;
    border-radius: 28px;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(18px);
    box-shadow: 0 25px 45px rgba(0, 0, 0, 0.6);
  }

  h1 {
    font-size: clamp(2.75rem, 4vw, 3.8rem);
    margin-bottom: 0.4rem;
    letter-spacing: 0.08em;
  }

  p {
    font-size: 1.05rem;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 1.2rem;
  }

  button {
    padding: 14px 32px;
    font-size: 1.15rem;
    color: #fff;
    background: #0f172a;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 999px;
    cursor: pointer;
    transition: transform 0.2s ease, background 0.2s ease;
  }

  button:hover {
    transform: translateY(-2px);
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  }

  .fullscreen-overlay {
    position: fixed;
    inset: 0;
    background: #000000;
    cursor: pointer;
  }

  .fullscreen-wallpaper {
    width: 120px;
    margin: 2rem auto 1rem;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.25), transparent 70%);
    height: 120px;
    border-radius: 50%;
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
      <div class="fullscreen-wallpaper"></div>
      <h1>Blacktop</h1>
      <p>Full-screen OLED-friendly overlay for Android desktop setups.</p>
      <button on:click={enterFullscreen}>Enter Fullscreen</button>
    </section>
  </main>
{/if}
