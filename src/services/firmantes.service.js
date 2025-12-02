import env from '../config/env';

const apiUrl = env.REACT_APP_API_URL;

async function getFirmantes(solicitudId) {
  const token = localStorage.getItem('token');
  const requestOptions = {
    method: 'GET',
    headers: {
      Accept: '*/*',
      Authorization: `Bearer ${token}`
    }
  };

  const url = `${apiUrl}/api/apertura-posterior/firmantes/${solicitudId}`;
  const response = await fetch(url, requestOptions);

  let result;
  try {
    result = await response.json();
  } catch (err) {
    result = [];
  }

  if (typeof result === 'object' && result !== null) {
    result.status = response.status;
    result.ok = response.ok;
  }

  return result;
}

async function createFirmante(solicitudId, datos) {
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

  const url = `${apiUrl}/api/apertura-posterior/firmantes/${solicitudId}`;
  const response = await fetch(url, requestOptions);

  let result = null;
  try {
    result = await response.json();
  } catch (err) {
    result = {};
  }

  if (result && typeof result === 'object') {
    result.status = response.status;
    result.ok = response.ok;
  } else {
    result = {
      status: response.status,
      ok: response.ok
    };
  }

  return result;
}

async function updateFirmante(solicitudId, firmanteId, datos) {
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

  const url = `${apiUrl}/api/apertura-posterior/firmantes/${solicitudId}/${firmanteId}`;
  const response = await fetch(url, requestOptions);

  let result = null;
  try {
    result = await response.json();
  } catch (err) {
    result = {};
  }

  if (result && typeof result === 'object') {
    result.status = response.status;
    result.ok = response.ok;
  } else {
    result = {
      status: response.status,
      ok: response.ok
    };
  }

  return result;
}

async function deleteFirmante(solicitudId, firmanteId) {
  const token = localStorage.getItem('token');
  const requestOptions = {
    method: 'DELETE',
    headers: {
      Accept: '*/*',
      Authorization: `Bearer ${token}`
    }
  };

  const url = `${apiUrl}/api/apertura-posterior/firmantes/${solicitudId}/${firmanteId}`;
  const response = await fetch(url, requestOptions);

  const result = {
    status: response.status,
    ok: response.ok
  };

  try {
    const json = await response.json();
    Object.assign(result, json);
  } catch (err) {
    // puede no haber cuerpo
  }

  return result;
}

export const firmantesService = {
  getFirmantes,
  createFirmante,
  updateFirmante,
  deleteFirmante
};

