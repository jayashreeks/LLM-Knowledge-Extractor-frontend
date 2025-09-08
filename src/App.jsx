import React, { useState } from 'react';
import './App.css';

function App() {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null); // Use null to distinguish between no results and no search
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    setError(null);
    setAnalysis(null); // Clear main analysis view when searching
    setSearchResults(null); // Clear previous search results

    try {
      const response = await fetch(`http://localhost:8000/search?topic=${searchTerm}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      setError(err.message);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Please enter some text to analyze.');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);
    setSearchResults(null); // Clear search results when submitting new analysis

    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'An unknown error occurred.');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>LLM Knowledge Extractor 🧠</h1>
        <p>Analyze and get structured data from any text.</p>
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by topic..."
          />
          <button type="submit" className="search-button" disabled={searching}>
            {searching ? 'Searching...' : 'Search'}
          </button>
        </form>
      </header>

      <main className="app-main">
        <form className="input-form" onSubmit={handleSubmit}>
          <textarea
            className="text-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your text here..."
            rows="10"
          />
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? (
              <div className="spinner"></div>
            ) : (
              'Analyze Text'
            )}
          </button>
        </form>

        <section className="results-section">
          {loading && <p className="loading-message">Analyzing your text...</p>}
          {searching && <p className="loading-message">Searching for topics...</p>}
          {error && <p className="error-message">Error: {error}</p>}

          {/* Conditionally render based on state */}
          {analysis && !loading && !searching && (
            <div className="results-grid">
              <div className="result-card summary-card">
                <h3>Summary</h3>
                <p>{analysis.summary}</p>
              </div>
              <div className="result-card metadata-card">
                <h3>Metadata</h3>
                <div className="metadata-item">
                  <strong>Title:</strong>
                  <span>{analysis.title || 'N/A'}</span>
                </div>
                <div className="metadata-item">
                  <strong>Sentiment:</strong>
                  <span className={`sentiment-${analysis.sentiment}`}>
                    {analysis.sentiment}
                  </span>
                </div>
                <div className="metadata-item">
                  <strong>Topics:</strong>
                  <div className="tags">
                    {analysis.topics.map((topic, index) => (
                      <span key={index} className="tag">{topic}</span>
                    ))}
                  </div>
                </div>
                <div className="metadata-item">
                  <strong>Keywords:</strong>
                  <div className="tags">
                    {analysis.keywords.map((keyword, index) => (
                      <span key={index} className="tag">{keyword}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {searchResults && !searching && !loading && (
            <div className="search-results-container">
              <h2>Search Results</h2>
              {searchResults.length > 0 ? (
                searchResults.map(result => (
                  <div key={result.id} className="result-card summary-card">
                    <h3>{result.title || 'Untitled'}</h3>
                    <p><strong>Summary:</strong> {result.summary}</p>
                    <p><strong>Topics:</strong> {result.topics.join(', ')}</p>
                    <p><strong>Keywords:</strong> {result.keywords.join(', ')}</p>
                  </div>
                ))
              ) : (
                <p className="no-results-message">No analyses found for this topic.</p>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;