import React, { useState } from 'react';
import { getUseFirstSuggestions, getRecipeSuggestions } from '../services/api';

const URGENCY_LABELS = {
  expired: 'Expired',
  critical: 'Use Today',
  high: 'Use Soon',
  medium: 'Use This Week',
  low: 'No Rush',
};

const AIAssistant = () => {
  const [activeTab, setActiveTab] = useState('use-first');
  const [useFirstData, setUseFirstData] = useState(null);
  const [recipesData, setRecipesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchUseFirst = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await getUseFirstSuggestions();
      setUseFirstData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipes = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await getRecipeSuggestions([]);
      setRecipesData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px' }}>
      <div className="page-header">
        <h1 className="page-title">AI Assistant</h1>
        <p className="page-subtitle">
          Smart suggestions based on your current pantry
        </p>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(activeTab === 'use-first' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('use-first')}
        >
          What to Use First
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'recipes' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('recipes')}
        >
          Recipe Ideas
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Use First Tab */}
      {activeTab === 'use-first' && (
        <div>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
            Items ranked by urgency — use these before they expire.
          </p>
          <button
            className="btn btn-primary"
            onClick={fetchUseFirst}
            disabled={loading}
            style={{ marginBottom: '20px' }}
          >
            {loading ? 'Analyzing...' : 'Analyze Pantry'}
          </button>

          {useFirstData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {useFirstData.message && (
                <div className="alert alert-warning">{useFirstData.message}</div>
              )}
              {useFirstData.suggestions?.map((item) => (
                <div key={item.id} className="card" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '15px' }}>{item.name}</div>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        {item.quantity}
                      </div>
                    </div>
                    <span className={`badge badge-${item.urgency}`}>
                      {URGENCY_LABELS[item.urgency]}
                    </span>
                  </div>
                  <p style={{ marginTop: '10px', fontSize: '14px', color: 'var(--color-text-muted)' }}>
                    {item.note}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recipes Tab */}
      {activeTab === 'recipes' && (
        <div>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
            Recipe ideas based on what you currently have in your pantry.
          </p>
          <button
            className="btn btn-primary"
            onClick={fetchRecipes}
            disabled={loading}
            style={{ marginBottom: '20px' }}
          >
            {loading ? 'Finding recipes...' : 'Suggest Recipes'}
          </button>

          {recipesData && (
            <div>
              {recipesData.ingredientsUsed?.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    Based on: {recipesData.ingredientsUsed.join(', ')}
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recipesData.recipes?.map((recipe, idx) => (
                  <div key={idx} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '600' }}>{recipe.name}</h3>
                      {recipe.time !== '-' && (
                        <span
                          style={{
                            fontSize: '12px',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--color-text-muted)',
                            background: 'var(--color-surface-alt)',
                            padding: '3px 8px',
                            borderRadius: '4px',
                          }}
                        >
                          {recipe.time}
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '10px', lineHeight: '1.5' }}>
                      {recipe.instructions}
                    </p>

                    {recipe.matchedIngredients?.length > 0 && (
                      <div style={{ fontSize: '12px', color: 'var(--color-accent)' }}>
                        You have: {recipe.matchedIngredients.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  tabs: {
    display: 'flex',
    gap: '4px',
    marginBottom: '24px',
    background: 'var(--color-surface-alt)',
    borderRadius: 'var(--radius-sm)',
    padding: '4px',
    width: 'fit-content',
    border: '1px solid var(--color-border)',
  },
  tab: {
    padding: '7px 16px',
    borderRadius: '4px',
    border: 'none',
    background: 'none',
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  tabActive: {
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    boxShadow: 'var(--shadow-sm)',
  },
};

export default AIAssistant;
