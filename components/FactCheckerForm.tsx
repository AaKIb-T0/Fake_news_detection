import React, { useState } from 'react';

interface FactCheckerFormProps {
  onSubmit: (input: string) => void;
  isLoading: boolean;
}

const FactCheckerForm: React.FC<FactCheckerFormProps> = ({ onSubmit, isLoading }) => {
  const [input, setInput] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSubmit(input);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Real-Time Fact Checker</h2>
      <div>
        <label htmlFor="newsInput" className="block text-gray-700 text-sm font-medium mb-2">
          Enter news headline, article link, or message:
        </label>
        <textarea
          id="newsInput"
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out resize-y min-h-[100px]"
          rows={5}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., 'New study finds chocolate cures all diseases' or 'https://example.com/fake-news-article'"
          disabled={isLoading}
        ></textarea>
      </div>
      <button
        type="submit"
        className={`w-full py-3 px-4 rounded-md text-white font-semibold transition duration-200 ease-in-out
          ${isLoading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75'}`}
        disabled={isLoading}
      >
        {isLoading ? 'Checking...' : 'Fact Check'}
      </button>
    </form>
  );
};

export default FactCheckerForm;