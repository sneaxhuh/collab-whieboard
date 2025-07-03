import React from 'react';
import { 
  Pen, 
  Square, 
  Circle, 
  Type, 
  Eraser, 
  Palette, 
  Minus,
  Plus,
  Undo,
  Redo,
  Trash2,
  Download,
  Users,
  Settings,
  MousePointer
} from 'lucide-react';
import { DrawingTool } from '../types/whiteboard';

interface ToolbarProps {
  tool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
  color: string;
  onColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  fillMode: boolean;
  onFillModeChange: (fill: boolean) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onSave: () => void;
  userCount: number;
  canUndo: boolean;
  canRedo: boolean;
}

const colors = [
  '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
  '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB'
];

export const Toolbar: React.FC<ToolbarProps> = ({
  tool,
  onToolChange,
  color,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  fillMode,
  onFillModeChange,
  fontSize,
  onFontSizeChange,
  onUndo,
  onRedo,
  onClear,
  onSave,
  userCount,
  canUndo,
  canRedo,
}) => {
  const tools = [
    { id: 'select' as DrawingTool, icon: MousePointer, label: 'Select' },
    { id: 'pen' as DrawingTool, icon: Pen, label: 'Pen' },
    { id: 'rectangle' as DrawingTool, icon: Square, label: 'Rectangle' },
    { id: 'circle' as DrawingTool, icon: Circle, label: 'Circle' },
    { id: 'text' as DrawingTool, icon: Type, label: 'Text' },
    { id: 'eraser' as DrawingTool, icon: Eraser, label: 'Eraser' },
  ];

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-10">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          {/* Drawing Tools */}
          <div className="flex items-center space-x-2">
            {tools.map((t) => (
              <button
                key={t.id}
                onClick={() => onToolChange(t.id)}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  tool === t.id
                    ? 'bg-blue-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={t.label}
              >
                <t.icon size={20} />
              </button>
            ))}
          </div>

          <div className="w-px h-8 bg-gray-300" />

          {/* Color Picker */}
          <div className="flex items-center space-x-2">
            <Palette size={20} className="text-gray-600" />
            <div className="flex items-center space-x-1">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => onColorChange(c)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    color === c ? 'border-gray-800 scale-110' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="w-px h-8 bg-gray-300" />

          {/* Stroke Width */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onStrokeWidthChange(Math.max(1, strokeWidth - 1))}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <Minus size={16} />
            </button>
            <span className="text-sm font-medium w-6 text-center">{strokeWidth}</span>
            <button
              onClick={() => onStrokeWidthChange(Math.min(20, strokeWidth + 1))}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Fill Mode for Shapes */}
          {(tool === 'rectangle' || tool === 'circle') && (
            <>
              <div className="w-px h-8 bg-gray-300" />
              <button
                onClick={() => onFillModeChange(!fillMode)}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                  fillMode
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Fill
              </button>
            </>
          )}

          {/* Font Size for Text */}
          {tool === 'text' && (
            <>
              <div className="w-px h-8 bg-gray-300" />
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Size:</span>
                <button
                  onClick={() => onFontSizeChange(Math.max(8, fontSize - 2))}
                  className="p-1 rounded bg-gray-100 hover:bg-gray-200"
                >
                  <Minus size={12} />
                </button>
                <span className="text-sm font-medium w-6 text-center">{fontSize}</span>
                <button
                  onClick={() => onFontSizeChange(Math.min(72, fontSize + 2))}
                  className="p-1 rounded bg-gray-100 hover:bg-gray-200"
                >
                  <Plus size={12} />
                </button>
              </div>
            </>
          )}

          <div className="w-px h-8 bg-gray-300" />

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-2 rounded-lg transition-all ${
                canUndo
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
              title="Undo"
            >
              <Undo size={16} />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-2 rounded-lg transition-all ${
                canRedo
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
              title="Redo"
            >
              <Redo size={16} />
            </button>
            <button
              onClick={onClear}
              className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
              title="Clear Canvas"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={onSave}
              className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
              title="Save Canvas"
            >
              <Download size={16} />
            </button>
          </div>

          <div className="w-px h-8 bg-gray-300" />

          {/* User Count */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users size={16} />
            <span>{userCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};