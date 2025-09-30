
import React, { useState, useMemo } from 'react';
import { starPlayersData } from '../data/starPlayers';
import type { StarPlayer } from '../types';
import StarPlayerModal from './StarPlayerModal';
import ImageModal from './ImageModal';

const StarPlayerCard: React.FC<{ player: StarPlayer, onCardClick: () => void, onImageClick: (e: React.MouseEvent) => void }> = ({ player, onCardClick, onImageClick }) => (
    <div onClick={onCardClick} className="w-full h-full text-left bg-slate-800 p-4 rounded-lg border border-slate-700 hover:bg-slate-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 flex items-center gap-4 cursor-pointer">
        {player.image && (
            <div className="w-24 h-24 flex-shrink-0" onClick={onImageClick}>
                <img src={player.image} alt={player.name} className="w-full h-full object-contain rounded-md bg-slate-900 transition-transform hover:scale-105" />
            </div>
        )}
        <div className="flex flex-col flex-grow">
            <div className="flex justify-between items-start gap-2">
                <h3 className="text-lg font-semibold text-amber-400">{player.name}</h3>
                <span className="text-sm font-bold text-green-400 flex-shrink-0">{player.cost.toLocaleString()} M.O.</span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-300 mt-2 font-mono">
                <span>MV: {player.stats.MV}</span>
                <span>FU: {player.stats.FU}</span>
                <span>AG: {player.stats.AG}</span>
                <span>PS: {player.stats.PS}</span>
                <span>AR: {player.stats.AR}</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
                {player.skills}
            </p>
        </div>
    </div>
);

const StarPlayers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<StarPlayer | null>(null);
  const [enlargedImage, setEnlargedImage] = useState<{src: string, alt: string} | null>(null);

  const filteredPlayers = useMemo(() => {
    const sortedPlayers = [...starPlayersData].sort((a, b) => a.name.localeCompare(b.name));
    if (!searchTerm) {
      return sortedPlayers;
    }
    return sortedPlayers.filter(player =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.skills.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.playsFor.join(' ').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleImageClick = (e: React.MouseEvent, player: StarPlayer) => {
    e.stopPropagation();
    if (player.image) {
        setEnlargedImage({src: player.image, alt: player.name});
    }
  };

  return (
    <div className="space-y-6">
        <div className="text-center">
            <h2 className="text-2xl font-semibold text-amber-400 mb-2">Jugadores Estrella</h2>
            <p className="text-slate-400 max-w-lg mx-auto">Explora la lista de jugadores legendarios disponibles para contratar.</p>
        </div>
      
        <div className="sticky top-2 z-10">
            <input
                type="text"
                placeholder="Buscar jugador estrella..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border-2 border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:ring-amber-500 focus:border-amber-500 shadow-lg"
                aria-label="Buscar jugador estrella"
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlayers.length > 0 ? (
                filteredPlayers.map(player => 
                    <StarPlayerCard 
                        key={player.name} 
                        player={player} 
                        onCardClick={() => setSelectedPlayer(player)} 
                        onImageClick={(e) => handleImageClick(e, player)} 
                    />
                )
            ) : (
                <p className="text-center text-slate-400 py-8 md:col-span-2 lg:col-span-3">No se encontraron jugadores que coincidan con la búsqueda.</p>
            )}
        </div>

        {selectedPlayer && <StarPlayerModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />}
        {enlargedImage && <ImageModal src={enlargedImage.src} alt={enlargedImage.alt} onClose={() => setEnlargedImage(null)} />}
    </div>
  );
};

export default StarPlayers;