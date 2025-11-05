
import React, { useState, useCallback } from 'react';
import type { GithubUser, GithubRepo } from './types';
import { fetchUser, fetchRepos } from './services/githubService';
import { generateProfileSummary } from './services/geminiService';
import ProfileCard from './components/ProfileCard';
import RepoList from './components/RepoList';
import LanguageChart from './components/LanguageChart';
import AiSummary from './components/AiSummary';

const App: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [user, setUser] = useState<GithubUser | null>(null);
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    if (!username.trim()) {
      setError('Пожалуйста, введите имя пользователя GitHub.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setUser(null);
    setRepos([]);
    setAiSummary('');

    try {
      const fetchedUser = await fetchUser(username);
      setUser(fetchedUser);

      const fetchedRepos = await fetchRepos(username);
      const sortedRepos = fetchedRepos.sort((a, b) => b.stargazers_count - a.stargazers_count);
      setRepos(sortedRepos);

      const summary = await generateProfileSummary(fetchedUser, sortedRepos);
      setAiSummary(summary);

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Произошла неизвестная ошибка.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className="min-h-screen container mx-auto p-4 md:p-8 flex flex-col items-center">
      <header className="w-full max-w-4xl text-center mb-8">
        <h1 className="font-handwriting text-5xl md:text-7xl text-accent mb-2">GitHub Профиль</h1>
        <p className="text-charcoal/80 text-lg">Введите имя пользователя GitHub, чтобы увидеть его профиль в креативном виде.</p>
      </header>

      <form onSubmit={handleSubmit} className="w-full max-w-md flex items-center gap-2 mb-8 bg-card p-2 rounded-full shadow-md">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="например, 'reactjs'"
          className="w-full bg-transparent p-3 text-charcoal placeholder-charcoal/50 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-accent text-white font-bold py-3 px-6 rounded-full hover:bg-accent-hover transition-colors duration-300 disabled:bg-accent/50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : 'Найти'}
        </button>
      </form>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative w-full max-w-4xl text-center" role="alert">{error}</div>}

      {!isLoading && !user && !error && (
        <div className="text-center text-charcoal/60 mt-16 animate-pulse">
            <p className="font-handwriting text-4xl">В ожидании приключений...</p>
        </div>
      )}

      {user && (
        <main className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
          <div className="md:col-span-1 space-y-8">
            <ProfileCard user={user} />
          </div>
          <div className="md:col-span-2 space-y-8">
            <AiSummary summary={aiSummary} />
            <LanguageChart repos={repos} />
            <RepoList repos={repos} />
          </div>
        </main>
      )}
    </div>
  );
};

export default App;
