import { BehaviorSubject } from 'rxjs';
import env from '../config/env';

const currentUserSubject = new BehaviorSubject(JSON.parse(localStorage.getItem('currentUser')));

export const authenticationService = {
    login,
    register,
    sendVerificationCode,
    validateCode,
    validarRegistro,
    getSolicitudesUsuario,
    crearSolicitud,
    getDatosPrincipalesIndividuo,
    saveDatosPrincipalesIndividuo,
    getDatosPersonalesIndividuo,
    saveDatosPersonalesIndividuo,
    getDomicilioIndividuo,
    saveDomicilioIndividuo,
    getDatosFiscalesIndividuo,
    saveDatosFiscalesIndividuo,
    getDatosFiscalesExteriorIndividuo,
    saveDatosFiscalesExteriorIndividuo,
    getCuentasBancariasIndividuo,
    saveCuentasBancariasIndividuo,
    getCuentasBancariasExteriorIndividuo,
    saveCuentasBancariasExteriorIndividuo,
    getDeclaracionesIndividuo,
    saveDeclaracionesIndividuo,
    getDeclaracionIngresosIndividuo,
    saveDeclaracionIngresosIndividuo,
    getTerminosCondicionesIndividuo,
    saveTerminosCondicionesIndividuo,
    getPerfilInversorIndividuo,
    savePerfilInversorIndividuo,
    getArchivo,
    logout,
    isSessionExpired,
    checkSessionValidity,
    currentUser: currentUserSubject.asObservable(),
    get currentUserValue () { return currentUserSubject.value }
};

async function validarRegistro (token, email){
    debugger
    let url = `${env.REACT_APP_API_URL}/api/registro/validado?correoElectronico=${email}&token=${token}`
    console.log(url)

    const data = await fetch(url)
    const result = await data.json();
    console.log(result)

    return result

}

async function login(correoElectronico, clave) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correoElectronico, clave })
    };

    let url = `${env.REACT_APP_API_URL}/api/login/cliente`
    console.log(url)

    const data = await fetch(url, requestOptions)
    const result = await data.json();

    return result

}

async function register(correoElectronico, clave){
    
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correoElectronico, clave })
    };
    let url = `${env.REACT_APP_API_URL}/api/registro/inicio`

    const data = await fetch(url, requestOptions)
    const result = await data.json();
    return result
}

async function sendVerificationCode(correoElectronico){
    const requestOptions = {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Accept': '*/*'
        },
        body: JSON.stringify({ email: correoElectronico })
    };
    
    // Usar la URL del API para el servicio de emails
    let url = `${env.REACT_APP_API_URL}/api/auth/enviar-codigo`

    const response = await fetch(url, requestOptions)
    const result = await response.json();
    
    // Agregar información del status HTTP
    result.status = response.status;
    result.ok = response.ok;
    
    return result
}

async function validateCode(correoElectronico, codigo){
    const requestOptions = {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Accept': '*/*'
        },
        body: JSON.stringify({ email: correoElectronico, codigo: codigo })
    };
    
    // Usar la URL del API para el servicio de validación
    let url = `${env.REACT_APP_API_URL}/api/auth/verificar-codigo`

    const response = await fetch(url, requestOptions)
    const result = await response.json();
    
    // Agregar información del status HTTP
    result.status = response.status;
    result.ok = response.ok;
    
    // Si el código es válido, guardar los datos de sesión
    if (result.exitosa === true || result.status === 200 || result.ok === true) {
        // Guardar datos de sesión completos
        const sessionData = {
            token: result.token,
            id: result.id,
            expirationTime: result.expirationTime,
            username: result.username,
            email: result.email,
            nombres: result.nombres,
            apellidos: result.apellidos,
            roles: result.roles
        };
        
        localStorage.setItem('token', result.token);
        localStorage.setItem('currentUser', JSON.stringify(sessionData));
        localStorage.setItem('sessionData', JSON.stringify(sessionData));
        currentUserSubject.next(sessionData);
    }
    
    return result
}

function isSessionExpired() {
    const sessionData = JSON.parse(localStorage.getItem('sessionData'));
    if (!sessionData || !sessionData.expirationTime) {
        return true;
    }
    
    const currentTime = Date.now();
    return currentTime > sessionData.expirationTime;
}

function checkSessionValidity() {
    if (isSessionExpired()) {
        logout();
        return false;
    }
    return true;
}

async function getSolicitudesUsuario(idUsuario) {
    const token = localStorage.getItem('token');
    const requestOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Authorization': `Bearer ${token}`
        }
    };

    const apiUrl = env.REACT_APP_API_URL;
    let url = `${apiUrl}/api/solicitudes/usuario/${idUsuario}`;

    const response = await fetch(url, requestOptions);
    const result = await response.json();

    result.status = response.status;
    result.ok = response.ok;

    return result;
}

async function crearSolicitud(tipo, idUsuarioCargo) {
    const token = localStorage.getItem('token');
    const requestOptions = {
        method: 'POST',
        headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${token}`
        }
    };

    const apiUrl = env.REACT_APP_API_URL;
    let url = `${apiUrl}/api/solicitudes?tipo=${tipo}&idUsuarioCargo=${idUsuarioCargo}`;

    const response = await fetch(url, requestOptions);
    const result = await response.json();

    result.status = response.status;
    result.ok = response.ok;

    return result;
}

async function getDatosPrincipalesIndividuo(solicitudId) {
    const token = localStorage.getItem('token');
    const requestOptions = {
        method: 'GET',
        headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${token}`
        }
    };

    const apiUrl = env.REACT_APP_API_URL;
    let url = `${apiUrl}/api/individuo-apertura/datos-principales/${solicitudId}`;

    const response = await fetch(url, requestOptions);
    const result = await response.json();

    result.status = response.status;
    result.ok = response.ok;

    return result;
}

async function saveDatosPrincipalesIndividuo(datos) {
    const token = localStorage.getItem('token');
    const requestOptions = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datos)
    };

    const apiUrl = env.REACT_APP_API_URL;
    let url = `${apiUrl}/api/individuo-apertura/datos-principales/${datos.solicitudId}`;

    const response = await fetch(url, requestOptions);
    const result = await response.json();

    result.status = response.status;
    result.ok = response.ok;

    return result;
}

async function getDatosPersonalesIndividuo(solicitudId) {
    const token = localStorage.getItem('token');
    const requestOptions = {
        method: 'GET',
        headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${token}`
        }
    };

    const apiUrl = env.REACT_APP_API_URL;
    let url = `${apiUrl}/api/individuo-apertura/datos-personales/${solicitudId}`;

    const response = await fetch(url, requestOptions);
    const result = await response.json();

    result.status = response.status;
    result.ok = response.ok;

    return result;
}

async function saveDatosPersonalesIndividuo(datos) {
    const token = localStorage.getItem('token');
    const requestOptions = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datos)
    };

    const apiUrl = env.REACT_APP_API_URL;
    let url = `${apiUrl}/api/individuo-apertura/datos-personales/${datos.solicitudId}`;

    const response = await fetch(url, requestOptions);
    const result = await response.json();

    result.status = response.status;
    result.ok = response.ok;

    return result;
}

async function getArchivo(archivoId) {
    const token = localStorage.getItem('token');
    const requestOptions = {
        method: 'GET',
        headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${token}`
        }
    };

    const apiUrl = env.REACT_APP_API_URL;
    let url = `${apiUrl}/api/archivos/${archivoId}`;

    const response = await fetch(url, requestOptions);
    
    if (response.ok) {
        const result = await response.json();
        
        // Convertir archivoData (base64) a blob
        const binaryString = atob(result.archivoData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes]);
        const fileUrl = URL.createObjectURL(blob);
        
        return {
            status: response.status,
            ok: response.ok,
            url: fileUrl,
            blob: blob,
            filename: result.nombre
        };
    } else {
        const result = await response.json();
        result.status = response.status;
        result.ok = response.ok;
        return result;
    }
}

async function getDomicilioIndividuo(solicitudId) {
    const token = localStorage.getItem('token');
    const requestOptions = {
        method: 'GET',
        headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${token}`
        }
    };

    const apiUrl = env.REACT_APP_API_URL;
    let url = `${apiUrl}/api/individuo-apertura/domicilio/${solicitudId}`;

    const response = await fetch(url, requestOptions);
    const result = await response.json();

    result.status = response.status;
    result.ok = response.ok;

    return result;
}

async function saveDomicilioIndividuo(datos) {
    const token = localStorage.getItem('token');
    const requestOptions = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datos)
    };

    const apiUrl = env.REACT_APP_API_URL;
    let url = `${apiUrl}/api/individuo-apertura/domicilio/${datos.solicitudId}`;

    const response = await fetch(url, requestOptions);
    const result = await response.json();

    result.status = response.status;
    result.ok = response.ok;

    return result;
}

async function getDatosFiscalesIndividuo(solicitudId) {
    const token = localStorage.getItem('token');
    const requestOptions = {
        method: 'GET',
        headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${token}`
        }
    };

    const apiUrl = env.REACT_APP_API_URL;
    let url = `${apiUrl}/api/individuo-apertura/datos-fiscales/${solicitudId}`;

    const response = await fetch(url, requestOptions);
    const result = await response.json();

    result.status = response.status;
    result.ok = response.ok;

    return result;
}

async function saveDatosFiscalesIndividuo(datos) {
    const token = localStorage.getItem('token');
    const requestOptions = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datos)
    };

    const apiUrl = env.REACT_APP_API_URL;
    let url = `${apiUrl}/api/individuo-apertura/datos-fiscales/${datos.solicitudId}`;

    const response = await fetch(url, requestOptions);
    const result = await response.json();

    result.status = response.status;
    result.ok = response.ok;

    return result;
}

async function getDatosFiscalesExteriorIndividuo(solicitudId) {
    const token = localStorage.getItem('token');
    const requestOptions = {
        method: 'GET',
        headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${token}`
        }
    };

    const apiUrl = env.REACT_APP_API_URL;
    let url = `${apiUrl}/api/individuo-apertura/datos-fiscales-exterior/${solicitudId}`;

    const response = await fetch(url, requestOptions);
    const result = await response.json();

    result.status = response.status;
    result.ok = response.ok;

    return result;
}

async function saveDatosFiscalesExteriorIndividuo(datos) {
    const token = localStorage.getItem('token');
    const requestOptions = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datos)
    };

    const apiUrl = env.REACT_APP_API_URL;
    let url = `${apiUrl}/api/individuo-apertura/datos-fiscales-exterior/${datos.solicitudId}`;

    const response = await fetch(url, requestOptions);
    const result = await response.json();

    result.status = response.status;
    result.ok = response.ok;

    return result;
}

async function getCuentasBancariasIndividuo(solicitudId) {
    const token = localStorage.getItem('token');
    const requestOptions = {
        method: 'GET',
        headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${token}`
        }
    };

    const apiUrl = env.REACT_APP_API_URL;
    let url = `${apiUrl}/api/individuo-apertura/cuentas-bancarias/${solicitudId}`;

    const response = await fetch(url, requestOptions);
    const result = await response.json();

    result.status = response.status;
    result.ok = response.ok;

    return result;
}

async function saveCuentasBancariasIndividuo(datos) {
    const token = localStorage.getItem('token');
    const requestOptions = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datos)
    };

    const apiUrl = env.REACT_APP_API_URL;
    let url = `${apiUrl}/api/individuo-apertura/cuentas-bancarias/${datos.solicitudId}`;

    const response = await fetch(url, requestOptions);
    const result = await response.json();

    result.status = response.status;
    result.ok = response.ok;

    return result;
}

async function getCuentasBancariasExteriorIndividuo(solicitudId) {
    const token = localStorage.getItem('token');
    const requestOptions = {
        method: 'GET',
        headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${token}`
        }
    };

    const apiUrl = env.REACT_APP_API_URL;
    let url = `${apiUrl}/api/individuo-apertura/cuentas-bancarias-exterior/${solicitudId}`;

    const response = await fetch(url, requestOptions);
    const result = await response.json();

    result.status = response.status;
    result.ok = response.ok;

    return result;
}

async function saveCuentasBancariasExteriorIndividuo(datos) {
    const token = localStorage.getItem('token');
    const requestOptions = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datos)
    };

    const apiUrl = env.REACT_APP_API_URL;
    let url = `${apiUrl}/api/individuo-apertura/cuentas-bancarias-exterior/${datos.solicitudId}`;

    const response = await fetch(url, requestOptions);
    const result = await response.json();

    result.status = response.status;
    result.ok = response.ok;

    return result;
}

async function getDeclaracionesIndividuo(solicitudId) {
    const token = localStorage.getItem('token');
    const requestOptions = {
        method: 'GET',
        headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${token}`
        }
    };

    const apiUrl = env.REACT_APP_API_URL;
    let url = `${apiUrl}/api/individuo-apertura/declaraciones/${solicitudId}`;

    const response = await fetch(url, requestOptions);
    const result = await response.json();

    result.status = response.status;
    result.ok = response.ok;

    return result;
}

async function saveDeclaracionesIndividuo(datos) {
    const token = localStorage.getItem('token');
    const requestOptions = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datos)
    };

    const apiUrl = env.REACT_APP_API_URL;
    let url = `${apiUrl}/api/individuo-apertura/declaraciones/${datos.solicitudId}`;

    const response = await fetch(url, requestOptions);
    const result = await response.json();

    result.status = response.status;
    result.ok = response.ok;

    return result;
}

async function getPerfilInversorIndividuo(solicitudId) {
    const token = localStorage.getItem('token');
    const requestOptions = {
        method: 'GET',
        headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${token}`
        }
    };

    const apiUrl = env.REACT_APP_API_URL;
    let url = `${apiUrl}/api/individuo-apertura/perfil-inversor/${solicitudId}`;

    const response = await fetch(url, requestOptions);
    const result = await response.json();

    result.status = response.status;
    result.ok = response.ok;

    return result;
}

async function savePerfilInversorIndividuo(datos) {
    const token = localStorage.getItem('token');
    const requestOptions = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datos)
    };

    const apiUrl = env.REACT_APP_API_URL;
    let url = `${apiUrl}/api/individuo-apertura/perfil-inversor/${datos.solicitudId}`;

    const response = await fetch(url, requestOptions);
    const result = await response.json();

    result.status = response.status;
    result.ok = response.ok;

    return result;
}

async function getDeclaracionIngresosIndividuo(solicitudId) {
    const token = localStorage.getItem('token');
    const requestOptions = {
        method: 'GET',
        headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${token}`
        }
    };

    const apiUrl = env.REACT_APP_API_URL;
    const url = `${apiUrl}/api/individuo-apertura/ddjj-origen-fondos/${solicitudId}`;

    const response = await fetch(url, requestOptions);
    const result = await response.json();

    result.status = response.status;
    result.ok = response.ok;

    return result;
}

async function saveDeclaracionIngresosIndividuo(datos) {
    const token = localStorage.getItem('token');
    const requestOptions = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datos)
    };

    const apiUrl = env.REACT_APP_API_URL;
    const url = `${apiUrl}/api/individuo-apertura/ddjj-origen-fondos/${datos.solicitudId}`;

    const response = await fetch(url, requestOptions);
    const result = await response.json();

    result.status = response.status;
    result.ok = response.ok;

    return result;
}

async function getTerminosCondicionesIndividuo(solicitudId) {
    const token = localStorage.getItem('token');
    const requestOptions = {
        method: 'GET',
        headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${token}`
        }
    };

    const apiUrl = env.REACT_APP_API_URL;
    const url = `${apiUrl}/api/individuo-apertura/terminos-condiciones/${solicitudId}`;

    const response = await fetch(url, requestOptions);
    const result = await response.json();

    result.status = response.status;
    result.ok = response.ok;

    return result;
}

async function saveTerminosCondicionesIndividuo(datos) {
    const token = localStorage.getItem('token');
    const requestOptions = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datos)
    };

    const apiUrl = env.REACT_APP_API_URL;
    const url = `${apiUrl}/api/individuo-apertura/terminos-condiciones/${datos.solicitudId}`;

    const response = await fetch(url, requestOptions);
    const result = await response.json();

    result.status = response.status;
    result.ok = response.ok;

    return result;
}

function logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    localStorage.removeItem('sessionData');
    localStorage.removeItem('token');
    currentUserSubject.next(null);
}
