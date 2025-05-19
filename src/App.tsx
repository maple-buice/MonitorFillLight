import { useState, useRef, useEffect, useCallback } from 'react'
import './App.css'

// Preset color temperatures in Kelvin and their RGB approximations
const PRESETS = [
  { label: 'Candle (1900K)', kelvin: 1900 },
  { label: 'Tungsten (2700K)', kelvin: 2700 },
  { label: 'Warm White (3000K)', kelvin: 3000 },
  { label: 'Neutral White (4000K)', kelvin: 4000 },
  { label: 'Daylight (5600K)', kelvin: 5600 },
  { label: 'Cool Daylight (6500K)', kelvin: 6500 },
]

// Convert Kelvin to RGB (approximate)
function kelvinToRgb(kelvin: number): [number, number, number] {
  let temp = kelvin / 100
  let red, green, blue
  if (temp <= 66) {
    red = 255
    green = temp < 66 ? 99.4708025861 * Math.log(temp) - 161.1195681661 : 255
    blue = temp <= 19 ? 0 : 138.5177312231 * Math.log(temp - 10) - 305.0447927307
  } else {
    red = 329.698727446 * Math.pow(temp - 60, -0.1332047592)
    green = 288.1221695283 * Math.pow(temp - 60, -0.0755148492)
    blue = 255
  }
  return [
    Math.max(0, Math.min(255, red)),
    Math.max(0, Math.min(255, green)),
    Math.max(0, Math.min(255, blue)),
  ]
}

// Utility to determine if a color is light or dark (for contrast)
function isColorLight(r: number, g: number, b: number) {
  // Perceived luminance formula
  return (0.299 * r + 0.587 * g + 0.114 * b) > 186
}

const AUTOHIDE_DELAY = 2000 // ms

function App() {
  const [kelvin, setKelvin] = useState(4000)
  const [brightness, setBrightness] = useState(100)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [autoHidden, setAutoHidden] = useState(false)
  const [controlsAnim, setControlsAnim] = useState('show')
  const [showBtnAnim, setShowBtnAnim] = useState('hide')
  const containerRef = useRef<HTMLDivElement>(null)
  const autohideTimer = useRef<NodeJS.Timeout | null>(null)

  const [r, g, b] = kelvinToRgb(kelvin)
  const bgColor = `rgb(${r}, ${g}, ${b})`
  const filter = `brightness(${brightness}%)`
  const fullscreenBtnTextColor = isColorLight(r, g, b) ? '#222' : '#fff'

  // Fullscreen state tracking
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Auto-hide logic
  const showControls = useCallback(() => {
    setControlsVisible(true)
    setAutoHidden(false)
    setControlsAnim('show')
    setShowBtnAnim('hide')
    if (autohideTimer.current) clearTimeout(autohideTimer.current)
    autohideTimer.current = setTimeout(() => {
      setControlsAnim('hide')
      setShowBtnAnim('show')
      setTimeout(() => {
        setControlsVisible(false)
        setAutoHidden(true)
      }, 300) // match animation duration
    }, AUTOHIDE_DELAY)
  }, [])

  useEffect(() => {
    if (!controlsVisible) return
    // Listen for mousemove to reset timer
    const handleMouseMove = () => {
      showControls()
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (autohideTimer.current) clearTimeout(autohideTimer.current)
    }
  }, [controlsVisible, showControls])

  // Show controls on hover over the controls area or Show Controls button
  const handleControlsMouseEnter = () => {
    setControlsVisible(true)
    setAutoHidden(false)
    setControlsAnim('show')
    setShowBtnAnim('hide')
    if (autohideTimer.current) clearTimeout(autohideTimer.current)
  }

  // Hide controls when Hide Controls is clicked (manual hide)
  const handleHideControls = () => {
    setControlsAnim('hide')
    setShowBtnAnim('show')
    setTimeout(() => {
      setControlsVisible(false)
      setAutoHidden(false)
    }, 300)
    if (autohideTimer.current) clearTimeout(autohideTimer.current)
  }

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (isFullscreen) {
        document.exitFullscreen()
      } else {
        containerRef.current.requestFullscreen()
      }
    }
  }

  return (
    <div
      ref={containerRef}
      className="fill-light-container"
      style={{
        background: bgColor,
        filter,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.2s, filter 0.2s',
      }}
    >
      {controlsVisible ? (
        <div
          className={`controls controls-anim-${controlsAnim}`}
          style={{
            background: 'rgba(0,0,0,0.3)',
            borderRadius: 12,
            padding: 24,
            marginBottom: 32,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            minWidth: 320,
            maxWidth: '90vw',
          }}
          onMouseEnter={handleControlsMouseEnter}
        >
          <h1 style={{margin: 0, fontSize: 28}}>Monitor Fill Light</h1>
          <button
            onClick={handleFullscreen}
            style={{
              fontSize: 18,
              padding: '8px 16px',
              color: fullscreenBtnTextColor,
              background: bgColor,
              border: '2px solid #fff',
              fontWeight: 700,
              marginBottom: 8,
              transition: 'color 0.2s, background 0.2s',
            }}
          >
            {isFullscreen ? 'Exit Fullscreen' : 'Go Fullscreen'}
          </button>
          <div>
            <label htmlFor="kelvin-slider">Color Temperature: <b>{kelvin}K</b></label>
            <input
              id="kelvin-slider"
              type="range"
              min={1900}
              max={6500}
              step={10}
              value={kelvin}
              onChange={e => setKelvin(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
            {PRESETS.map(preset => (
              <button
                key={preset.kelvin}
                onClick={() => setKelvin(preset.kelvin)}
                style={{
                  background: kelvin === preset.kelvin ? '#fff' : '#eee',
                  color: kelvin === preset.kelvin ? '#222' : '#444',
                  border: '1px solid #ccc',
                  borderRadius: 6,
                  padding: '4px 10px',
                  fontWeight: kelvin === preset.kelvin ? 700 : 400,
                  cursor: 'pointer',
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div>
            <label htmlFor="brightness-slider">Brightness: <b>{brightness}%</b></label>
            <input
              id="brightness-slider"
              type="range"
              min={10}
              max={100}
              step={1}
              value={brightness}
              onChange={e => setBrightness(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
          <button
            onClick={handleHideControls}
            style={{
              marginTop: 12,
              alignSelf: 'flex-end',
              background: 'rgba(0,0,0,0.5)',
              color: '#fff',
              border: 'none',
              fontSize: 16,
              padding: '4px 12px',
              borderRadius: 6,
              cursor: 'pointer',
            }}
            aria-label="Hide controls"
          >
            Hide Controls
          </button>
        </div>
      ) : (
        <button
          className={`show-controls-btn show-controls-anim-${showBtnAnim}`}
          onClick={() => { setControlsVisible(true); setAutoHidden(false); setControlsAnim('show'); setShowBtnAnim('hide'); }}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            background: 'rgba(0,0,0,0.25)',
            color: '#fff',
            border: '2px solid #fff',
            borderRadius: 24,
            fontSize: 18,
            padding: '12px 20px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            opacity: 0.6,
            transition: 'opacity 0.2s',
          }}
          aria-label="Show controls"
          onMouseEnter={handleControlsMouseEnter}
        >
          Show Controls
        </button>
      )}
    </div>
  )
}

export default App
