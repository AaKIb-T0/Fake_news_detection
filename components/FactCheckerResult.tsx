import React from 'react';
import { FactCheckResult, FactCheckStatus, Source } from '../types';

interface FactCheckerResultProps {
  result: FactCheckResult | null;
}

/**
 * Returns Tailwind CSS classes based on the fact-check status for distinct visual feedback.
 * @param status The FactCheckStatus to evaluate.
 * @returns A string of Tailwind CSS classes.
 */
const getStatusClasses = (status: FactCheckStatus) => {
  switch (status) {
    case FactCheckStatus.REAL:
      return 'bg-green-100 text-green-800 border-green-400';
    case FactCheckStatus.FAKE:
      return 'bg-red-100 text-red-800 border-red-400';
    case FactCheckStatus.UNVERIFIED:
      return 'bg-yellow-100 text-yellow-800 border-yellow-400';
    case FactCheckStatus.ERROR:
      return 'bg-gray-100 text-gray-800 border-gray-400';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const FactCheckerResult: React.FC<FactCheckerResultProps> = ({ result }) => {
  if (!result || result.status === FactCheckStatus.INITIAL) {
    return null;
  }

  const { status, explanation, sources } = result;
  const statusClasses = getStatusClasses(status);

  return (
    <div className="mt-8 pt-6 border-t border-gray-200 space-y-4">
      <div className={`p-4 rounded-md border text-lg font-semibold ${statusClasses}`}>
        <h3 className="inline-block mr-2">Status:</h3>
        <span className="inline-block">{status.toUpperCase()}</span>
      </div>

      <div>
        <h4 className="text-xl font-bold text-gray-800 mb-2">Explanation:</h4>
        <p className="text-gray-700 leading-relaxed">{explanation}</p>
      </div>

      {sources && sources.length > 0 && (
        <div>
          <h4 className="text-xl font-bold text-gray-800 mb-2">Reputable Sources:</h4>
          <ul className="list-disc pl-5 space-y-2 text-blue-600">
            {sources.map((source: Source, index: number) => (
              <li key={index}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline break-all"
                >
                  <span className="font-medium">{source.title || source.url}</span>
                  <span className="ml-1 text-sm text-blue-400">({source.url})</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FactCheckerResult;