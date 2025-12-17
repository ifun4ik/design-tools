import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import { AsciiSettings, GenerationResult } from './types';
import { generateAsciiSvg } from './utils/asciiGenerator';

// Default initial SVG
const DEFAULT_SVG = `<svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:rgb(255,255,255);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgb(0,0,0);stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="250" cy="250" r="200" fill="url(#grad1)" />
</svg>`;

export default function App() {
  const [settings, setSettings] = useState<AsciiSettings>({
    color: '#7ED957',
    backgroundColor: '#000000',
    fontSize: 15,
    gridSpacing: 8,
    characters: '01$&#@',
    invert: false,
    threshold: 18,
    mapStrategy: 'luminance',
    variableSize: true
  });

  const [svgCode, setSvgCode] = useState<string>(DEFAULT_SVG);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  
  const [generatedResult, setGeneratedResult] = useState<GenerationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const clearUploadedImage = () => {
    setUploadedImage(null);
    setUploadedFileName(null);
  };

  // Main Generation Logic wrapped in Debounce
  const triggerGeneration = useCallback(() => {
    setIsProcessing(true);
    setError(null);

    // If uploaded image exists, use it. Otherwise use svg code.
    const source = uploadedImage || svgCode;
    const isSvgCode = !uploadedImage;

    if (!source) {
      setIsProcessing(false);
      return;
    }

    generateAsciiSvg(source, settings, isSvgCode)
      .then((result) => {
        setGeneratedResult(result);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to generate ASCII. Check your input source.");
      })
      .finally(() => {
        setIsProcessing(false);
      });
  }, [svgCode, uploadedImage, settings]);

  useEffect(() => {
    // Simple debounce to prevent freezing on slider drag
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      triggerGeneration();
    }, 150); // Slightly faster debounce

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [triggerGeneration]);

  const handleDownload = () => {
    if (!generatedResult) return;
    const blob = new Blob([generatedResult.svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ascii-art.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen w-screen bg-[#09090b] text-white overflow-hidden font-sans">
      <Sidebar 
        settings={settings}
        setSettings={setSettings}
        svgCode={svgCode}
        setSvgCode={setSvgCode}
        uploadedFileName={uploadedFileName}
        handleImageUpload={handleImageUpload}
        clearUploadedImage={clearUploadedImage}
        onDownload={handleDownload}
      />

      <main className="flex-1 h-full relative overflow-auto flex items-center justify-center bg-[#000000]">
        
        {/* Subtle grid background */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
             style={{ 
               backgroundImage: 'radial-gradient(#27272a 1px, transparent 1px)', 
               backgroundSize: '24px 24px' 
             }}>
        </div>

        <div className="z-10 relative max-w-[90%] max-h-[90%] overflow-hidden shadow-2xl border border-zinc-800/50 bg-[#09090b]">
           {isProcessing && (
             <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
             </div>
           )}

           {error && (
             <div className="p-8 text-red-500 font-mono text-center bg-zinc-900 border border-red-900/50 rounded-lg">
               {error}
             </div>
           )}

           {!error && generatedResult && (
             <div 
                className="transition-opacity duration-300 ease-in-out"
                dangerouslySetInnerHTML={{ __html: generatedResult.svgContent }} 
             />
           )}
           
           {!error && !generatedResult && !isProcessing && (
             <div className="p-20 text-zinc-600 text-center font-mono text-sm">
               Waiting for input...
             </div>
           )}
        </div>
        
        <div className="absolute bottom-4 right-4 text-[10px] text-zinc-700 font-mono">
           {generatedResult ? `${generatedResult.width}px x ${generatedResult.height}px` : ''}
        </div>
      </main>
    </div>
  );
}
