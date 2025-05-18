import React from "react";
import { Link } from "react-router-dom";

const Header = () => (
    <header className="w-full relative">
        {/* Barra decorativa superior con el gradiente */}
        <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundImage: 'var(--gradient-header)' }}></div>
        
        <div className="flex items-center justify-between px-6 py-4 bg-white shadow-md">
            <Link to="/" className="flex items-center space-x-2">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-lg font-bold">E</span>
                </div>
                <span className="text-2xl font-bold" style={{ color: 'var(--color-text-secondary)' }}>
                    EXAMI
                </span>
            </Link>
            
            <div className="flex items-center space-x-4">
                <Link
                    to="/login"
                    className="btn-primary"
                >
                    Iniciar Sesión
                </Link>
            </div>
        </div>
    </header>
);

export default Header;