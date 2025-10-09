import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  // FIX: Using a class property for state initialization to resolve issues with 'this' context.
  state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error: error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white p-8 flex flex-col items-center justify-center">
          <div className="bg-red-900/50 border border-red-700 p-6 rounded-lg max-w-2xl w-full">
            <h1 className="text-2xl font-bold text-red-400 mb-4">¡Vaya! Algo ha salido mal.</h1>
            <p className="text-slate-300 mb-4">La aplicación ha encontrado un error inesperado. Por favor, intenta recargar la página. Si el problema persiste, esta información puede ser útil para depurarlo:</p>
            <details className="bg-slate-800 p-3 rounded-md">
              <summary className="cursor-pointer font-semibold text-amber-400">Detalles del Error</summary>
              <pre className="text-xs text-slate-400 mt-2 whitespace-pre-wrap overflow-auto" style={{ fontFamily: 'monospace' }}>
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
             <button
              onClick={() => window.location.reload()}
              className="mt-6 bg-amber-500 text-slate-900 font-bold py-2 px-6 rounded-md shadow-md hover:bg-amber-400 transition-colors"
            >
              Recargar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;