import React from 'react';

type AdminHeraldoFormProps = {
    editingItem: any;
    setEditingItem: React.Dispatch<React.SetStateAction<any>>;
};

const AdminHeraldoForm: React.FC<AdminHeraldoFormProps> = ({ editingItem, setEditingItem }) => {
    const typeLabel =
        editingItem.data.type === 'starplayer'
            ? 'Jugador estrella'
            : editingItem.data.type === 'team'
                ? 'Equipo / franquicia'
                : 'Regla de juego';

    const titleLabel =
        editingItem.data.type === 'starplayer'
            ? 'Nombre del jugador'
            : editingItem.data.type === 'team'
                ? 'Nombre del equipo'
                : 'Nombre de la regla';

    const tagPlaceholder =
        editingItem.data.type === 'starplayer' ? 'Leyenda' : editingItem.data.type === 'team' ? 'Franquicia' : 'Destacado';

    const categoryPlaceholder =
        editingItem.data.type === 'starplayer'
            ? 'Perfil de jugador'
            : editingItem.data.type === 'team'
                ? 'Crónica del gremio'
                : 'Sección de habilidades';

    const contentLabel =
        editingItem.data.type === 'starplayer'
            ? 'Biografía del jugador'
            : editingItem.data.type === 'team'
                ? 'Últimos resultados / Historia'
                : 'Descripción de la habilidad o noticia';

    const ruleLabel =
        editingItem.data.type === 'starplayer'
            ? 'Precio y reglas especiales'
            : editingItem.data.type === 'team'
                ? 'Estatus (en racha, crisis...)'
                : 'Nota de reglamento S3';

    return (
        <div className="space-y-8">
            <div className="bg-white/5 border border-white/5 rounded-3xl p-6 mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-2xl bg-premium-gold/10">
                        <span className="material-symbols-outlined text-premium-gold">auto_awesome</span>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-tight">Plantilla: {typeLabel}</h4>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">
                            Los campos se adaptarán visualmente en el Heraldo según tu elección.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-premium-gold uppercase tracking-widest ml-1">Tipo de noticia (plantilla)</label>
                    <select
                        value={editingItem.data.type || 'skill'}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, type: e.target.value } })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-premium-gold/50 outline-none"
                    >
                        <option value="starplayer">Jugador estrella (retrato + bio)</option>
                        <option value="team">Equipo / franquicia (escudo + crónica)</option>
                        <option value="skill">Habilidad / regla (solo texto / New Season)</option>
                    </select>
                </div>
                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-premium-gold uppercase tracking-widest ml-1">{titleLabel}</label>
                    <input
                        type="text"
                        value={editingItem.data.title || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, title: e.target.value } })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-premium-gold/50 outline-none uppercase italic font-display font-black"
                        placeholder="Ej: MORG 'N' THORG"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Etiqueta (tag)</label>
                    <input
                        type="text"
                        value={editingItem.data.tag || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, tag: e.target.value } })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-premium-gold/50 outline-none"
                        placeholder={tagPlaceholder}
                    />
                </div>
                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Subtítulo / categoría</label>
                    <input
                        type="text"
                        value={editingItem.data.category || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, category: e.target.value } })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-premium-gold/50 outline-none"
                        placeholder={categoryPlaceholder}
                    />
                </div>
            </div>

            <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{contentLabel}</label>
                <textarea
                    value={editingItem.data.content || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, content: e.target.value } })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-premium-gold/50 outline-none h-32 resize-none text-sm leading-relaxed"
                    placeholder="Escribe la historia aquí..."
                />
            </div>

            <div className="space-y-4">
                <label className="block text-[10px] font-black text-blood uppercase tracking-widest ml-1">{ruleLabel}</label>
                <input
                    type="text"
                    value={editingItem.data.rule || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, rule: e.target.value } })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-premium-gold/50 outline-none text-blood font-bold"
                    placeholder="Ej: 380,000 MO (S3)"
                />
            </div>
        </div>
    );
};

export default AdminHeraldoForm;
