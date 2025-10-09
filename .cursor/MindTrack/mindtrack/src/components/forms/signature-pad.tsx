"use client";

import * as React from "react";

interface SignaturePadProps {
  value?: string | null; // data URL
  onChange: (dataUrl: string | null) => void;
}

export default function SignaturePad({ value, onChange }: SignaturePadProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = React.useState(false);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#111827';
  }, []);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e && e.touches.length > 0) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    } else if ('clientX' in e) {
      return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
    }
    return { x: 0, y: 0 };
  };

  const start = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setDrawing(true);
    const ctx = canvasRef.current!.getContext('2d')!;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const move = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const ctx = canvasRef.current!.getContext('2d')!;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const end = () => {
    setDrawing(false);
    const dataUrl = canvasRef.current!.toDataURL('image/png');
    onChange(dataUrl);
  };

  const clear = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <div className="border rounded">
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          className="w-full h-auto touch-none"
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
        />
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={clear} className="px-3 py-1.5 text-sm bg-gray-100 rounded hover:bg-gray-200">Temizle</button>
        {value && <span className="text-xs text-gray-500">İmza yakalandı</span>}
      </div>
    </div>
  );
}


