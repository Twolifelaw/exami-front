import api from "../services/api";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Constantes para códigos de resultado (alineados con el backend)
const LOGIN_EXITOSO = 1;
const LOGIN_USUARIO_NO_ENCONTRADO = -1;
const LOGIN_CUENTA_INACTIVA = -2;
const LOGIN_CUENTA_BLOQUEADA = -3;
const LOGIN_CONTRASENA_INCORRECTA = -4;
const LOGIN_ERROR_INESPERADO = -99;

// Constante para controlar el modo de depuración - asegurarnos que nunca se muestre en producción
const IS_DEV_MODE = process.env.NODE_ENV === 'development';

export default function Login() {
    const navigate = useNavigate();
    const [intentosFallidos, setIntentosFallidos] = useState(0);
    const [debugInfo, setDebugInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showDebug, setShowDebug] = useState(false);

    // Mostrar información de debug si estamos en modo desarrollo
    useEffect(() => {
        if (debugInfo && debugInfo.codigoResultado === LOGIN_CONTRASENA_INCORRECTA) {
            mostrarAlertaIntentos();
        }
    }, [debugInfo]);

    const mostrarAlertaIntentos = () => {
        // Calcular intentos basados en la información del servidor o del estado local
        // Obtener intentos desde el mensaje del servidor si está disponible
        let intentosRestantes = 0;
        
        // Intentar extraer intentos restantes del mensaje si existe
        if (debugInfo && debugInfo.mensajeResultado) {
            const match = debugInfo.mensajeResultado.match(/Intentos restantes: (\d+)/);
            if (match && match[1]) {
                intentosRestantes = parseInt(match[1]);
            } else {
                // Si no hay información en el mensaje, usar el contador local
                const nuevosIntentos = intentosFallidos + 1;
                intentosRestantes = Math.max(0, 3 - nuevosIntentos);
            }
        } else {
            // Si no hay información del servidor, usar el contador local
            const nuevosIntentos = intentosFallidos + 1;
            intentosRestantes = Math.max(0, 3 - nuevosIntentos);
        }
        
        Swal.fire({
            icon: 'warning',
            title: 'Contraseña incorrecta',
            html: `
                <div class="flex flex-col items-center">
                    <p class="mb-3 text-md">Contraseña no válida</p>
                    <div class="w-full bg-gray-200 rounded-full h-4 mb-2 dark:bg-gray-700">
                        <div class="bg-red-600 h-4 rounded-full" style="width: ${(3-intentosRestantes)/3*100}%"></div>
                    </div>
                    <p class="text-red-500 font-bold text-md">Te quedan ${intentosRestantes} ${intentosRestantes === 1 ? 'intento' : 'intentos'} antes de que tu cuenta sea bloqueada</p>
                </div>
            `,
            confirmButtonColor: '#6366f1',
            background: '#fff',
            showClass: {
                popup: 'animate__animated animate__fadeInDown'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutUp'
            }
        });
    };

    const handleLogin = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        const form = event.target;
        const email = form.email.value;
        const contrasena = form.contrasena.value;

        try {
            const response = await api.post("/auth/login", { email, contrasena });
            
            // Solo guardamos información de depuración en desarrollo
            if (IS_DEV_MODE) {
                setDebugInfo({
                    codigoResultado: response.data.codigoResultado,
                    mensajeResultado: response.data.mensajeResultado,
                    datoExtra: response.data.datoExtra || null
                });
                console.log("Respuesta del servidor:", response.data);
            }

            if (response.data.codigoResultado === LOGIN_EXITOSO) {
                setIntentosFallidos(0);
                Swal.fire({
                    icon: 'success',
                    title: '¡Bienvenido!',
                    text: '¡Inicio de sesión exitoso!',
                    showConfirmButton: false,
                    timer: 1500,
                    background: '#fff',
                    customClass: {
                        popup: 'animated fadeInDown'
                    }
                });
                // Aquí deberíamos guardar el token y redirigir al dashboard
                // Por ejemplo:
                // localStorage.setItem('auth_token', response.data.token);
                // navigate('/dashboard');
            } else {
                // Manejar diferentes códigos de error alineados con el backend
                switch(response.data.codigoResultado) {
                    case LOGIN_USUARIO_NO_ENCONTRADO: 
                        Swal.fire({
                            icon: 'error',
                            title: 'Usuario no encontrado',
                            text: response.data.mensajeResultado || 'El correo electrónico no está registrado en nuestro sistema',
                            confirmButtonColor: '#6366f1',
                            background: '#fff'
                        });
                        break;
                        
                    case LOGIN_CUENTA_INACTIVA: 
                        Swal.fire({
                            icon: 'warning',
                            title: 'Cuenta inactiva',
                            text: response.data.mensajeResultado || 'Tu cuenta se encuentra inactiva. Contacta a soporte para más información',
                            confirmButtonColor: '#6366f1',
                            background: '#fff'
                        });
                        break;
                        
                    case LOGIN_CUENTA_BLOQUEADA: 
                        Swal.fire({
                            icon: 'error',
                            title: 'Cuenta bloqueada',
                            html: `
                                <div class="text-center">
                                    <p class="mb-4">${response.data.mensajeResultado || 'Tu cuenta ha sido bloqueada por seguridad después de múltiples intentos fallidos.'}</p>
                                    <p>Debes esperar 30 minutos o usar la opción de recuperar acceso.</p>
                                </div>
                            `,
                            footer: '<a href="/recuperar-cuenta" class="text-indigo-600 hover:text-indigo-800">¿Necesitas recuperar acceso a tu cuenta?</a>',
                            confirmButtonColor: '#6366f1',
                            background: '#fff',
                            customClass: {
                                container: 'my-swal'
                            }
                        });
                        break;
                        
                    case LOGIN_CONTRASENA_INCORRECTA: 
                        // Incrementar contador de intentos fallidos
                        const nuevosIntentos = intentosFallidos + 1;
                        setIntentosFallidos(nuevosIntentos);
                        
                        // Intentar obtener intentos restantes desde el mensaje del servidor
                        let intentosRestantes = 0;
                        const match = response.data.mensajeResultado ? 
                                     response.data.mensajeResultado.match(/Intentos restantes: (\d+)/) : null;
                                     
                        if (match && match[1]) {
                            intentosRestantes = parseInt(match[1]);
                        } else {
                            // Si no hay información en el mensaje, calculamos nosotros
                            intentosRestantes = Math.max(0, 3 - nuevosIntentos);
                        }
                        
                        if (intentosRestantes > 0) {
                            Swal.fire({
                                icon: 'warning',
                                title: 'Contraseña incorrecta',
                                html: `
                                    <div class="flex flex-col items-center">
                                        <p class="mb-3 text-md">Contraseña no válida</p>
                                        <div class="w-full bg-gray-200 rounded-full h-4 mb-2 dark:bg-gray-700">
                                            <div class="bg-red-600 h-4 rounded-full" style="width: ${(3-intentosRestantes)/3*100}%"></div>
                                        </div>
                                        <p class="text-red-500 font-bold text-md">Te quedan ${intentosRestantes} ${intentosRestantes === 1 ? 'intento' : 'intentos'} antes de que tu cuenta sea bloqueada</p>
                                    </div>
                                `,
                                confirmButtonColor: '#6366f1',
                                background: '#fff',
                                showClass: {
                                    popup: 'animate__animated animate__fadeInDown'
                                },
                                hideClass: {
                                    popup: 'animate__animated animate__fadeOutUp'
                                }
                            });
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: '¡Último intento!',
                                text: 'Contraseña incorrecta. Tu cuenta será bloqueada después de este intento.',
                                confirmButtonColor: '#6366f1',
                                background: '#fff',
                                showClass: {
                                    popup: 'animate__animated animate__shakeX'
                                }
                            });
                        }
                        break;
                        
                    case LOGIN_ERROR_INESPERADO:
                        Swal.fire({
                            icon: 'error',
                            title: 'Error del sistema',
                            text: response.data.mensajeResultado || "Error inesperado al iniciar sesión",
                            confirmButtonColor: '#6366f1',
                            background: '#fff'
                        });
                        break;
                        
                    default:
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: response.data.mensajeResultado || "Error desconocido al iniciar sesión",
                            confirmButtonColor: '#6366f1',
                            background: '#fff'
                        });
                }
            }
        } catch (error) {
            console.error("Error en login:", error);
            
            if (IS_DEV_MODE && error.response) {
                setDebugInfo({
                    error: true,
                    status: error.response.status,
                    data: error.response.data
                });
            }
            
            // Si hay error con código y datos específicos, procesarlo
            if (error.response && error.response.data) {
                const errorData = error.response.data;
                
                // Procesar códigos de resultado específicos
                if (errorData.codigoResultado === LOGIN_CONTRASENA_INCORRECTA) {
                    const nuevosIntentos = intentosFallidos + 1;
                    setIntentosFallidos(nuevosIntentos);
                    mostrarAlertaIntentos();
                } else if (errorData.codigoResultado === LOGIN_CUENTA_BLOQUEADA) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Cuenta bloqueada',
                        html: `
                            <div class="text-center">
                                <p class="mb-4">${errorData.mensajeResultado || 'Tu cuenta ha sido bloqueada por seguridad después de múltiples intentos fallidos.'}</p>
                                <p>Debes esperar 30 minutos o usar la opción de recuperar acceso.</p>
                            </div>
                        `,
                        footer: '<a href="/recuperar-cuenta" class="text-indigo-600 hover:text-indigo-800">¿Necesitas recuperar acceso a tu cuenta?</a>',
                        confirmButtonColor: '#6366f1',
                        background: '#fff'
                    });
                } else {
                    // Error genérico pero con mensaje del servidor
                    Swal.fire({
                        icon: 'error',
                        title: 'Error de autenticación',
                        text: errorData.mensajeResultado || 'Ocurrió un error al intentar iniciar sesión',
                        confirmButtonColor: '#6366f1',
                        background: '#fff'
                    });
                }
            } else {
                // Error genérico de conexión o red
                Swal.fire({
                    icon: 'error',
                    title: 'Error de conexión',
                    text: 'No se pudo conectar al servidor. Verifica tu conexión a internet.',
                    confirmButtonColor: '#6366f1',
                    background: '#fff'
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleRecuperarCuenta = (e) => {
        e.preventDefault();
        navigate("/recuperar-cuenta");
    };

    // Función para activar o desactivar el modo de depuración (solo en desarrollo)
    const toggleDebug = () => {
        if (IS_DEV_MODE) {
            setShowDebug(!showDebug);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 pt-12 relative overflow-hidden"
            >
                {/* Elemento decorativo */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 via-indigo-600 to-blue-500"></div>
                
                {/* Círculos decorativos */}
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-indigo-100 opacity-50"></div>
                <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-purple-100 opacity-50"></div>
                
                {/* Flecha para regresar al home */}
                <button
                    onClick={() => navigate("/")}
                    className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none z-10"
                    aria-label="Regresar al inicio"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        style={{ color: "#6366f1" }}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* Logo o icono */}
                <div className="flex justify-center mb-6">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-center mb-8 text-indigo-800 relative z-10">
                    Iniciar Sesión
                </h1>

                <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-semibold text-indigo-800 mb-1"
                        >
                            Email
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                </svg>
                            </div>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                className="w-full pl-10 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 transition-all"
                                placeholder="ejemplo@correo.com"
                            />
                        </div>
                    </div>
                    <div>
                        <label
                            htmlFor="contrasena"
                            className="block text-sm font-semibold text-indigo-800 mb-1"
                        >
                            Contraseña
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <input
                                type="password"
                                id="contrasena"
                                name="contrasena"
                                required
                                className="w-full pl-10 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 transition-all"
                                placeholder="Tu contraseña"
                            />
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-3 rounded-lg font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Procesando...
                            </span>
                        ) : "Ingresar"}
                    </motion.button>
                </form>
                <div className="mt-6 text-center space-y-2 relative z-10">
                    <a
                        href="#"
                        className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
                    >
                        ¿Olvidaste tu contraseña?
                    </a>
                    <div>
                        <a
                            href="/recuperar-cuenta" 
                            onClick={handleRecuperarCuenta}
                            className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline transition-colors block mt-1"
                        >
                            ¿Cuenta bloqueada? Recuperar acceso
                        </a>
                    </div>
                </div>
                
                {/* Solo en modo desarrollo: botón secreto para activar el debug */}
                {IS_DEV_MODE && (
                    <div 
                        onClick={toggleDebug} 
                        className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-gray-200 cursor-pointer hover:bg-gray-300"
                        title="Toggle Debug Mode"
                    ></div>
                )}
                
                {/* Área de diagnóstico - SOLO visible en modo desarrollo Y cuando se activa explícitamente */}
                {IS_DEV_MODE && showDebug && debugInfo && (
                    <div className="mt-6 p-4 bg-gray-100 rounded-lg text-xs text-left">
                        <div className="flex justify-between items-center">
                            <h4 className="font-bold mb-2">Diagnóstico (Solo DEV)</h4>
                            {debugInfo.codigoResultado === LOGIN_CONTRASENA_INCORRECTA && (
                                <button 
                                    onClick={mostrarAlertaIntentos}
                                    className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700"
                                >
                                    Ver alerta
                                </button>
                            )}
                        </div>
                        <pre className="overflow-auto max-h-40">{JSON.stringify(debugInfo, null, 2)}</pre>
                    </div>
                )}
            </motion.div>
        </div>
    );
} 