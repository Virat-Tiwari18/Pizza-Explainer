import React, { useState, useCallback } from 'react';
import { explainWithPizza, ComicPanelData } from './services/geminiService';
import { PizzaIcon } from './components/PizzaIcon';
import { Loader } from './components/Loader';

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');
  const [comicPanels, setComicPanels] = useState<ComicPanelData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleGenerate = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!topic.trim() || isLoading) return;

    setIsLoading(true);
    setError('');
    setExplanation('');
    setComicPanels([]);

    try {
      const { explanation: resultExplanation, comic: resultComic } = await explainWithPizza(topic);
      setExplanation(resultExplanation);
      setComicPanels(resultComic);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [topic, isLoading]);

  return (
    <div className="bg-[#FFF9F0] min-h-screen text-[#4A2C2A] antialiased">
      <main className="container mx-auto px-4 py-8 sm:py-12 flex flex-col items-center">
        <header className="text-center mb-8">
          <div className="flex justify-center items-center gap-4">
            <PizzaIcon className="h-12 w-12 text-red-500" />
            <h1 className="text-4xl sm:text-5xl font-bold text-[#D94F2B]">
              Pizza Explainer
            </h1>
            <PizzaIcon className="h-12 w-12 text-yellow-500 transform -scale-x-100" />
          </div>
          <p className="mt-4 text-lg text-gray-600">
            Tell me what you want to learn, and I'll serve it up with a pizza analogy and a comic!
          </p>
        </header>

        <div className="w-full max-w-2xl bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-yellow-300/50">
          <form onSubmit={handleGenerate}>
            <label htmlFor="topic-input" className="block text-lg font-semibold mb-2 text-[#A26236]">
              Topic to explain
            </label>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                id="topic-input"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., 'Quantum Computing' or 'How a car engine works'"
                className="flex-grow px-4 py-3 rounded-xl border-2 bg-[#D94F2B] text-white placeholder-white/75 border-[#B84224] focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-shadow duration-200"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !topic.trim()}
                className="px-6 py-3 bg-[#D94F2B] text-white font-bold rounded-xl shadow-md hover:bg-[#B84224] transition-all duration-300 transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? 'Baking...' : 'Explain with Pizza!'}
              </button>
            </div>
          </form>
        </div>

        <div className="w-full max-w-4xl mt-8">
          {isLoading && (
            <div className="flex flex-col items-center justify-center p-8 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-yellow-300/50">
              <Loader />
              <p className="mt-4 text-lg font-medium text-[#A26236]">Preparing your explanation & comic...</p>
            </div>
          )}
          {error && (
            <div className="p-6 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg shadow-md" role="alert">
              <p className="font-bold">Oh no, a kitchen mishap!</p>
              <p>{error}</p>
            </div>
          )}

          {comicPanels.length > 0 && (
             <div className="bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-xl border border-yellow-300/50 animate-fade-in mb-8">
                <h2 className="text-3xl font-bold mb-6 text-center text-[#A26236]">The Pizza Comic!</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {comicPanels.map((panel) => (
                    <div key={panel.panel} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col">
                      <img src={panel.image} alt={panel.description} className="w-full h-auto object-cover aspect-square"/>
                      <div className="p-4 flex-grow flex flex-col justify-between bg-gray-50">
                        <p className="text-gray-800 italic">"{panel.dialogue}"</p>
                        <span className="text-right font-bold text-sm text-gray-400 mt-2">Panel {panel.panel}</span>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          )}

          {explanation && (
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-yellow-300/50 prose prose-lg max-w-none prose-headings:text-[#A26236] prose-strong:text-[#4A2C2A] whitespace-pre-wrap animate-fade-in">
              <h2 className="text-3xl font-bold mb-4">Here's the Pizza Version of "{topic}"</h2>
              <p>{explanation}</p>
            </div>
          )}

          {!isLoading && !error && !explanation && comicPanels.length === 0 && (
            <div className="text-center p-8 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-yellow-300/50">
              <p className="text-xl text-gray-500">Your piping hot explanation will appear here!</p>
            </div>
          )}
        </div>
        
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Powered by Gemini & a love for pizza.</p>
        </footer>
      </main>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;