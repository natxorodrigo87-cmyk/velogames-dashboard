
import React from 'react';
import { Category } from '../types';
import { Filter } from 'lucide-react';

interface FiltersProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
}

const Filters: React.FC<FiltersProps> = ({ categories, selectedCategoryId, onSelectCategory }) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest mr-2">
        <Filter className="w-3 h-3" />
        Filtrar
      </div>
      <button
        onClick={() => onSelectCategory(null)}
        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
          selectedCategoryId === null 
            ? 'bg-white text-black border-white shadow-xl shadow-white/5' 
            : 'bg-slate-900/40 text-slate-500 border-white/5 hover:border-white/10'
        }`}
      >
        Todas
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelectCategory(cat.id)}
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
            selectedCategoryId === cat.id 
              ? 'bg-blue-600 text-white border-blue-500 shadow-xl shadow-blue-500/10' 
              : 'bg-slate-900/40 text-slate-500 border-white/5 hover:border-white/10'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
};

export default Filters;
