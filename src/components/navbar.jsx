import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    
    // Detectar cuando el usuario hace scroll para añadir sombra y/o efectos adicionales
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };
        
        window.addEventListener('scroll', handleScroll);
        
        // Limpieza del event listener
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'shadow-md' : ''}`}>
            {/* Barra decorativa superior con el gradiente */}
            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundImage: 'var(--gradient-header)' }}></div>
            
            <div className={`flex items-center justify-between px-6 py-4 bg-white ${isScrolled ? 'py-3' : 'py-4'} transition-all duration-300`}>
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
};

export default Header;