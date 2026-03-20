import React from 'react';

type AdminSkillsFormProps = {
    editingItem: any;
    setEditingItem: React.Dispatch<React.SetStateAction<any>>;
};

const SKILL_CATEGORIES = ['General', 'Strength', 'Agility', 'Passing', 'Mutation', 'Trait'];

const AdminSkillsForm: React.FC<AdminSkillsFormProps> = ({ editingItem, setEditingItem }) => {
    return (
        <div className="grid grid-cols-1 gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre (ES)</label>
                    <input
                        type="text"
                        value={editingItem.data.name_es || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, name_es: e.target.value } })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-premium-gold/50 outline-none"
                    />
                </div>
                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Name (EN)</label>
                    <input
                        type="text"
                        value={editingItem.data.name_en || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, name_en: e.target.value } })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-premium-gold/50 outline-none"
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Descripcion (ES)</label>
                    <textarea
                        value={editingItem.data.desc_es || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, desc_es: e.target.value } })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-premium-gold/50 outline-none h-40 resize-none text-xs leading-relaxed"
                    />
                </div>
                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Description (EN)</label>
                    <textarea
                        value={editingItem.data.desc_en || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, desc_en: e.target.value } })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-premium-gold/50 outline-none h-40 resize-none text-xs leading-relaxed"
                    />
                </div>
            </div>
            <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Categoria</label>
                <select
                    value={editingItem.data.category || 'General'}
                    onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, category: e.target.value } })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-premium-gold/50 outline-none"
                >
                    {SKILL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
        </div>
    );
};

export default AdminSkillsForm;
