'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { UtensilsCrossed, Plus, X, Heart, Clock, ShoppingCart, Search, Tag, ChevronLeft, ChevronRight } from 'lucide-react';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const CUISINES = ['All', 'Indian', 'Italian', 'American', 'Japanese', 'Mexican', 'Chinese', 'Mediterranean', 'Thai', 'Other'];
const DIET_TAGS = ['Vegetarian', 'Vegan', 'Pescatarian', 'Non-Veg', 'Gluten-Free', 'Keto', 'Dairy-Free'];

export default function MealsPage() {
  const { recipes, mealPlan, groceryLists, updateData } = useApp();
  const [activeTab, setActiveTab] = useState('planner');
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [showRecipeDetail, setShowRecipeDetail] = useState(null);
  const [filterCuisine, setFilterCuisine] = useState('All');
  const [filterTag, setFilterTag] = useState('');
  const [search, setSearch] = useState('');
  const [newRecipe, setNewRecipe] = useState({ name: '', cuisine: 'Other', tags: [], prepTime: '', ingredients: '', instructions: '', isFavorite: false });
  const [assignModal, setAssignModal] = useState(null);

  const filteredRecipes = recipes.filter(r => {
    const matchCuisine = filterCuisine === 'All' || r.cuisine === filterCuisine;
    const matchTag = !filterTag || r.tags.includes(filterTag);
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
    return matchCuisine && matchTag && matchSearch;
  });

  const toggleFavorite = (id) => {
    updateData('recipes', recipes.map(r => r.id === id ? { ...r, isFavorite: !r.isFavorite } : r));
  };

  const addRecipe = () => {
    if (!newRecipe.name.trim()) return;
    const recipe = {
      ...newRecipe,
      ingredients: newRecipe.ingredients.split(',').map(s => s.trim()).filter(Boolean),
      id: Date.now().toString(),
    };
    updateData('recipes', [...recipes, recipe]);
    setNewRecipe({ name: '', cuisine: 'Other', tags: [], prepTime: '', ingredients: '', instructions: '', isFavorite: false });
    setShowAddRecipe(false);
  };

  const removeRecipe = (id) => updateData('recipes', recipes.filter(r => r.id !== id));

  const assignMeal = (recipeId) => {
    if (!assignModal) return;
    const key = `${assignModal.day}-${assignModal.meal}`;
    updateData('mealPlan', { ...mealPlan, [key]: recipeId });
    setAssignModal(null);
  };

  const clearMeal = (day, meal) => {
    const key = `${day}-${meal}`;
    const updated = { ...mealPlan };
    delete updated[key];
    updateData('mealPlan', updated);
  };

  const addIngredientsToGrocery = (recipe) => {
    if (groceryLists.length === 0) return;
    const list = groceryLists[0];
    const newItems = recipe.ingredients.map((ing, i) => ({
      id: `${Date.now()}-${i}`, name: ing, quantity: '', category: 'Other', checked: false, addedBy: 'Meal Plan', notes: `For: ${recipe.name}`
    }));
    updateData('groceryLists', groceryLists.map(l => l.id === list.id ? { ...l, items: [...l.items, ...newItems] } : l));
  };

  const toggleNewTag = (tag) => {
    setNewRecipe(prev => ({ ...prev, tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag] }));
  };

  return (
    <div className="meals-page">
      <div className="page-header">
        <div>
          <h1><UtensilsCrossed size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 12 }} />Meal Planner</h1>
          <p>Plan your weekly meals and manage your recipe collection.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddRecipe(true)}><Plus size={18} /> Add Recipe</button>
      </div>

      <div className="tabs" style={{ marginBottom: 24 }}>
        <button className={`tab ${activeTab === 'planner' ? 'active' : ''}`} onClick={() => setActiveTab('planner')}>Weekly Planner</button>
        <button className={`tab ${activeTab === 'recipes' ? 'active' : ''}`} onClick={() => setActiveTab('recipes')}>Recipe Library</button>
      </div>

      {activeTab === 'planner' && (
        <div className="planner-grid">
          <div className="planner-header">
            <div className="ph-corner" />
            {MEAL_TYPES.map(m => <div key={m} className="ph-meal">{m}</div>)}
          </div>
          {DAYS.map(day => (
            <div key={day} className="planner-row">
              <div className="pr-day">{day.slice(0, 3)}</div>
              {MEAL_TYPES.map(meal => {
                const key = `${day}-${meal}`;
                const recipeId = mealPlan[key];
                const recipe = recipes.find(r => r.id === recipeId);
                return (
                  <div key={meal} className={`pr-cell ${recipe ? 'filled' : ''}`} onClick={() => !recipe && setAssignModal({ day, meal })}>
                    {recipe ? (
                      <div className="cell-recipe">
                        <span className="cr-name">{recipe.name}</span>
                        <span className="cr-cuisine">{recipe.cuisine}</span>
                        <button className="cr-remove" onClick={(e) => { e.stopPropagation(); clearMeal(day, meal); }}>
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <span className="cell-empty"><Plus size={14} /></span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'recipes' && (
        <>
          <div className="recipe-filters">
            <div className="search-box">
              <Search size={16} />
              <input placeholder="Search recipes..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="filter-chips">
              {CUISINES.slice(0, 6).map(c => (
                <button key={c} className={`cat-chip ${filterCuisine === c ? 'active' : ''}`} onClick={() => setFilterCuisine(c)}>{c}</button>
              ))}
            </div>
            <div className="filter-chips">
              {DIET_TAGS.slice(0, 4).map(t => (
                <button key={t} className={`cat-chip ${filterTag === t ? 'active' : ''}`} onClick={() => setFilterTag(filterTag === t ? '' : t)}>{t}</button>
              ))}
            </div>
          </div>

          <div className="recipe-grid">
            {filteredRecipes.map(recipe => (
              <div key={recipe.id} className="recipe-card" onClick={() => setShowRecipeDetail(recipe)}>
                <div className="rc-top">
                  <div className="rc-cuisine">{recipe.cuisine}</div>
                  <button className={`rc-fav ${recipe.isFavorite ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); toggleFavorite(recipe.id); }}>
                    <Heart size={16} fill={recipe.isFavorite ? 'currentColor' : 'none'} />
                  </button>
                </div>
                <h4 className="rc-name">{recipe.name}</h4>
                <div className="rc-meta">
                  <span><Clock size={13} /> {recipe.prepTime}</span>
                  <span>{recipe.ingredients.length} ingredients</span>
                </div>
                <div className="rc-tags">
                  {recipe.tags.map(t => <span key={t} className="tag">{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Assign Meal Modal */}
      {assignModal && (
        <div className="modal-overlay" onClick={() => setAssignModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{assignModal.day} — {assignModal.meal}</h2><button className="btn btn-ghost btn-icon" onClick={() => setAssignModal(null)}><X size={18} /></button></div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-tertiary)', marginBottom: 12 }}>Choose a recipe:</p>
              {recipes.map(r => (
                <button key={r.id} className="assign-recipe-btn" onClick={() => assignMeal(r.id)}>
                  <span>{r.name}</span>
                  <span className="ar-cuisine">{r.cuisine}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recipe Detail Modal */}
      {showRecipeDetail && (
        <div className="modal-overlay" onClick={() => setShowRecipeDetail(null)}>
          <div className="modal-content" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{showRecipeDetail.name}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowRecipeDetail(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                <span className="badge badge-red">{showRecipeDetail.cuisine}</span>
                {showRecipeDetail.tags.map(t => <span key={t} className="tag">{t}</span>)}
                <span className="badge badge-gray"><Clock size={12} /> {showRecipeDetail.prepTime}</span>
              </div>
              <div>
                <h4 style={{ marginBottom: 8 }}>Ingredients</h4>
                <ul style={{ paddingLeft: 20, listStyle: 'disc' }}>
                  {showRecipeDetail.ingredients.map((ing, i) => <li key={i} style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 4 }}>{ing}</li>)}
                </ul>
              </div>
              <div>
                <h4 style={{ marginBottom: 8 }}>Instructions</h4>
                <p style={{ fontSize: '0.875rem' }}>{showRecipeDetail.instructions}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => { addIngredientsToGrocery(showRecipeDetail); setShowRecipeDetail(null); }}>
                <ShoppingCart size={16} /> Add to Grocery List
              </button>
              <button className="btn btn-ghost" style={{ color: 'var(--error)' }} onClick={() => { removeRecipe(showRecipeDetail.id); setShowRecipeDetail(null); }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Recipe Modal */}
      {showAddRecipe && (
        <div className="modal-overlay" onClick={() => setShowAddRecipe(false)}>
          <div className="modal-content" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Add Recipe</h2><button className="btn btn-ghost btn-icon" onClick={() => setShowAddRecipe(false)}><X size={18} /></button></div>
            <div className="modal-body">
              <div className="input-group"><label className="input-label">Recipe Name</label><input className="input" value={newRecipe.name} onChange={e => setNewRecipe({ ...newRecipe, name: e.target.value })} placeholder="e.g. Butter Chicken" /></div>
              <div className="input-group"><label className="input-label">Cuisine</label><select className="select" value={newRecipe.cuisine} onChange={e => setNewRecipe({ ...newRecipe, cuisine: e.target.value })}>{CUISINES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}</select></div>
              <div className="input-group">
                <label className="input-label">Dietary Tags</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {DIET_TAGS.map(t => (
                    <button key={t} type="button" className={`cat-chip ${newRecipe.tags.includes(t) ? 'active' : ''}`} onClick={() => toggleNewTag(t)}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="input-group"><label className="input-label">Prep Time</label><input className="input" value={newRecipe.prepTime} onChange={e => setNewRecipe({ ...newRecipe, prepTime: e.target.value })} placeholder="e.g. 30 min" /></div>
              <div className="input-group"><label className="input-label">Ingredients (comma separated)</label><textarea className="input" value={newRecipe.ingredients} onChange={e => setNewRecipe({ ...newRecipe, ingredients: e.target.value })} placeholder="Chicken, Butter, Tomato Sauce, Cream..." /></div>
              <div className="input-group"><label className="input-label">Instructions</label><textarea className="input" value={newRecipe.instructions} onChange={e => setNewRecipe({ ...newRecipe, instructions: e.target.value })} placeholder="Step by step instructions..." /></div>
            </div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setShowAddRecipe(false)}>Cancel</button><button className="btn btn-primary" onClick={addRecipe}>Save Recipe</button></div>
          </div>
        </div>
      )}

      <style jsx>{`
        .meals-page { max-width: 1100px; animation: fadeIn 0.4s ease; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
        .page-header h1 { font-size: 1.75rem; margin-bottom: 4px; }
        .page-header p { color: var(--text-tertiary); }

        .planner-grid { background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 16px; overflow: hidden; overflow-x: auto; }
        .planner-header { display: grid; grid-template-columns: 70px repeat(4, 1fr); border-bottom: 1px solid var(--border-subtle); }
        .ph-corner { background: var(--bg-tertiary); }
        .ph-meal { padding: 14px 12px; text-align: center; font-size: 0.8125rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; background: var(--bg-tertiary); border-left: 1px solid var(--border-subtle); }
        .planner-row { display: grid; grid-template-columns: 70px repeat(4, 1fr); border-bottom: 1px solid var(--border-subtle); }
        .planner-row:last-child { border-bottom: none; }
        .pr-day { padding: 16px 12px; font-size: 0.8125rem; font-weight: 600; color: var(--text-secondary); display: flex; align-items: center; justify-content: center; background: var(--bg-tertiary); }
        .pr-cell { padding: 8px; border-left: 1px solid var(--border-subtle); min-height: 72px; cursor: pointer; transition: background 0.15s; display: flex; align-items: center; justify-content: center; }
        .pr-cell:hover { background: var(--bg-tertiary); }
        .pr-cell.filled { cursor: default; }
        .cell-empty { color: var(--text-muted); opacity: 0; transition: opacity 0.15s; }
        .pr-cell:hover .cell-empty { opacity: 1; }
        .cell-recipe { position: relative; width: 100%; padding: 8px; background: rgba(220,53,69,0.08); border: 1px solid var(--border-accent); border-radius: 8px; }
        .cr-name { font-size: 0.8125rem; font-weight: 500; display: block; color: var(--text-primary); }
        .cr-cuisine { font-size: 0.6875rem; color: var(--text-tertiary); }
        .cr-remove { position: absolute; top: 4px; right: 4px; width: 18px; height: 18px; border-radius: 50%; background: var(--bg-quaternary); display: flex; align-items: center; justify-content: center; color: var(--text-muted); opacity: 0; transition: opacity 0.15s; cursor: pointer; border: none; }
        .cell-recipe:hover .cr-remove { opacity: 1; }

        .recipe-filters { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
        .search-box { display: flex; align-items: center; gap: 8px; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 8px 14px; max-width: 400px; }
        .search-box input { background: none; border: none; outline: none; color: var(--text-primary); font-size: 0.875rem; width: 100%; }
        .search-box input::placeholder { color: var(--text-muted); }
        .search-box svg { color: var(--text-muted); }
        .filter-chips { display: flex; gap: 6px; flex-wrap: wrap; }
        .cat-chip { padding: 6px 14px; border-radius: 20px; font-size: 0.75rem; font-weight: 500; background: var(--bg-secondary); border: 1px solid var(--border-subtle); color: var(--text-secondary); cursor: pointer; transition: all 0.2s; }
        .cat-chip:hover { border-color: var(--border-default); }
        .cat-chip.active { background: rgba(220,53,69,0.1); border-color: var(--accent-primary); color: var(--accent-secondary); }

        .recipe-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
        .recipe-card { background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 20px; cursor: pointer; transition: all 0.25s; }
        .recipe-card:hover { border-color: var(--border-default); transform: translateY(-2px); box-shadow: var(--shadow-md); }
        .rc-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .rc-cuisine { font-size: 0.75rem; font-weight: 600; color: var(--accent-primary); text-transform: uppercase; letter-spacing: 0.04em; }
        .rc-fav { color: var(--text-muted); transition: color 0.15s; background: none; border: none; cursor: pointer; }
        .rc-fav.active { color: var(--accent-primary); }
        .rc-name { font-size: 1.0625rem; margin-bottom: 8px; }
        .rc-meta { display: flex; gap: 16px; font-size: 0.8125rem; color: var(--text-tertiary); margin-bottom: 12px; }
        .rc-meta span { display: flex; align-items: center; gap: 4px; }
        .rc-tags { display: flex; gap: 6px; flex-wrap: wrap; }

        .assign-recipe-btn { display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 12px 16px; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 10px; cursor: pointer; color: var(--text-primary); font-size: 0.9375rem; transition: all 0.15s; margin-bottom: 8px; }
        .assign-recipe-btn:hover { border-color: var(--accent-primary); background: rgba(220,53,69,0.06); }
        .ar-cuisine { font-size: 0.75rem; color: var(--text-tertiary); }

        @media (max-width: 768px) {
          .page-header { flex-direction: column; gap: 16px; }
          .planner-grid { font-size: 0.75rem; }
          .recipe-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
