import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, Download, Sparkles, Palette, Undo } from 'lucide-react';
import { Button } from '../common/Button';

const PALETTES = [
  { name: 'Warm Gold Sand', stroke: '#D97706', bg: '#FEF3C7' },
  { name: 'Ocean Wave', stroke: '#0284C7', bg: '#E0F2FE' },
  { name: 'Emerald Moss', stroke: '#059669', bg: '#D1FAE5' },
  { name: 'Lavender Night', stroke: '#7C3AED', bg: '#EDE9FE' },
  { name: 'Charcoal Minimal', stroke: '#334155', bg: '#F8FAFC' },
];

export const ZenSandArt: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedPalette, setSelectedPalette] = useState(0);
  const [symmetry, setSymmetry] = useState<number>(6); // 1 = normal, 4 = quad, 6 = hexagonal mandala
  const [lineWidth, setLineWidth] = useState(3);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = PALETTES[selectedPalette].bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    clearCanvas();
  }, [selectedPalette]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDraw = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.beginPath();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.strokeStyle = PALETTES[selectedPalette].stroke;

    if (symmetry === 1) {
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else {
      // Draw radial symmetrical mandala lines
      const angleStep = (Math.PI * 2) / symmetry;
      const relX = x - centerX;
      const relY = y - centerY;
      const dist = Math.sqrt(relX * relX + relY * relY);
      const angle = Math.atan2(relY, relX);

      for (let i = 0; i < symmetry; i++) {
        const curAngle = angle + i * angleStep;
        const drawX = centerX + Math.cos(curAngle) * dist;
        const drawY = centerY + Math.sin(curAngle) * dist;

        ctx.beginPath();
        ctx.arc(drawX, drawY, lineWidth / 2, 0, Math.PI * 2);
        ctx.fillStyle = PALETTES[selectedPalette].stroke;
        ctx.fill();
      }
    }
  };

  return (
    <div className="flex flex-col items-center max-w-md mx-auto">
      <div className="flex items-center justify-between w-full mb-3 px-1">
        <div className="flex items-center space-x-1.5">
          {PALETTES.map((p, idx) => (
            <button
              key={p.name}
              onClick={() => setSelectedPalette(idx)}
              className={`w-6 h-6 rounded-full border-2 transition-transform ${
                selectedPalette === idx ? 'scale-110 border-slate-900 shadow-sm' : 'border-transparent'
              }`}
              style={{ backgroundColor: p.stroke }}
              title={p.name}
            />
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={symmetry}
            onChange={(e) => setSymmetry(Number(e.target.value))}
            className="text-xs bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-slate-700"
          >
            <option value={1}>Freeform</option>
            <option value={4}>4-Way Mandala</option>
            <option value={6}>6-Way Hexagon</option>
            <option value={8}>8-Way Star</option>
            <option value={12}>12-Way Lotus</option>
          </select>
          <Button variant="outline" size="sm" onClick={clearCanvas} className="p-1.5">
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <p className="text-xs text-slate-500 mb-3 text-center">
        Drag on the canvas to rake sand patterns and calming symmetrical mandalas.
      </p>

      {/* Canvas */}
      <div className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-200 w-full max-w-[340px] aspect-square">
        <canvas
          ref={canvasRef}
          width={340}
          height={340}
          onMouseDown={startDraw}
          onMouseUp={stopDraw}
          onMouseMove={draw}
          onTouchStart={startDraw}
          onTouchEnd={stopDraw}
          onTouchMove={draw}
          className="cursor-crosshair w-full h-full touch-none"
        />
      </div>
    </div>
  );
};
