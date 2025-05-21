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

// Convert Kelvin to RGB (scientific, Tanner Helland's algorithm)
function kelvinToRgb(kelvin: number): [number, number, number] {
  const temp = kelvin / 100;
  let red, green, blue;

  // Red
  if (temp <= 66) {
    red = 255;
  } else {
    red = temp - 60;
    red = 329.698727446 * Math.pow(red, -0.1332047592);
    red = Math.min(Math.max(red, 0), 255);
  }

  // Green
  if (temp <= 66) {
    green = 99.4708025861 * Math.log(temp) - 161.1195681661;
    green = Math.min(Math.max(green, 0), 255);
  } else {
    green = temp - 60;
    green = 288.1221695283 * Math.pow(green, -0.0755148492);
    green = Math.min(Math.max(green, 0), 255);
  }

  // Blue
  if (temp >= 66) {
    blue = 255;
  } else if (temp <= 19) {
    blue = 0;
  } else {
    blue = temp - 10;
    blue = 138.5177312231 * Math.log(blue) - 305.0447927307;
    blue = Math.min(Math.max(blue, 0), 255);
  }

  return [Math.round(red), Math.round(green), Math.round(blue)];
}

// Utility to determine if a color is light or dark (for contrast)
function isColorLight(r: number, g: number, b: number) {
  // Perceived luminance formula
  return (0.299 * r + 0.587 * g + 0.114 * b) > 186
}

const AUTOHIDE_DELAY = 1000 // ms

type ControlsState = 'visible' | 'hiding' | 'hidden';

interface AppProps {
  animationDuration?: number;
}

function App({ animationDuration = 300 }: AppProps) {
  const [kelvin, setKelvin] = useState(5600)
  const [brightness, setBrightness] = useState(100)
  const [controlsState, setControlsState] = useState<ControlsState>('visible')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const autohideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const animTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [r, g, b] = kelvinToRgb(kelvin)
  const bgColor = `rgb(${r}, ${g}, ${b})`
  const filter = `brightness(${brightness}%)`
  const textColor = isColorLight(r, g, b) ? '#222' : '#fff';
  const isBgLight = isColorLight(r, g, b);
  const presetBtnBaseStyle = isBgLight
    ? { background: '#fff', color: '#222', border: '1.5px solid #222' }
    : { background: '#222', color: '#fff', border: '1.5px solid #fff' };
  const presetBtnActiveStyle = isBgLight
    ? { background: '#fff', color: '#222', border: '2.5px solid #222', fontWeight: 700 }
    : { background: '#222', color: '#fff', border: '2.5px solid #fff', fontWeight: 700 };
  const fullscreenBtnStyle = isBgLight
    ? { background: '#fff', color: '#222', border: '2px solid #222' }
    : { background: '#222', color: '#fff', border: '2px solid #fff' };

  // Fullscreen state tracking
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Show controls and start auto-hide timer
  const showControls = useCallback(() => {
    setControlsState(prev => (prev !== 'visible' ? 'visible' : prev));
    if (autohideTimer.current) clearTimeout(autohideTimer.current);
    if (animTimer.current) clearTimeout(animTimer.current);
    autohideTimer.current = setTimeout(() => {
      setControlsState('hiding');
      if (animationDuration === 0) {
        setControlsState('hidden');
      } else {
        animTimer.current = setTimeout(() => {
          setControlsState('hidden');
        }, animationDuration);
      }
    }, AUTOHIDE_DELAY);
  }, [animationDuration]);

  // Pause auto-hide while mouse is over controls
  const handleControlsMouseEnter = () => {
    if (autohideTimer.current) clearTimeout(autohideTimer.current);
    if (animTimer.current) clearTimeout(animTimer.current);
    setControlsState('visible');
  };

  const handleControlsMouseLeave = () => {
    if (autohideTimer.current) clearTimeout(autohideTimer.current);
    if (animTimer.current) clearTimeout(animTimer.current);
    autohideTimer.current = setTimeout(() => {
      setControlsState('hiding');
      if (animationDuration === 0) {
        setControlsState('hidden');
      } else {
        animTimer.current = setTimeout(() => {
          setControlsState('hidden');
        }, animationDuration);
      }
    }, AUTOHIDE_DELAY);
  };

  const handleShowControlsBtn = () => {
    setControlsState('visible')
    showControls()
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

  // Determine animation class
  let controlsAnimClass = ''
  if (controlsState === 'visible') controlsAnimClass = 'controls-anim-show'
  else if (controlsState === 'hiding') controlsAnimClass = 'controls-anim-hide'
  else controlsAnimClass = 'controls-anim-hide'

  // Cleanup timers on unmount only
  useEffect(() => {
    return () => {
      if (autohideTimer.current) clearTimeout(autohideTimer.current);
      if (animTimer.current) clearTimeout(animTimer.current);
    };
  }, []);

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
        position: 'relative',
      }}
    >
      {controlsState !== 'hidden' ? (
        <div
          className={`controls ${controlsAnimClass}`}
          onMouseEnter={handleControlsMouseEnter}
          onMouseLeave={handleControlsMouseLeave}
          style={{ color: textColor }}
        >
          <h1 className="fill-title" style={{ color: textColor }}>Monitor Fill Light</h1>
          <button
            className="fullscreen-btn"
            style={{ ...fullscreenBtnStyle, fontWeight: 600, fontSize: 24, padding: '16px 32px', borderRadius: 12, margin: '24px 0' }}
            onClick={handleFullscreen}
          >
            {isFullscreen ? 'Exit Fullscreen' : 'Go Fullscreen'}
          </button>
          <div className="slider-group">
            <label htmlFor="kelvin-slider" style={{ color: textColor }}>
              Color Temperature: <b>{kelvin}K</b>
            </label>
            <input
              id="kelvin-slider"
              className="fill-slider"
              type="range"
              min={1900}
              max={6500}
              step={10}
              value={kelvin}
              onChange={e => setKelvin(Number(e.target.value))}
            />
          </div>
          <div className="presets-row">
            {PRESETS.map(preset => (
              <button
                key={preset.kelvin}
                className={`preset-btn${kelvin === preset.kelvin ? ' active' : ''}`}
                style={kelvin === preset.kelvin ? presetBtnActiveStyle : presetBtnBaseStyle}
                onClick={() => setKelvin(preset.kelvin)}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="slider-group">
            <label htmlFor="brightness-slider" style={{ color: textColor }}>
              Brightness: <b>{brightness}%</b>
            </label>
            <input
              id="brightness-slider"
              className="fill-slider"
              type="range"
              min={10}
              max={100}
              step={1}
              value={brightness}
              onChange={e => setBrightness(Number(e.target.value))}
            />
          </div>
        </div>
      ) : null}
      {controlsState === 'hidden' && (
        <button
          className="show-controls-btn show-controls-anim-show"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 9999,
          }}
          onClick={handleShowControlsBtn}
          onMouseEnter={handleControlsMouseEnter}
        >
          Show Controls
        </button>
      )}
    </div>
  )
}

export default App
