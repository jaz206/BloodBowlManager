import React, { useRef, useEffect } from 'react';
import { useMatch } from '../context/MatchContext';
import ShieldCheckIcon from '../../../../components/icons/ShieldCheckIcon';
// Html5Qrcode is loaded via CDN in index.html
declare const Html5Qrcode: any;

const SelectionStage: React.FC = () => {
    const { 
        state, 
        actions, 
        managedTeams,
        calculateTeamValue 
    } = useMatch();
    
    const { 
        homeTeam, 
        opponentTeam, 
        matchMode,
        setHomeTeam,
        setOpponentTeam,
        setMatchMode,
        setGameState
    } = state;
    
    const { 
        handleSelectTeamInternal, 
        handleProcessQrCode 
    } = actions;

    const scannerRef = useRef<any>(null);
    const scannerContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        return () => {
            if (scannerRef.current?.isScanning) {
                scannerRef.current.stop().catch(console.error);
            }
        };
    }, []);

    const handleStartScanner = () => {
        if (!scannerContainerRef.current) return;
        scannerRef.current = new Html5Qrcode(scannerContainerRef.current.id);
        scannerRef.current.start(
            { facingMode: "environment" }, 
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText: string) => {
                const success = handleProcessQrCode(decodedText);
                if (success && scannerRef.current?.isScanning) {
                    scannerRef.current.stop().catch(console.error);
                }
            }, 
            () => { }
        ).catch((err: any) => { 
            console.error("Error al iniciar escáner", err); 
            alert(`Error al iniciar cámara: ${err}.`); 
        });
    };

    return (
        <div className="max-w-6xl mx-auto py-10 px-4 animate-fade-in">
            <div className="text-center mb-10">
                <h2 className="text-4xl font-display font-black text-white uppercase italic tracking-tighter mb-2">Preparar <span className="text-premium-gold">Confrontación</span></h2>
                <p className="text-slate-500 text-sm tracking-wide">Forja el duelo definitivo en la arena de Nuffle.</p>
                
                {/* Mode Selector */}
                <div className="flex justify-center mt-6">
                    <div className="bg-black/40 p-1 rounded-2xl border border-white/10 flex gap-2">
                        <button 
                            onClick={() => setMatchMode('competition')}
                            className={`px-6 py-2 rounded-xl font-display font-black text-[10px] uppercase tracking-widest transition-all ${matchMode === 'competition' ? 'bg-premium-gold text-black shadow-lg shadow-premium-gold/20' : 'text-slate-500 hover:text-white'}`}
                        >
                            Competición
                        </button>
                        <button 
                            onClick={() => setMatchMode('friendly')}
                            className={`px-6 py-2 rounded-xl font-display font-black text-[10px] uppercase tracking-widest transition-all ${matchMode === 'friendly' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-slate-500 hover:text-white'}`}
                        >
                            Amistoso
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                {/* Lado Izquierdo: Tu Equipo (Local) */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-sky-400">house</span>
                        </div>
                        <h3 className="text-xl font-display font-black text-white uppercase italic">Tu Escuadra</h3>
                    </div>

                    {homeTeam ? (
                        <div className="glass-panel p-6 border-sky-500/30 bg-sky-500/5 relative group">
                            <button
                                onClick={() => setHomeTeam(null)}
                                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 text-slate-500 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                            <div className="flex items-center gap-6">
                                {homeTeam.crestImage ? (
                                    <img src={homeTeam.crestImage} alt="Escudo" className="w-20 h-20 rounded-2xl object-cover border-2 border-sky-500/30" />
                                ) : (
                                    <div className="w-20 h-20 rounded-2xl bg-black/60 border-2 border-sky-500/30 flex items-center justify-center">
                                        <ShieldCheckIcon className="w-10 h-10 text-sky-500/40" />
                                    </div>
                                )}
                                <div>
                                    <p className="text-2xl font-display font-black text-white uppercase italic leading-tight">{homeTeam.name}</p>
                                    <p className="text-xs font-bold text-sky-400 uppercase tracking-widest">{homeTeam.rosterName}</p>
                                    <div className="mt-2 flex gap-3">
                                        <span className="text-[10px] font-black bg-black/40 px-3 py-1 rounded-full text-slate-400 border border-white/5 uppercase">TV {calculateTeamValue(homeTeam).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {managedTeams.map(team => (
                                <button
                                    key={team.name}
                                    onClick={() => handleSelectTeamInternal(team, 'home')}
                                    className="group w-full flex items-center gap-4 glass-panel p-4 border-white/5 bg-black/20 hover:bg-sky-500/10 hover:border-sky-500/50 transition-all duration-300"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center border border-white/5 overflow-hidden">
                                        {team.crestImage ? <img src={team.crestImage} className="w-full h-full object-cover" /> : <ShieldCheckIcon className="w-6 h-6 text-slate-700" />}
                                    </div>
                                    <div className="flex-grow text-left">
                                        <p className="text-sm font-display font-black text-white uppercase transition-colors">{team.name}</p>
                                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{team.rosterName}</p>
                                    </div>
                                    <span className="material-symbols-outlined text-slate-700 group-hover:text-sky-400">radio_button_unchecked</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Lado Derecho: El Rival (Oponente) */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-red-500">swords</span>
                        </div>
                        <h3 className="text-xl font-display font-black text-white uppercase italic">El Rival</h3>
                    </div>

                    {opponentTeam ? (
                        <div className="glass-panel p-6 border-red-500/30 bg-red-500/5 relative group animate-slide-in-up">
                            <button
                                onClick={() => setOpponentTeam(null)}
                                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 text-slate-500 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                            <div className="flex items-center gap-6">
                                {opponentTeam.crestImage ? (
                                    <img src={opponentTeam.crestImage} alt="Escudo" className="w-20 h-20 rounded-2xl object-cover border-2 border-red-500/30" />
                                ) : (
                                    <div className="w-20 h-20 rounded-2xl bg-black/60 border-2 border-red-500/30 flex items-center justify-center">
                                        <ShieldCheckIcon className="w-10 h-10 text-red-500/40" />
                                    </div>
                                )}
                                <div>
                                    <p className="text-2xl font-display font-black text-white uppercase italic leading-tight">{opponentTeam.name}</p>
                                    <p className="text-xs font-bold text-red-400 uppercase tracking-widest">{opponentTeam.rosterName}</p>
                                    <div className="mt-2 flex gap-3">
                                        <span className="text-[10px] font-black bg-black/40 px-3 py-1 rounded-full text-slate-400 border border-white/5 uppercase">TV {calculateTeamValue(opponentTeam).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={handleStartScanner}
                                    className="flex flex-col items-center justify-center gap-3 p-8 rounded-3xl bg-black/40 border border-white/5 hover:border-premium-gold/50 hover:bg-premium-gold/5 transition-all group"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-premium-gold/10 flex items-center justify-center border border-premium-gold/30 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-3xl text-premium-gold">qr_code_scanner</span>
                                    </div>
                                    <span className="text-[10px] font-display font-black text-white uppercase tracking-widest">Escanear Sello</span>
                                </button>
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-red-500/5 blur-xl group-hover:bg-red-500/10 transition-all"></div>
                                    <div className="relative h-full flex flex-col items-center justify-center gap-3 p-8 rounded-3xl bg-black/40 border border-white/5 hover:border-red-500/50 hover:bg-red-500/5 transition-all">
                                        <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/30 group-hover:rotate-12 transition-transform">
                                            <span className="material-symbols-outlined text-3xl text-red-500">list_alt</span>
                                        </div>
                                        <span className="text-[10px] font-display font-black text-white uppercase tracking-widest">Lista Manual</span>
                                    </div>
                                </div>
                            </div>

                            <div id="qr-reader" ref={scannerContainerRef} className="w-full aspect-square bg-black/60 rounded-3xl border border-white/5 overflow-hidden empty:hidden"></div>

                            <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar pt-4 border-t border-white/5">
                                <p className="text-[9px] font-display font-black text-slate-600 uppercase tracking-widest mb-2">Equipos Disponibles</p>
                                {managedTeams.filter(t => t.name !== homeTeam?.name).map(team => (
                                    <button
                                        key={team.name}
                                        onClick={() => handleSelectTeamInternal(team, 'opponent')}
                                        className="group w-full flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-transparent hover:border-red-500/30 hover:bg-red-500/5 transition-all"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-white/5 overflow-hidden">
                                            {team.crestImage ? <img src={team.crestImage} className="w-full h-full object-cover" /> : <ShieldCheckIcon className="w-5 h-5 text-slate-800" />}
                                        </div>
                                        <div className="flex-grow text-left">
                                            <p className="text-xs font-display font-black text-white uppercase">{team.name}</p>
                                            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{team.rosterName}</p>
                                        </div>
                                        <span className="material-symbols-outlined text-slate-800 group-hover:text-red-500 text-sm">swords</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {homeTeam && opponentTeam && (
                <div className="mt-16 flex flex-col items-center animate-bounce-in">
                    <button
                        onClick={() => setGameState('pre_game')}
                        className="group relative overflow-hidden bg-gradient-to-b from-premium-gold to-yellow-600 text-black font-display font-black py-6 px-20 rounded-[2rem] shadow-[0_30px_60px_rgba(245,159,10,0.3)] hover:scale-105 active:scale-95 transition-all duration-300"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <span className="relative flex items-center justify-center gap-4 tracking-[0.4em] uppercase text-sm">
                            Entrar al Coliseo
                            <span className="material-symbols-outlined font-black">login</span>
                        </span>
                    </button>
                </div>
            )}

            <div className="mt-12 text-center">
                <button onClick={() => setGameState('setup')} className="text-[10px] font-display font-black text-slate-500 hover:text-white uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 mx-auto py-4 px-8 border border-transparent hover:border-white/10 rounded-2xl">
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Cancelar Invocación
                </button>
            </div>
        </div>
    );
};

export default SelectionStage;
