import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type AdminGitHubImagePickerProps = {
    title: string;
    helperText: string;
    isExpanded: boolean;
    setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
    search: string;
    setSearch: React.Dispatch<React.SetStateAction<string>>;
    images: any[];
    isLoading: boolean;
    currentImage: string;
    onPick: (url: string) => void;
};

const AdminGitHubImagePicker: React.FC<AdminGitHubImagePickerProps> = ({
    title,
    helperText,
    isExpanded,
    setIsExpanded,
    search,
    setSearch,
    images,
    isLoading,
    currentImage,
    onPick,
}) => {
    return (
        <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] overflow-hidden">
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors group/fold"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-premium-gold/10 border border-premium-gold/20 flex items-center justify-center text-premium-gold">
                        <span className="material-symbols-outlined text-sm">image_search</span>
                    </div>
                    <div className="text-left">
                        <span className="block text-sm font-display font-black text-white uppercase italic">{title}</span>
                        <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                            {isExpanded ? 'Haz clic para plegar' : helperText}
                        </span>
                    </div>
                </div>
                <span className={`material-symbols-outlined text-slate-500 transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}>
                    expand_more
                </span>
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                        className="border-t border-white/5"
                    >
                        <div className="p-6 space-y-6">
                            <div className="flex gap-4">
                                <div className="relative flex-1">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                                        search
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Buscar imagen en el repositorio..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:border-premium-gold/30 outline-none"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black hover:bg-white/10 text-slate-400"
                                >
                                    Limpiar
                                </button>
                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-64 overflow-y-auto custom-scrollbar p-1">
                                {isLoading ? (
                                    Array.from({ length: 10 }).map((_, i) => (
                                        <div key={i} className="aspect-square bg-white/5 animate-pulse rounded-xl border border-white/5"></div>
                                    ))
                                ) : (
                                    images
                                        .filter(img => img.name.toLowerCase().includes(search.toLowerCase()))
                                        .map((img) => {
                                            const isSelected = currentImage === img.download_url;
                                            return (
                                                <button
                                                    key={img.sha}
                                                    type="button"
                                                    onClick={() => onPick(img.download_url)}
                                                    className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${isSelected ? 'border-premium-gold shadow-[0_0_15px_rgba(202,138,4,0.3)]' : 'border-white/10 hover:border-white/30'}`}
                                                >
                                                    <img src={img.download_url} alt={img.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2">
                                                        <span className="text-[7px] text-white font-black uppercase text-center break-all leading-tight">
                                                            {img.name.split('.')[0]}
                                                        </span>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="absolute top-1 right-1 bg-premium-gold text-black rounded-full w-4 h-4 flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-[10px] font-black">check</span>
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminGitHubImagePicker;
