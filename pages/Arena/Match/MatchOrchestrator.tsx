import React from 'react';
import { useMatch } from './context/MatchContext';

// Stages
import PreGameStage from './views/PreGameStage';
import MatchInProgress from './views/MatchInProgress';
import PostGameStage from './views/PostGameStage';
import KoRecoveryStage from './views/KoRecoveryStage';
import ReportsStage from './views/ReportsStage';
import SelectionStage from './views/SelectionStage';

// Modals
// rules/
import FoulModal from './components/modals/rules/FoulModal';
import InjuryModal from './components/modals/rules/InjuryModal';
import SppActionModal from './components/modals/rules/SppActionModal';
import ApothecaryModal from './components/modals/rules/ApothecaryModal';
import PrayersModal from './components/modals/rules/PrayersModal';
import TdModal from './components/modals/rules/TdModal';
import TurnoverModal from './components/modals/rules/TurnoverModal';
import WeatherModal from './components/modals/rules/WeatherModal';

// system/
import ConcedeModal from './components/modals/system/ConcedeModal';
import MatchSummaryModal from './components/modals/system/MatchSummaryModal';
import CustomEventModal from './components/modals/system/CustomEventModal';
import SequenceGuideModal from './components/modals/system/SequenceGuideModal';
import SnapshotSelectionModal from './components/modals/system/SnapshotSelectionModal';

// shared/
import PlayerCardModal from './components/modals/shared/PlayerCardModal';
import StarPlayerModal from './components/modals/shared/StarPlayerModal';
import SkillModal from './components/modals/shared/SkillModal';
import MatchFlowStepper from './components/MatchFlowStepper';

const MatchOrchestrator: React.FC = () => {
    const { gameState, matchMode } = useMatch();
    
    console.log("[MatchOrchestrator] Current gameState:", gameState);

    const renderContent = () => {
        switch (gameState) {
            case 'setup':
            case 'selection':
                return <SelectionStage />;
            case 'pre_game':
            case '_pre_game_legacy':
                return <PreGameStage />;
            case 'in_progress':
            case '_in_progress_legacy':
                return <MatchInProgress />;
            case 'post_game':
                return <PostGameStage />;
            case 'ko_recovery':
                return <KoRecoveryStage />;
            case 'reports':
                return <ReportsStage />;
            default:
                return (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-fade-in">
                        <div className="w-24 h-24 bg-premium-gold/10 rounded-full flex items-center justify-center border border-premium-gold/20">
                            <span className="material-symbols-outlined text-premium-gold text-5xl animate-pulse">settings</span>
                        </div>
                        <h2 className="text-3xl font-display font-black text-white italic uppercase tracking-tighter">Inicializando Sistema</h2>
                        <p className="text-slate-500 max-w-md text-center">Nuffle está tirando los dados para determinar el destino de este encuentro. Un momento...</p>
                        <p className="text-[10px] text-blood-red/40 font-mono">Estado detectado: {String(gameState)}</p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-premium-gold selection:text-black">
            {/* Header / Stats Bar (Opacional, usualmente manejado por los views) */}
            <MatchFlowStepper gameState={gameState} matchMode={matchMode} />
            
            <main className="relative z-10">
                {renderContent()}
            </main>

            {/* Global Modals */}
            <PrayersModal />
            <WeatherModal />
            <TdModal />
            <SppActionModal />
            <CustomEventModal />
            <ConcedeModal />
            <MatchSummaryModal />
            <SequenceGuideModal />
            <TurnoverModal />
            <SnapshotSelectionModal />
            <ApothecaryModal />
            <PlayerCardModal />
            <StarPlayerModal />
            <SkillModal />
            <FoulModal />
            <InjuryModal />

            {/* Global Styles */}
            <style>{`
                @keyframes fade-in-slow { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in-slow { animation: fade-in-slow 0.5s ease-out forwards; }
                @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slide-in-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
                .animate-slide-in-up { animation: slide-in-up 0.3s ease-out forwards; }
                
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(245,159,10,0.2); }
            `}</style>
        </div>
    );
};

export default MatchOrchestrator;
