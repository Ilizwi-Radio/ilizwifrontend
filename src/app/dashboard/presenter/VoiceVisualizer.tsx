import React, { useEffect, useRef, useState } from 'react';
import { audioEngine } from '@/lib/audioEngine';
import { Activity, Mic, MicOff, Volume2 } from 'lucide-react';

interface VoiceVisualizerProps {
  isLive: boolean;
  isMuted: boolean;
  intensity: number; // 0-100
  peak: number; // 0-100
  mode?: 'dual' | 'waveform' | 'spectrum';
}

export default function VoiceVisualizer({
  isLive,
  isMuted,
  intensity,
  peak,
  mode = 'dual',
}: VoiceVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [visualMode, setVisualMode] = useState<'wave' | 'spectrum' | 'dual'>(mode === 'dual' ? 'dual' : mode === 'waveform' ? 'wave' : 'spectrum');

  // Draw real-time canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const freqArray = new Uint8Array(64);
    const timeArray = new Uint8Array(128);

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Dark subtle grid background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      // Grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (!isLive || isMuted) {
        // Idle/Muted baseline line
        ctx.strokeStyle = isMuted ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
        ctx.font = '12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(
          isMuted ? '● MICROPHONE MUTED' : '● STANDBY • READY TO BROADCAST',
          width / 2,
          height / 2 - 12
        );

        animId = requestAnimationFrame(render);
        return;
      }

      // Fetch live audio data
      audioEngine.getFrequencyData(freqArray);
      audioEngine.getTimeDomainData(timeArray);

      // 1. Draw Spectrum Equalizer Bars
      if (visualMode === 'spectrum' || visualMode === 'dual') {
        const barCount = 48;
        const barWidth = Math.max(3, (width / barCount) - 3);
        const maxHeight = visualMode === 'dual' ? height * 0.45 : height * 0.85;

        for (let i = 0; i < barCount; i++) {
          const dataIndex = Math.floor((i / barCount) * freqArray.length);
          const rawVal = freqArray[dataIndex] || 0;
          const barHeight = Math.max(4, (rawVal / 255) * maxHeight);
          const x = i * (barWidth + 3) + 4;
          const y = height - barHeight - 4;

          // Gradient color depending on height
          const grad = ctx.createLinearGradient(0, height, 0, y);
          if (rawVal > 210) {
            grad.addColorStop(0, '#10b981'); // Emerald
            grad.addColorStop(0.7, '#f59e0b'); // Amber
            grad.addColorStop(1, '#ef4444'); // Red peak
          } else if (rawVal > 130) {
            grad.addColorStop(0, '#059669');
            grad.addColorStop(1, '#fbbf24');
          } else {
            grad.addColorStop(0, '#047857');
            grad.addColorStop(1, '#34d399');
          }

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
          ctx.fill();

          // Peak cap dot
          ctx.fillStyle = rawVal > 200 ? '#fca5a5' : '#a7f3d0';
          ctx.fillRect(x, y - 2, barWidth, 1.5);
        }
      }

      // 2. Draw Smooth Oscilloscope Waveform
      if (visualMode === 'wave' || visualMode === 'dual') {
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = intensity > 75 ? 'rgba(239, 68, 68, 0.7)' : 'rgba(52, 211, 153, 0.8)';
        ctx.strokeStyle = intensity > 75 ? '#f87171' : '#34d399';
        ctx.lineWidth = 2.5;
        ctx.beginPath();

        const sliceWidth = width / timeArray.length;
        let x = 0;

        const centerY = visualMode === 'dual' ? height * 0.35 : height * 0.5;

        for (let i = 0; i < timeArray.length; i++) {
          const v = timeArray[i] / 128.0; // 0.0 to 2.0
          const y = v * (centerY * 0.7) + (centerY * 0.3);

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.stroke();

        // Second subtle harmonic wave behind
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        x = 0;
        for (let i = 0; i < timeArray.length; i++) {
          const v = (255 - timeArray[i]) / 128.0;
          const y = v * (centerY * 0.5) + (centerY * 0.5);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
        ctx.stroke();

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isLive, isMuted, visualMode, intensity]);

  // Decibel representation
  const decibel = isMuted || !isLive ? -60 : Math.round(-48 + (intensity / 100) * 54);

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-2xl space-y-4">
      {/* Top Header info */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isLive && !isMuted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-stone-800 text-stone-400'}`}>
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              REAL-TIME VOICE INTENSITY & SPECTRUM
              {isLive && (
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  48 kHz Active
                </span>
              )}
            </h3>
            <p className="text-xs text-stone-400 font-mono">
              Signal: {isMuted ? 'MUTED' : isLive ? `${intensity}% • ${decibel} dB` : 'OFF-AIR'}
            </p>
          </div>
        </div>

        {/* Visualizer Mode Switcher */}
        <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs">
          <button
            type="button"
            onClick={() => setVisualMode('dual')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              visualMode === 'dual' ? 'bg-emerald-700 text-white font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Dual Mode
          </button>
          <button
            type="button"
            onClick={() => setVisualMode('wave')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              visualMode === 'wave' ? 'bg-emerald-700 text-white font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Oscilloscope
          </button>
          <button
            type="button"
            onClick={() => setVisualMode('spectrum')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              visualMode === 'spectrum' ? 'bg-emerald-700 text-white font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Spectrum RTA
          </button>
        </div>
      </div>

      {/* Main Canvas Visualizer */}
      <div className="relative rounded-xl overflow-hidden border border-stone-800 bg-[#090d16]">
        <canvas
          ref={canvasRef}
          width={800}
          height={180}
          className="w-full h-44 object-cover block"
        />

        {/* Live Peak overlay */}
        <div className="absolute top-3 right-3 flex items-center gap-2 bg-stone-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-stone-800 font-mono text-xs">
          <span className="text-stone-400">PEAK:</span>
          <span
            className={`font-bold ${
              peak > 85 ? 'text-red-400 animate-pulse' : peak > 65 ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {isMuted || !isLive ? '-∞ dB' : `${peak}%`}
          </span>
        </div>
      </div>

      {/* Voice Intensity VU Meter Segment Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[11px] font-mono text-stone-400">
          <span className="flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-stone-300" />
            VOICE INTENSITY (VU METER)
          </span>
          <div className="flex gap-4">
            <span>-48dB</span>
            <span>-24dB</span>
            <span>-12dB</span>
            <span>-6dB</span>
            <span className="text-amber-400">-3dB</span>
            <span className="text-red-400 font-bold">0dB (PEAK)</span>
          </div>
        </div>

        {/* Segmented LED Meter */}
        <div className="grid grid-cols-32 sm:grid-cols-48 gap-1 p-2 bg-stone-950 rounded-xl border border-stone-800">
          {Array.from({ length: 40 }).map((_, idx) => {
            const threshold = (idx / 40) * 100;
            const isActive = isLive && !isMuted && intensity >= threshold;
            const isPeakHold = isLive && !isMuted && Math.abs(peak - threshold) < 3;

            let colorClass = 'bg-stone-800/80';
            if (isActive) {
              if (idx > 34) colorClass = 'bg-red-500 shadow-[0_0_8px_#ef4444]';
              else if (idx > 26) colorClass = 'bg-amber-400 shadow-[0_0_6px_#fbbf24]';
              else colorClass = 'bg-emerald-500 shadow-[0_0_6px_#10b981]';
            } else if (isPeakHold) {
              colorClass = 'bg-white shadow-[0_0_8px_#ffffff]';
            }

            return (
              <div
                key={idx}
                className={`h-4 rounded-xs transition-all duration-75 ${colorClass}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
