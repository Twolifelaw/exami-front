import React from 'react';
import Navbar from '../components/navbar';
import { motion } from 'framer-motion';

const Home = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-primary">
            <Navbar />
            
            <main className="flex-grow flex items-center justify-center py-16 px-4">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="card max-w-3xl w-full mx-auto text-center py-12"
                >
                    <div className="card-header"></div>
                    
                    <div className="mb-8 mt-4">
                        <motion.h1 
                            className="text-4xl md:text-5xl font-bold mb-4"
                            style={{ color: 'var(--color-text-secondary)' }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            Bienvenido a <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">EXAMI</span>
                        </motion.h1>
                        
                        <motion.p 
                            className="text-xl text-gray-600 max-w-2xl mx-auto"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            Tu plataforma para exámenes y aprendizaje en línea.
                        </motion.p>
                    </div>
                    
                    <motion.div
                        className="flex flex-col md:flex-row gap-4 justify-center mt-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <a href="/login" className="btn-primary">Iniciar sesión</a>
                        <button className="px-6 py-3 border-2 border-indigo-500 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-all">
                            Conocer más
                        </button>
                    </motion.div>
                    
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
                        <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-100">
                            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4 mx-auto">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-indigo-800 mb-2">Exámenes Interactivos</h3>
                            <p className="text-gray-600">Crea y realiza evaluaciones con diferentes tipos de preguntas.</p>
                        </div>
                        
                        <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
                            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-4 mx-auto">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-purple-800 mb-2">Resultados al instante</h3>
                            <p className="text-gray-600">Obtén retroalimentación inmediata sobre tu desempeño.</p>
                        </div>
                        
                        <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-100">
                            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4 mx-auto">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-indigo-800 mb-2">Seguimiento de progreso</h3>
                            <p className="text-gray-600">Visualiza tus avances y áreas de mejora con estadísticas detalladas.</p>
                        </div>
                    </div>
                </motion.div>
            </main>
            
            <footer className="bg-white py-4 border-t border-gray-200">
                <div className="container mx-auto text-center text-gray-600 text-sm">
                    &copy; {new Date().getFullYear()} EXAMI. Todos los derechos reservados.
                </div>
            </footer>
        </div>
    );
};

export default Home;