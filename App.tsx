import React, { useState, useCallback } from 'react';
import { factCheckNews } from './services/geminiService';
import { FactCheckResult, FactCheckStatus } from './types';
import FactCheckerForm from './components/FactCheckerForm';
import FactCheckerResult from './components/FactCheckerResult';
import LoadingSpinner from './components/LoadingSpinner';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<FactCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles the submission of the fact-check request.
   * Uses useCallback to memoize the function, preventing unnecessary re-renders.
   */
  const handleFactCheck = useCallback(async (input: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null); // Clear previous results before a new check

    try {
      const factCheckResult = await factCheckNews(input);
      setResult(factCheckResult);
      // If the service returns an ERROR status, set the error message explicitly.
      if (factCheckResult.status === FactCheckStatus.ERROR) {
        setError(factCheckResult.explanation);
      }
    } catch (err) {
      console.error("Failed to perform fact check:", err);
      const errorMessage = `Failed to perform fact check: ${(err as Error).message || 'Unknown error.'}`;
      setError(errorMessage);
      // Ensure result state is updated to reflect the error for display.
      setResult({
        status: FactCheckStatus.ERROR,
        explanation: errorMessage,
        sources: [],
      });
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array means this function is created once on mount.

  return (
    <div className="min-h-screen p-4 flex flex-col justify-center items-center">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-6 md:p-8">
        <FactCheckerForm onSubmit={handleFactCheck} isLoading={isLoading} />

        {isLoading && <LoadingSpinner />}

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded-md">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Display fact-check results only if available */}
        {result && <FactCheckerResult result={result} />}

      </div>
       <footer className="mt-8 text-sm text-gray-500 text-center">
        Powered by Gemini API with Google Search grounding.
      </footer>
    </div>
  );
};

export default App;