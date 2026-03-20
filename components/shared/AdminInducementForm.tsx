import React from 'react';

type AdminInducementFormProps = {
    editingItem: any;
    setEditingItem: React.Dispatch<React.SetStateAction<any>>;
};

const AdminInducementForm: React.FC<AdminInducementFormProps> = ({ editingItem, setEditingItem }) => {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre</label>
                    <input
                        type="text"
                        value={editingItem.data.name || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, name: e.target.value } })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-premium-gold/50 outline-none"
                    />
                </div>
                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Costo (GP)</label>
                    <input
                        type="number"
                        value={editingItem.data.cost || 0}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, cost: parseInt(e.target.value) || 0 } })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-premium-gold/50 outline-none"
                    />
                </div>
            </div>
            <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Descripcion</label>
                <textarea
                    value={editingItem.data.description || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, description: e.target.value } })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-premium-gold/50 outline-none h-40 resize-none text-sm leading-relaxed"
                />
            </div>
        </div>
    );
};

export default AdminInducementForm;
