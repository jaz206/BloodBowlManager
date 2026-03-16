/**
 * useMatch — hook facade público del módulo de partido.
 * Re-exporta el hook de contexto para que los componentes
 * no dependan directamente de la ubicación del contexto.
 *
 * Uso:
 *   import { useMatch } from '../hooks/useMatch';
 *   const { logEvent, score, turn } = useMatch();
 */
export { useMatch } from '../context/MatchContext';
