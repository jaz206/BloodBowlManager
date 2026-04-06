import React from 'react';

type AdminSkillsFormProps = {
    editingItem: any;
    setEditingItem: React.Dispatch<React.SetStateAction<any>>;
};

const SKILL_CATEGORIES = ['General', 'Strength', 'Agility', 'Passing', 'Mutation', 'Trait'];

const AdminSkillsForm: React.FC<AdminSkillsFormProps> = ({ editingItem, setEditingItem }) => {
    return (
        <div className="grid grid-cols-1 gap-8 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-[#7b6853] uppercase tracking-widest ml-1">Nombre (ES)</label>
                    <input
                        type="text"
                        value={editingItem.data.name_es || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, name_es: e.target.value } })}
                        className="w-full bg-[#fcf6ea] border border-[#d7c39a] rounded-2xl py-4 px-6 text-[#2b1d12] focus:border-premium-gold/50 outline-none"
                    />
                </div>
                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-[#7b6853] uppercase tracking-widest ml-1">Name (EN)</label>
                    <input
                        type="text"
                        value={editingItem.data.name_en || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, name_en: e.target.value } })}
                        className="w-full bg-[#fcf6ea] border border-[#d7c39a] rounded-2xl py-4 px-6 text-[#2b1d12] focus:border-premium-gold/50 outline-none"
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-[#7b6853] uppercase tracking-widest ml-1">Descripción (ES)</label>
                    <textarea
                        value={editingItem.data.desc_es || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, desc_es: e.target.value } })}
                        className="w-full bg-[#fcf6ea] border border-[#d7c39a] rounded-2xl py-4 px-6 text-[#2b1d12] focus:border-premium-gold/50 outline-none h-44 resize-none text-xs leading-relaxed"
                    />
                </div>
                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-[#7b6853] uppercase tracking-widest ml-1">Description (EN)</label>
                    <textarea
                        value={editingItem.data.desc_en || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, desc_en: e.target.value } })}
                        className="w-full bg-[#fcf6ea] border border-[#d7c39a] rounded-2xl py-4 px-6 text-[#2b1d12] focus:border-premium-gold/50 outline-none h-44 resize-none text-xs leading-relaxed"
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6">
                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-[#7b6853] uppercase tracking-widest ml-1">Categoría</label>
                    <select
                        value={editingItem.data.category || 'General'}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, category: e.target.value } })}
                        className="w-full bg-[#fcf6ea] border border-[#d7c39a] rounded-2xl py-4 px-6 text-[#2b1d12] focus:border-premium-gold/50 outline-none"
                    >
                        {SKILL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="rounded-[1.75rem] border border-[#e3cfaa] bg-[#fcf6ea] p-6">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold">Ficha rápida</p>
                    <h4 className="mt-3 text-2xl font-header font-black italic uppercase tracking-tight text-[#2b1d12]">
                        {editingItem.data.name_es || editingItem.data.name_en || 'Nueva habilidad'}
                    </h4>
                    <p className="mt-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a7760]">
                        {editingItem.data.category || 'General'}
                    </p>
                    <p className="mt-4 text-[11px] leading-relaxed text-[#6f5738]">
                        {(editingItem.data.desc_es || editingItem.data.desc_en || 'La descripción aparecerá aquí mientras editas.').slice(0, 220)}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminSkillsForm;
