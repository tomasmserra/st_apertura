import env from '../config/env';

const apiUrl = env.REACT_APP_API_URL;

// Funciones para obtener provincias y localidades
async function getProvincias() {
  const token = localStorage.getItem('token');
  const requestOptions = {
    method: 'GET',
    headers: {
      Accept: '*/*',
      Authorization: `Bearer ${token}`
    }
  };

  const url = `${apiUrl}/api/ambito/provincias`;
  try {
    const response = await fetch(url, requestOptions);
    if (!response.ok) {
      console.error('Error al obtener provincias:', response.status, response.statusText);
      return [];
    }
    const result = await response.json();
    console.log('Provincias obtenidas:', result);
    return Array.isArray(result) ? result : [];
  } catch (err) {
    console.error('Error en getProvincias:', err);
    return [];
  }
}

async function getLocalidades(idProvincia) {
  const token = localStorage.getItem('token');
  const requestOptions = {
    method: 'GET',
    headers: {
      Accept: '*/*',
      Authorization: `Bearer ${token}`
    }
  };

  const url = `${apiUrl}/api/ambito/localidades/${idProvincia}`;
  try {
    const response = await fetch(url, requestOptions);
    if (!response.ok) {
      console.error('Error al obtener localidades:', response.status, response.statusText);
      return [];
    }
    const result = await response.json();
    console.log('Localidades obtenidas para provincia', idProvincia, ':', result);
    return Array.isArray(result) ? result : [];
  } catch (err) {
    console.error('Error en getLocalidades:', err);
    return [];
  }
}

async function getDatosPrincipalesEmpresa(solicitudId) {
  const token = localStorage.getItem('token');
  const requestOptions = {
    method: 'GET',
    headers: {
      Accept: '*/*',
      Authorization: `Bearer ${token}`
    }
  };

  const url = `${apiUrl}/api/empresa-apertura/datos-principales/${solicitudId}`;
  const response = await fetch(url, requestOptions);
  let result = {};
  try {
    result = await response.json();
  } catch (err) {
    result = {};
  }

  result.status = response.status;
  result.ok = response.ok;
  return result;
}

async function saveDatosPrincipalesEmpresa(datos) {
  const token = localStorage.getItem('token');
  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: '*/*',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(datos)
  };

  const url = `${apiUrl}/api/empresa-apertura/datos-principales/${datos.solicitudId}`;
  const response = await fetch(url, requestOptions);
  let result = {};
  try {
    result = await response.json();
  } catch (err) {
    result = {};
  }

  result.status = response.status;
  result.ok = response.ok;
  return result;
}

async function getDomicilioEmpresa(solicitudId) {
  const token = localStorage.getItem('token');
  const requestOptions = {
    method: 'GET',
    headers: {
      Accept: '*/*',
      Authorization: `Bearer ${token}`
    }
  };

  const url = `${apiUrl}/api/empresa-apertura/domicilio/${solicitudId}`;
  const response = await fetch(url, requestOptions);
  let result = {};

  try {
    result = await response.json();
  } catch (err) {
    result = {};
  }

  result.status = response.status;
  result.ok = response.ok;
  return result;
}

async function saveDomicilioEmpresa(datos) {
  const token = localStorage.getItem('token');
  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: '*/*',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(datos)
  };

  const url = `${apiUrl}/api/empresa-apertura/domicilio/${datos.solicitudId}`;
  const response = await fetch(url, requestOptions);
  let result = {};

  try {
    result = await response.json();
  } catch (err) {
    result = {};
  }

  result.status = response.status;
  result.ok = response.ok;
  return result;
}

async function getDatosFiscalesEmpresa(solicitudId) {
  const token = localStorage.getItem('token');
  const requestOptions = {
    method: 'GET',
    headers: {
      Accept: '*/*',
      Authorization: `Bearer ${token}`
    }
  };

  const url = `${apiUrl}/api/empresa-apertura/datos-fiscales/${solicitudId}`;
  const response = await fetch(url, requestOptions);
  let result = {};

  try {
    result = await response.json();
  } catch (err) {
    result = {};
  }

  result.status = response.status;
  result.ok = response.ok;
  return result;
}

async function saveDatosFiscalesEmpresa(datos) {
  const token = localStorage.getItem('token');
  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: '*/*',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(datos)
  };

  const url = `${apiUrl}/api/empresa-apertura/datos-fiscales/${datos.solicitudId}`;
  const response = await fetch(url, requestOptions);
  let result = {};

  try {
    result = await response.json();
  } catch (err) {
    result = {};
  }

  result.status = response.status;
  result.ok = response.ok;
  return result;
}

async function getDatosFiscalesExteriorEmpresa(solicitudId) {
  const token = localStorage.getItem('token');
  const requestOptions = {
    method: 'GET',
    headers: {
      Accept: '*/*',
      Authorization: `Bearer ${token}`
    }
  };

  const url = `${apiUrl}/api/empresa-apertura/datos-fiscales-exterior/${solicitudId}`;
  const response = await fetch(url, requestOptions);
  let result = {};

  try {
    result = await response.json();
  } catch (err) {
    result = {};
  }

  result.status = response.status;
  result.ok = response.ok;
  return result;
}

async function saveDatosFiscalesExteriorEmpresa(datos) {
  const token = localStorage.getItem('token');
  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: '*/*',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(datos)
  };

  const url = `${apiUrl}/api/empresa-apertura/datos-fiscales-exterior/${datos.solicitudId}`;
  const response = await fetch(url, requestOptions);
  let result = {};

  try {
    result = await response.json();
  } catch (err) {
    result = {};
  }

  result.status = response.status;
  result.ok = response.ok;
  return result;
}

async function getDatosOrganizacionEmpresa(solicitudId) {
  const token = localStorage.getItem('token');
  const requestOptions = {
    method: 'GET',
    headers: {
      Accept: '*/*',
      Authorization: `Bearer ${token}`
    }
  };

  const url = `${apiUrl}/api/empresa-apertura/datos-empresa/${solicitudId}`;
  const response = await fetch(url, requestOptions);
  let result = {};

  try {
    result = await response.json();
  } catch (err) {
    result = {};
  }

  result.status = response.status;
  result.ok = response.ok;
  return result;
}

async function saveDatosOrganizacionEmpresa(datos) {
  const token = localStorage.getItem('token');
  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: '*/*',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(datos)
  };

  const url = `${apiUrl}/api/empresa-apertura/datos-empresa/${datos.solicitudId}`;
  const response = await fetch(url, requestOptions);
  let result = {};

  try {
    result = await response.json();
  } catch (err) {
    result = {};
  }

  result.status = response.status;
  result.ok = response.ok;
  return result;
}

async function getDatosRegistroEmpresa(solicitudId) {
  const token = localStorage.getItem('token');
  const requestOptions = {
    method: 'GET',
    headers: {
      Accept: '*/*',
      Authorization: `Bearer ${token}`
    }
  };

  const url = `${apiUrl}/api/empresa-apertura/datos-registro/${solicitudId}`;
  const response = await fetch(url, requestOptions);
  let result = {};

  try {
    result = await response.json();
  } catch (err) {
    result = {};
  }

  result.status = response.status;
  result.ok = response.ok;
  return result;
}

async function saveDatosRegistroEmpresa(datos) {
  const token = localStorage.getItem('token');
  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: '*/*',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(datos)
  };

  const url = `${apiUrl}/api/empresa-apertura/datos-registro/${datos.solicitudId}`;
  const response = await fetch(url, requestOptions);
  let result = {};

  try {
    result = await response.json();
  } catch (err) {
    result = {};
  }

  result.status = response.status;
  result.ok = response.ok;
  return result;
}

async function getCuentasBancariasEmpresa(solicitudId) {
  const token = localStorage.getItem('token');
  const requestOptions = {
    method: 'GET',
    headers: {
      Accept: '*/*',
      Authorization: `Bearer ${token}`
    }
  };

  const url = `${apiUrl}/api/empresa-apertura/cuentas-bancarias/${solicitudId}`;
  const response = await fetch(url, requestOptions);
  let result = {};

  try {
    result = await response.json();
  } catch (err) {
    result = {};
  }

  result.status = response.status;
  result.ok = response.ok;
  return result;
}

async function saveCuentasBancariasEmpresa(datos) {
  const token = localStorage.getItem('token');
  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: '*/*',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(datos)
  };

  const url = `${apiUrl}/api/empresa-apertura/cuentas-bancarias/${datos.solicitudId}`;
  const response = await fetch(url, requestOptions);
  let result = {};

  try {
    result = await response.json();
  } catch (err) {
    result = {};
  }

  result.status = response.status;
  result.ok = response.ok;
  return result;
}

async function getCuentasBancariasExteriorEmpresa(solicitudId) {
  const token = localStorage.getItem('token');
  const requestOptions = {
    method: 'GET',
    headers: {
      Accept: '*/*',
      Authorization: `Bearer ${token}`
    }
  };

  const url = `${apiUrl}/api/empresa-apertura/cuentas-bancarias-exterior/${solicitudId}`;
  const response = await fetch(url, requestOptions);
  let result = {};

  try {
    result = await response.json();
  } catch (err) {
    result = {};
  }

  result.status = response.status;
  result.ok = response.ok;
  return result;
}

async function saveCuentasBancariasExteriorEmpresa(datos) {
  const token = localStorage.getItem('token');
  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: '*/*',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(datos)
  };

  const url = `${apiUrl}/api/empresa-apertura/cuentas-bancarias-exterior/${datos.solicitudId}`;
  const response = await fetch(url, requestOptions);
  let result = {};

  try {
    result = await response.json();
  } catch (err) {
    result = {};
  }

  result.status = response.status;
  result.ok = response.ok;
  return result;
}

async function getDeclaracionesEmpresa(solicitudId) {
  const token = localStorage.getItem('token');
  const requestOptions = {
    method: 'GET',
    headers: {
      Accept: '*/*',
      Authorization: `Bearer ${token}`
    }
  };

  const url = `${apiUrl}/api/empresa-apertura/declaraciones/${solicitudId}`;
  const response = await fetch(url, requestOptions);
  let result = {};

  try {
    result = await response.json();
  } catch (err) {
    result = {};
  }

  result.status = response.status;
  result.ok = response.ok;
  return result;
}

async function saveDeclaracionesEmpresa(datos) {
  const token = localStorage.getItem('token');
  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: '*/*',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(datos)
  };

  const url = `${apiUrl}/api/empresa-apertura/declaraciones/${datos.solicitudId}`;
  const response = await fetch(url, requestOptions);
  let result = {};

  try {
    result = await response.json();
  } catch (err) {
    result = {};
  }

  result.status = response.status;
  result.ok = response.ok;
  return result;
}

async function getPerfilInversorEmpresa(solicitudId) {
  const token = localStorage.getItem('token');
  const requestOptions = {
    method: 'GET',
    headers: {
      Accept: '*/*',
      Authorization: `Bearer ${token}`
    }
  };

  const url = `${apiUrl}/api/empresa-apertura/perfil-inversor/${solicitudId}`;
  const response = await fetch(url, requestOptions);
  let result = {};

  try {
    result = await response.json();
  } catch (err) {
    result = {};
  }

  result.status = response.status;
  result.ok = response.ok;
  return result;
}

async function savePerfilInversorEmpresa(datos) {
  const token = localStorage.getItem('token');
  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: '*/*',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(datos)
  };

  const url = `${apiUrl}/api/empresa-apertura/perfil-inversor/${datos.solicitudId}`;
  const response = await fetch(url, requestOptions);
  let result = {};

  try {
    result = await response.json();
  } catch (err) {
    result = {};
  }

  result.status = response.status;
  result.ok = response.ok;
  return result;
}

async function getDocumentacionRespaldatoriaEmpresa(solicitudId) {
  const token = localStorage.getItem('token');
  const requestOptions = {
    method: 'GET',
    headers: {
      Accept: '*/*',
      Authorization: `Bearer ${token}`
    }
  };

  const url = `${apiUrl}/api/empresa-apertura/documentacion-respaldatoria/${solicitudId}`;
  const response = await fetch(url, requestOptions);
  let result = {};

  try {
    result = await response.json();
  } catch (err) {
    result = {};
  }

  result.status = response.status;
  result.ok = response.ok;
  return result;
}

async function saveDocumentacionRespaldatoriaEmpresa(datos) {
  const token = localStorage.getItem('token');
  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: '*/*',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(datos)
  };

  const url = `${apiUrl}/api/empresa-apertura/documentacion-respaldatoria/${datos.solicitudId}`;
  const response = await fetch(url, requestOptions);
  let result = {};

  try {
    result = await response.json();
  } catch (err) {
    result = {};
  }

  result.status = response.status;
  result.ok = response.ok;
  return result;
}

async function getTerminosCondicionesEmpresa(solicitudId) {
  const token = localStorage.getItem('token');
  const requestOptions = {
    method: 'GET',
    headers: {
      Accept: '*/*',
      Authorization: `Bearer ${token}`
    }
  };

  const url = `${apiUrl}/api/empresa-apertura/terminos-condiciones/${solicitudId}`;
  const response = await fetch(url, requestOptions);
  let result = {};

  try {
    result = await response.json();
  } catch (err) {
    result = {};
  }

  result.status = response.status;
  result.ok = response.ok;
  return result;
}

async function saveTerminosCondicionesEmpresa(datos) {
  const token = localStorage.getItem('token');
  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: '*/*',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(datos)
  };

  const url = `${apiUrl}/api/empresa-apertura/terminos-condiciones/${datos.solicitudId}`;
  const response = await fetch(url, requestOptions);
  let result = {};

  try {
    result = await response.json();
  } catch (err) {
    result = {};
  }

  result.status = response.status;
  result.ok = response.ok;
  return result;
}

async function getAccionistasEmpresa(solicitudId) {
  const token = localStorage.getItem('token');
  const requestOptions = {
    method: 'GET',
    headers: {
      Accept: '*/*',
      Authorization: `Bearer ${token}`
    }
  };

  const url = `${apiUrl}/api/empresa-apertura/accionistas/${solicitudId}`;
  const response = await fetch(url, requestOptions);
  let result = {};

  try {
    result = await response.json();
  } catch (err) {
    result = {};
  }

  result.status = response.status;
  result.ok = response.ok;
  return result;
}

async function saveAccionistaEmpresa(solicitudId, datos) {
  const token = localStorage.getItem('token');
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: '*/*',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(datos)
  };

  const url = `${apiUrl}/api/empresa-apertura/accionistas/${solicitudId}`;
  const response = await fetch(url, requestOptions);
  let result = {};

  try {
    result = await response.json();
  } catch (err) {
    result = {};
  }

  result.status = response.status;
  result.ok = response.ok;
  return result;
}

async function updateAccionistaEmpresa(solicitudId, accionistaId, datos) {
  const token = localStorage.getItem('token');
  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: '*/*',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(datos)
  };

  const url = `${apiUrl}/api/empresa-apertura/accionistas/${solicitudId}/${accionistaId}`;
  const response = await fetch(url, requestOptions);
  let result = {};

  try {
    result = await response.json();
  } catch (err) {
    result = {};
  }

  result.status = response.status;
  result.ok = response.ok;
  return result;
}

async function deleteAccionistaEmpresa(solicitudId, accionistaId) {
  const token = localStorage.getItem('token');
  const requestOptions = {
    method: 'DELETE',
    headers: {
      Accept: '*/*',
      Authorization: `Bearer ${token}`
    }
  };

  const url = `${apiUrl}/api/empresa-apertura/accionistas/${solicitudId}/${accionistaId}`;
  const response = await fetch(url, requestOptions);
  let result = {};

  try {
    result = await response.json();
  } catch (err) {
    result = {};
  }

  result.status = response.status;
  result.ok = response.ok;
  return result;
}

async function getAccionistaPorDocumento(solicitudId, numeroDocumento) {
  const token = localStorage.getItem('token');
  const requestOptions = {
    method: 'GET',
    headers: {
      Accept: '*/*',
      Authorization: `Bearer ${token}`
    }
  };

  const url = `${apiUrl}/api/empresa-apertura/accionistas/${solicitudId}/${numeroDocumento}`;
  const response = await fetch(url, requestOptions);
  let result = null;

  try {
    if (response.ok && response.status === 200) {
      result = await response.json();
      result.status = response.status;
      result.ok = response.ok;
    } else {
      // Si no existe (404) o hay otro error, retornar null
      result = {
        status: response.status,
        ok: false
      };
    }
  } catch (err) {
    console.error('Error al obtener accionista por documento:', err);
    result = {
      status: 500,
      ok: false
    };
  }

  return result;
}

export const empresaService = {
  getDatosPrincipalesEmpresa,
  saveDatosPrincipalesEmpresa,
  getDomicilioEmpresa,
  saveDomicilioEmpresa,
  getDatosFiscalesEmpresa,
  saveDatosFiscalesEmpresa,
  getDatosFiscalesExteriorEmpresa,
  saveDatosFiscalesExteriorEmpresa,
  getDatosOrganizacionEmpresa,
  saveDatosOrganizacionEmpresa,
  getDatosRegistroEmpresa,
  saveDatosRegistroEmpresa,
  getCuentasBancariasEmpresa,
  saveCuentasBancariasEmpresa,
  getCuentasBancariasExteriorEmpresa,
  saveCuentasBancariasExteriorEmpresa,
  getDeclaracionesEmpresa,
  saveDeclaracionesEmpresa,
  getPerfilInversorEmpresa,
  savePerfilInversorEmpresa,
  getDocumentacionRespaldatoriaEmpresa,
  saveDocumentacionRespaldatoriaEmpresa,
  getTerminosCondicionesEmpresa,
  saveTerminosCondicionesEmpresa,
  getAccionistasEmpresa,
  saveAccionistaEmpresa,
  updateAccionistaEmpresa,
  deleteAccionistaEmpresa,
  getProvincias,
  getLocalidades,
  getAccionistaPorDocumento
};

