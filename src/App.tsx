import { useState, useRef } from 'react'
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

function App() {
  const [kelvin, setKelvin] = useState(4000)
  const [brightness, setBrightness] = useState(100)
  const [controlsVisible, setControlsVisible] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  const [r, g, b] = kelvinToRgb(kelvin)
  const bgColor = `rgb(${r}, ${g}, ${b})`
  const filter = `brightness(${brightness}%)`

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
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
        <div className="controls" style={{
          background: 'rgba(0,0,0,0.3)',
          borderRadius: 12,
          padding: 24,
          marginBottom: 32,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          minWidth: 320,
          maxWidth: '90vw',
        }}>
          <h1 style={{margin: 0, fontSize: 28}}>Monitor Fill Light</h1>
          <button
            onClick={handleFullscreen}
            style={{
              fontSize: 18,
              padding: '8px 16px',
              color: '#fff', // High contrast text
              background: '#222',
              border: '2px solid #fff',
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            {document.fullscreenElement ? 'Exit Fullscreen' : 'Go Fullscreen'}
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
            onClick={() => setControlsVisible(false)}
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
          className="show-controls-btn"
          onClick={() => setControlsVisible(true)}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 10,
            background: 'rgba(0,0,0,0.7)',
            color: '#fff',
            border: '2px solid #fff',
            borderRadius: 24,
            fontSize: 18,
            padding: '12px 20px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
          aria-label="Show controls"
        >
          Show Controls
        </button>
      )}
    </div>
  )
}

export default App
