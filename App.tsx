import React, { useState } from 'react';
import type { ReferenceDescription } from './types';
import { analyzeReferenceImage, generateFinalImage } from './services/geminiService';

import ImageUploader from './components/ImageUploader';
import Button from './components/Button';
import Loader from './components/Loader';

type ImageData = {
    base64: string;
    mimeType: string;
};

const SparkleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L9.5 9.5L2 12L9.5 14.5L12 22L14.5 14.5L22 12L14.5 9.5L12 2Z" />
    </svg>
);

const OutputPlaceholderIcon = () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-brand-text-muted opacity-50">
      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);


const App: React.FC = () => {
  const [referenceImage, setReferenceImage] = useState<ImageData | null>(null);
  const [userFaceImage, setUserFaceImage] = useState<ImageData | null>(null);
  const [finalImage, setFinalImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);

  const handleGenerate = async () => {
    if (!referenceImage || !userFaceImage) return;
    setIsLoading(true);
    setError(null);
    setFinalImage(null);
    try {
      const jsonDescription = await analyzeReferenceImage(referenceImage.base64, referenceImage.mimeType);
      const result = await generateFinalImage(userFaceImage.base64, userFaceImage.mimeType, jsonDescription);
      setFinalImage(result);
    } catch (err) {
      setError('Failed to generate the final image. Please try a different image or try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setReferenceImage(null);
    setUserFaceImage(null);
    setFinalImage(null);
    setIsLoading(false);
    setError(null);
    setResetKey(prev => prev + 1);
  };
  
  return (
    <div className="min-h-screen bg-brand-bg text-brand-text p-4 sm:p-8 flex flex-col items-center">
      <header className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500 py-2">
          Cinematic Face Transformer
        </h1>
        <p className="text-brand-text-muted mt-2 max-w-2xl mx-auto">
          Transform your photo into a cinematic masterpiece. Start by uploading a reference style image.
        </p>
      </header>
      
      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
            {/* Stage 1 */}
            <section className="bg-brand-surface p-6 rounded-lg border border-gray-700/50">
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-brand-primary text-white font-bold text-lg">1</div>
                    <h2 className="text-xl font-bold">Reference Understanding</h2>
                </div>
                <ImageUploader 
                    key={`ref-${resetKey}`}
                    id="reference-uploader"
                    title="Upload Reference Image"
                    description="Select a high-quality image for style, lighting, and mood."
                    onImageUpload={(base64, mimeType) => setReferenceImage({base64, mimeType})} 
                />
            </section>
            {/* Stage 2 */}
            <section className="bg-brand-surface p-6 rounded-lg border border-gray-700/50">
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-brand-primary text-white font-bold text-lg">2</div>
                    <h2 className="text-xl font-bold">Personalization</h2>
                </div>
                <ImageUploader 
                    key={`face-${resetKey}`}
                    id="user-face-uploader"
                    title="Upload Your Face"
                    description="Provide a clear, front-facing photo of yourself."
                    onImageUpload={(base64, mimeType) => setUserFaceImage({base64, mimeType})}
                />
            </section>
        </div>

        {/* Stage 3 */}
        <section className="bg-brand-surface p-6 rounded-lg border border-gray-700/50 h-full flex flex-col">
            <div className="flex items-center gap-4 mb-4 flex-shrink-0">
                <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full ${finalImage ? 'bg-brand-primary' : 'bg-gray-600'} text-white font-bold text-lg`}>3</div>
                <h2 className="text-xl font-bold">Final Output</h2>
            </div>
            <div className="flex-grow flex items-center justify-center bg-black/20 rounded-md min-h-[300px]">
                {isLoading ? <Loader className="w-12 h-12"/> : (
                    finalImage ? (
                        <img src={`data:image/png;base64,${finalImage}`} alt="Final cinematic portrait" className="rounded-lg max-h-full max-w-full object-contain" />
                    ) : (
                        <div className="text-center text-brand-text-muted p-4">
                            <OutputPlaceholderIcon />
                            <p className="mt-4 font-semibold">Your cinematic portrait will appear here.</p>
                            <p className="text-sm mt-1">Complete the steps to generate your image.</p>
                        </div>
                    )
                )}
            </div>
        </section>
      </main>

      <footer className="mt-8 flex flex-col items-center gap-4">
        {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-md text-center max-w-xl">{error}</div>}
        {finalImage && !isLoading ? (
            <div className="flex gap-4">
                 <a href={`data:image/png;base64,${finalImage}`} download="cinematic-portrait.png">
                    <Button>Download Image</Button>
                </a>
                <Button onClick={handleStartOver} variant="secondary">Start Over</Button>
            </div>
        ) : (
            <Button
                onClick={handleGenerate} 
                disabled={!referenceImage || !userFaceImage || isLoading} 
                isLoading={isLoading}
                icon={<SparkleIcon />}
                className="bg-slate-800 hover:bg-slate-700 text-white !px-8 !py-4 text-lg rounded-full"
            >
                Generate Image
            </Button>
        )}
      </footer>
    </div>
  );
};

export default App;