const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'pages', 'Arena', 'MatchPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add toast state and showToast directly after setGameState('setup');
const stateDeclRegex = /const \[gameState, setGameState\] = useState<GameState>\('setup'\);/;
const toastStateStr = `
    const [gameState, setGameState] = useState<GameState>('setup');
    const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);

    const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
        setToastMessage({ text, type });
        setTimeout(() => setToastMessage(null), 4000);
    };
`;
content = content.replace(stateDeclRegex, toastStateStr);

// Replace generic alerts
content = content.replace(/alert\((['"`][^)]+['"`])\)/g, 'showToast($1, "error")');

// Append the Toast HTML at the very end of the component return, right before the css styles
const toastJSX = `
            {toastMessage && (
                <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[1000] animate-fade-in-fast duration-500">
                    <div className={\`px-8 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-center gap-4 \${
                        toastMessage.type === 'error' ? 'bg-red-950/90 border-red-500/30 text-red-400' :
                        toastMessage.type === 'success' ? 'bg-green-950/90 border-green-500/30 text-green-400' :
                        'bg-zinc-900/90 border-premium-gold/30 text-premium-gold'
                    }\`}>
                        <span className="material-symbols-outlined font-bold">
                            {toastMessage.type === 'error' ? 'error' : toastMessage.type === 'success' ? 'check_circle' : 'info'}
                        </span>
                        <p className="font-bold text-sm max-w-sm text-white">{toastMessage.text}</p>
                    </div>
                </div>
            )}
`;

content = content.replace(/<style>\{`/g, toastJSX + '            <style>{`');

fs.writeFileSync(filePath, content, 'utf8');
console.log('MatchPage updated.');
