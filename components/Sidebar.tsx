import React from 'react';
import { AsciiSettings } from '../types';
import { Upload, Image as ImageIcon, X, Download } from 'lucide-react';

interface SidebarProps {
  settings: AsciiSettings;
  setSettings: React.Dispatch<React.SetStateAction<AsciiSettings>>;
  svgCode: string;
  setSvgCode: (code: string) => void;
  uploadedFileName: string | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearUploadedImage: () => void;
  onDownload: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  settings,
  setSettings,
  svgCode,
  setSvgCode,
  uploadedFileName,
  handleImageUpload,
  clearUploadedImage,
  onDownload
}) => {
  const handleChange = (key: keyof AsciiSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="w-[340px] h-full bg-[#18181b] flex flex-col border-r border-[#27272a] overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="p-6 border-b border-[#27272a]">
        <div className="flex items-center gap-2 mb-1">
          <div className="bg-green-600/20 p-1.5 rounded">
             <ImageIcon className="text-green-500 w-5 h-5" />
          </div>
          <h1 className="text-white font-bold text-lg">Image to ASCII</h1>
        </div>
        <p className="text-zinc-500 text-xs">Convert SVG, PNG, or JPG to variable-density text.</p>
      </div>

      <div className="p-6 space-y-8">
        
        {/* Source Image Section */}
        <div className="space-y-4">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
            Source Image
          </label>
          
          {/* File Upload Area */}
          <div className="relative group">
            {uploadedFileName ? (
              <div className="w-full h-24 border border-dashed border-green-500/50 bg-green-500/5 rounded-lg flex flex-col items-center justify-center p-4 relative">
                 <button 
                   onClick={clearUploadedImage}
                   className="absolute top-2 right-2 text-zinc-400 hover:text-white"
                 >
                   <X size={14} />
                 </button>
                 <Upload className="text-green-500 mb-2" size={20} />
                 <span className="text-xs text-green-500 text-center break-all line-clamp-2 px-2 font-mono">
                   {uploadedFileName}
                 </span>
              </div>
            ) : (
              <label className="w-full h-24 border border-dashed border-zinc-700 bg-[#09090b] hover:bg-zinc-900 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors">
                <Upload className="text-zinc-500 mb-2" size={20} />
                <span className="text-xs text-zinc-500">Click or Drag Image</span>
                <input 
                  type="file" 
                  accept=".png,.jpg,.jpeg,.svg"
                  className="hidden" 
                  onChange={handleImageUpload}
                />
              </label>
            )}
          </div>

          <div className="flex items-center gap-3">
             <div className="h-px bg-zinc-800 flex-1"></div>
             <span className="text-[10px] text-zinc-600 font-medium">OR PASTE CODE</span>
             <div className="h-px bg-zinc-800 flex-1"></div>
          </div>

          <textarea
            className={`w-full h-24 bg-[#09090b] border border-zinc-700 rounded-lg p-3 text-xs font-mono text-zinc-300 focus:outline-none focus:border-zinc-500 resize-none transition-opacity ${uploadedFileName ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
            placeholder="<svg ...>"
            value={svgCode}
            onChange={(e) => setSvgCode(e.target.value)}
            disabled={!!uploadedFileName}
          />
        </div>

        {/* Map & Invert Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Map Value To</label>
            <select 
              value={settings.mapStrategy}
              onChange={(e) => handleChange('mapStrategy', e.target.value)}
              className="w-full bg-[#09090b] border border-zinc-700 rounded-md py-2 px-3 text-sm text-zinc-200 outline-none focus:border-zinc-500 appearance-none"
            >
              <option value="luminance">Luminance</option>
              <option value="opacity">Opacity</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Invert Value</label>
            <select 
              value={settings.invert ? "yes" : "no"}
              onChange={(e) => handleChange('invert', e.target.value === "yes")}
              className="w-full bg-[#09090b] border border-zinc-700 rounded-md py-2 px-3 text-sm text-zinc-200 outline-none focus:border-zinc-500 appearance-none"
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>
        </div>

        {/* Character Set */}
        <div className="space-y-2">
           <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Character Set</label>
           <input 
              type="text" 
              value={settings.characters}
              onChange={(e) => handleChange('characters', e.target.value)}
              className="w-full bg-[#09090b] border border-zinc-700 rounded-md py-2.5 px-3 text-sm font-mono text-zinc-200 outline-none focus:border-zinc-500 tracking-wider"
            />
        </div>

        {/* Colors */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
             <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Text Color</label>
             <div className="flex items-center bg-[#09090b] border border-zinc-700 rounded-md overflow-hidden">
                <input 
                  type="color" 
                  value={settings.color}
                  onChange={(e) => handleChange('color', e.target.value)}
                  className="w-10 h-10 p-0 border-0 bg-transparent cursor-pointer"
                />
                <input 
                   type="text" 
                   value={settings.color}
                   onChange={(e) => handleChange('color', e.target.value)}
                   className="w-full bg-transparent text-xs font-mono text-zinc-300 px-2 outline-none uppercase"
                />
             </div>
          </div>
          <div className="space-y-2">
             <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Background</label>
             <div className="flex items-center bg-[#09090b] border border-zinc-700 rounded-md overflow-hidden">
                <input 
                  type="color" 
                  value={settings.backgroundColor}
                  onChange={(e) => handleChange('backgroundColor', e.target.value)}
                  className="w-10 h-10 p-0 border-0 bg-transparent cursor-pointer"
                />
                <input 
                   type="text" 
                   value={settings.backgroundColor}
                   onChange={(e) => handleChange('backgroundColor', e.target.value)}
                   className="w-full bg-transparent text-xs font-mono text-zinc-300 px-2 outline-none uppercase"
                />
             </div>
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-6">
          <div className="space-y-3">
             <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-zinc-300">Base Font Size</label>
                <span className="text-xs font-mono text-green-500">{settings.fontSize}px</span>
             </div>
             <input
               type="range"
               min="4"
               max="100"
               value={settings.fontSize}
               onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
               className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-green-500"
             />
          </div>

          <div className="space-y-3">
             <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-zinc-300">Grid Spacing</label>
                <span className="text-xs font-mono text-green-500">{settings.gridSpacing}px</span>
             </div>
             <input
               type="range"
               min="2"
               max="50"
               value={settings.gridSpacing}
               onChange={(e) => handleChange('gridSpacing', parseInt(e.target.value))}
               className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-green-500"
             />
             <p className="text-[10px] text-zinc-600">Lower = higher resolution (more characters).</p>
          </div>

          <div className="space-y-3">
             <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-zinc-300">Cutoff Threshold</label>
                <span className="text-xs font-mono text-green-500">{settings.threshold}</span>
             </div>
             <input
               type="range"
               min="0"
               max="255"
               value={settings.threshold}
               onChange={(e) => handleChange('threshold', parseInt(e.target.value))}
               className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-green-500"
             />
             <p className="text-[10px] text-zinc-600">Minimum value required to draw a character.</p>
          </div>
        </div>

        {/* Toggle */}
        <div className="p-4 bg-[#09090b] rounded-lg border border-zinc-800 flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-300">Variable Size Mode</span>
            <button 
              onClick={() => handleChange('variableSize', !settings.variableSize)}
              className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${settings.variableSize ? 'bg-green-600' : 'bg-zinc-700'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${settings.variableSize ? 'left-7' : 'left-1'}`}></span>
            </button>
        </div>

        {/* Download Button */}
        <button 
          onClick={onDownload}
          className="w-full py-3 bg-[#09090b] hover:bg-zinc-800 border border-zinc-700 text-zinc-100 font-semibold rounded-lg flex items-center justify-center gap-2 transition-all group"
        >
          <Download size={16} className="text-zinc-400 group-hover:text-green-500 transition-colors" /> 
          <span>Download SVG</span>
        </button>

      </div>
    </div>
  );
};

export default Sidebar;
