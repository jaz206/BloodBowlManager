import React from 'react';

type AdminGeneralFormProps = {
    heroImage: string;
    teams: any[];
    skills: any[];
    starPlayers: any[];
    inducements: any[];
    setEditingItem: React.Dispatch<React.SetStateAction<any>>;
};

const AdminGeneralForm: React.FC<AdminGeneralFormProps> = ({
    heroImage,
    teams,
    skills,
    starPlayers,
    inducements,
    setEditingItem,
}) => {
    const stats = [
        { label: 'Facciones', val: teams.length, icon: 'groups' },
        { label: 'Habilidades', val: skills.length, icon: 'bolt' },
        { label: 'Star Players', val: starPlayers.length, icon: 'star' },
        { label: 'Incentivos', val: inducements.length, icon: 'payments' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-panel p-8 border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span className="material-symbols-outlined text-8xl">image</span>
                </div>
                <h4 className="text-xl font-display font-black text-white uppercase italic mb-4">Imagen de cabecera</h4>
                <p className="text-sm text-slate-400 mb-6 max-w-sm">
                    Esta es la imagen principal que aparece en el inicio de la aplicación. Usa una URL directa de alta calidad.
                </p>

                <div className="relative mb-6 aspect-video rounded-2xl border border-white/10 bg-black/40 overflow-hidden shadow-2xl">
                    {heroImage ? (
                        <img src={heroImage} alt="Hero" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600 italic text-xs">Sin imagen configurada</div>
                    )}
                </div>

                <button
                    onClick={() => setEditingItem({ type: 'hero', data: { url: heroImage || '' } })}
                    className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-display font-black uppercase tracking-[0.2em] text-[10px] hover:bg-premium-gold hover:text-black hover:border-premium-gold transition-all"
                >
                    Editar imagen hero
                </button>
            </div>

            <div className="glass-panel p-8 border-white/5 flex flex-col justify-between">
                <div>
                    <h4 className="text-xl font-display font-black text-white uppercase italic mb-6">Estadísticas de Nuffle</h4>
                    <div className="grid grid-cols-2 gap-4">
                        {stats.map(stat => (
                            <div key={stat.label} className="bg-black/40 p-4 rounded-xl border border-white/5">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="material-symbols-outlined text-sm text-premium-gold">{stat.icon}</span>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase truncate">{stat.label}</span>
                                </div>
                                <div className="text-2xl font-display font-black text-white italic">{stat.val}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mt-6 pt-6 border-t border-white/5">
                    <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed italic">
                        * Los cambios realizados en el resto de pestañas se guardan directamente en Firestore y se reflejan instantáneamente para todos los usuarios.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminGeneralForm;
