import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Typography
} from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';
import { authenticationService, empresaService } from '../../../services';

const configs = {
  individuo: {
    get: (solicitudId) => authenticationService.getPerfilInversorIndividuo(solicitudId),
    save: (datos) => authenticationService.savePerfilInversorIndividuo(datos),
    backPath: '/apertura/individuo/declaraciones',
    nextPath: '/apertura/individuo/declaracion-ingresos',
    includeUsuarioId: true
  },
  empresa: {
    get: (solicitudId) => empresaService.getPerfilInversorEmpresa(solicitudId),
    save: (datos) => empresaService.savePerfilInversorEmpresa(datos),
    backPath: '/apertura/empresa/declaraciones',
    nextPath: '/apertura/empresa/documentacion-respaldatoria',
    includeUsuarioId: false
  }
};

const initialState = {
  preguntas: [],
  respuestas: [],
  tipoPerfil: null
};

const PerfilInversorPage = () => {
  const history = useHistory();
  const location = useLocation();
  const variant = location.pathname.includes('/empresa/') ? 'empresa' : 'individuo';
  const config = configs[variant];

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [preguntas, setPreguntas] = useState(initialState.preguntas);
  const [respuestas, setRespuestas] = useState(initialState.respuestas);

  const solicitudId = useMemo(() => localStorage.getItem('currentSolicitudId'), []);

  const cargarPerfil = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      if (!solicitudId) {
        setError('No se encontró una solicitud activa.');
        return;
      }

      const response = await config.get(solicitudId);

      if (response && (response.status === 200 || response.ok)) {
        setPreguntas(response.preguntas || []);
        setRespuestas(response.respuestas || []);
      } else {
        setError('Error al cargar el perfil del inversor.');
      }
    } catch (err) {
      console.error('Error cargando perfil inversor:', err);
      setError('Error al cargar el perfil del inversor.');
    } finally {
      setLoading(false);
    }
  }, [config, solicitudId]);

  useEffect(() => {
    const checkSession = () => {
      const currentUser = authenticationService.currentUserValue;
      if (!currentUser || !authenticationService.checkSessionValidity()) {
        history.push('/tipo-apertura');
        return false;
      }
      return true;
    };

    if (checkSession()) {
      cargarPerfil();
    }
  }, [history, cargarPerfil]);

  const handleRespuestaChange = (preguntaId, opcionId) => {
    setRespuestas((prev) => {
      const restantes = prev.filter((resp) => resp.preguntaId !== preguntaId);
      return [...restantes, { preguntaId, opcionId }];
    });
  };

  const getRespuestaSeleccionada = (preguntaId) => {
    const respuesta = respuestas.find((resp) => resp.preguntaId === preguntaId);
    return respuesta ? respuesta.opcionId.toString() : '';
  };

  const calcularTipoPerfil = () => {
    for (const respuesta of respuestas) {
      const pregunta = preguntas.find((p) => p.id === respuesta.preguntaId);
      if (!pregunta) continue;
      const opcion = pregunta.opciones.find((o) => o.id === respuesta.opcionId);
      if (opcion && opcion.determinante && opcion.tipoPerfil) {
        return opcion.tipoPerfil;
      }
    }

    let puntajeTotal = 0;
    for (const respuesta of respuestas) {
      const pregunta = preguntas.find((p) => p.id === respuesta.preguntaId);
      if (!pregunta) continue;
      const opcion = pregunta.opciones.find((o) => o.id === respuesta.opcionId);
      if (opcion) {
        puntajeTotal += opcion.puntaje;
      }
    }

    if (puntajeTotal >= 1 && puntajeTotal < 37) return 'CONSERVADOR';
    if (puntajeTotal >= 37 && puntajeTotal < 55) return 'MODERADO';
    if (puntajeTotal >= 55 && puntajeTotal < 90) return 'AGRESIVO';
    return null;
  };

  const getTipoPerfilColor = (tipo) => {
    switch (tipo) {
      case 'CONSERVADOR':
        return '#4caf50';
      case 'MODERADO':
        return '#ff9800';
      case 'AGRESIVO':
        return '#f44336';
      default:
        return '#666';
    }
  };

  const getTipoPerfilDescripcion = (tipo) => {
    switch (tipo) {
      case 'CONSERVADOR':
        return 'Perfil Conservador: Prefiere inversiones de bajo riesgo con preservación del capital.';
      case 'MODERADO':
        return 'Perfil Moderado: Balance entre riesgo y rentabilidad, acepta variaciones moderadas.';
      case 'AGRESIVO':
        return 'Perfil Agresivo: Busca altas rentabilidades asumiendo mayores riesgos.';
      default:
        return '';
    }
  };

  const isFormValid = () => {
    const habilitadas = preguntas.filter((pregunta) => pregunta.habilitada);
    return habilitadas.every((pregunta) =>
      respuestas.some((respuesta) => respuesta.preguntaId === pregunta.id)
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!solicitudId) {
      setError('No se encontró una solicitud activa.');
      return;
    }

    if (!isFormValid()) {
      setError('Por favor responda todas las preguntas para continuar.');
      return;
    }

    try {
      setSaving(true);
      const currentUser = authenticationService.currentUserValue;
      const payload = {
        solicitudId: parseInt(solicitudId, 10),
        respuestas,
        tipoPerfil: calcularTipoPerfil()
      };

      if (config.includeUsuarioId) {
        if (!currentUser || !currentUser.id) {
          setError('Error: Usuario no encontrado.');
          setSaving(false);
          return;
        }
        payload.idUsuario = currentUser.id;
      }

      const response = await config.save(payload);

      if (response && (response.status === 200 || response.ok)) {
        history.push(config.nextPath);
      } else {
        setError('Error al guardar el perfil del inversor. Intente nuevamente.');
      }
    } catch (err) {
      console.error('Error guardando perfil inversor:', err);
      setError('Error de conexión al guardar el perfil del inversor. Intente nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleVolver = () => {
    history.push(config.backPath);
  };

  if (loading && preguntas.length === 0) {
    return (
      <Container maxWidth="md" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  const tipoPerfilCalculado = isFormValid() ? calcularTipoPerfil() : null;

  return (
    <Container maxWidth="md" style={{ marginTop: '2rem', paddingBottom: '4rem' }}>
      <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          style={{ color: 'var(--light-blue)', fontWeight: 'bold', marginBottom: '1rem' }}
        >
          Perfil del Inversor
        </Typography>

        {error && (
          <Card
            style={{
              width: '100%',
              maxWidth: '800px',
              marginBottom: '1rem',
              backgroundColor: '#ffebee',
              border: '1px solid #f44336'
            }}
          >
            <CardContent>
              <Typography variant="body2" style={{ color: '#d32f2f' }}>
                {error}
              </Typography>
            </CardContent>
          </Card>
        )}

        <Typography variant="body1" style={{ marginBottom: '2rem', maxWidth: '600px' }}>
          Para poder ofrecerte las mejores opciones de inversión, necesitamos conocer tu perfil como inversor.
          Por favor, responde las siguientes preguntas:
        </Typography>

        <Card style={{ width: '100%', maxWidth: '800px' }}>
          <CardContent style={{ padding: '2rem' }}>
            <form onSubmit={handleSubmit}>
              {preguntas
                .filter((pregunta) => pregunta.habilitada)
                .map((pregunta) => (
                  <Card
                    key={pregunta.id}
                    style={{
                      marginBottom: '2rem',
                      backgroundColor: '#f8f9fa',
                      border: '1px solid #e9ecef'
                    }}
                  >
                    <CardContent>
                      <Typography
                        variant="h6"
                        style={{
                          marginBottom: '1.5rem',
                          color: 'var(--light-blue)',
                          fontWeight: 'bold'
                        }}
                      >
                        {pregunta.pregunta}
                      </Typography>

                      <Box display="flex" flexDirection="column" gap={1} alignItems="stretch">
                        {pregunta.opciones.map((opcion) => {
                          const seleccionada = getRespuestaSeleccionada(pregunta.id) === opcion.id.toString();
                          return (
                            <Button
                              key={opcion.id}
                              variant={seleccionada ? 'contained' : 'outlined'}
                              onClick={() => handleRespuestaChange(pregunta.id, opcion.id)}
                              style={{
                                margin: '4px 0',
                                width: '100%',
                                padding: '12px 16px',
                                fontSize: '14px',
                                backgroundColor: seleccionada ? 'var(--main-green)' : 'transparent',
                                color: seleccionada ? 'white' : 'black',
                                borderColor: 'var(--main-green)',
                                textTransform: 'none',
                                whiteSpace: 'normal',
                                height: 'auto',
                                minHeight: '48px',
                                justifyContent: 'flex-start',
                                textAlign: 'left'
                              }}
                            >
                              {opcion.valor}
                            </Button>
                          );
                        })}
                      </Box>
                    </CardContent>
                  </Card>
                ))}

              {tipoPerfilCalculado && (
                <Card
                  style={{
                    marginBottom: '2rem',
                    backgroundColor: '#e8f5e8',
                    border: `2px solid ${getTipoPerfilColor(tipoPerfilCalculado)}`,
                    borderRadius: '8px'
                  }}
                >
                  <CardContent style={{ textAlign: 'center', padding: '2rem' }}>
                    <Typography
                      variant="h5"
                      style={{
                        color: getTipoPerfilColor(tipoPerfilCalculado),
                        fontWeight: 'bold',
                        marginBottom: '1rem'
                      }}
                    >
                      Calificación del Inversor
                    </Typography>

                    <Typography
                      variant="h4"
                      style={{
                        color: getTipoPerfilColor(tipoPerfilCalculado),
                        fontWeight: 'bold',
                        marginBottom: '1rem'
                      }}
                    >
                      {tipoPerfilCalculado}
                    </Typography>

                    <Typography
                      variant="body1"
                      style={{
                        color: '#666',
                        maxWidth: '500px',
                        margin: '0 auto'
                      }}
                    >
                      {getTipoPerfilDescripcion(tipoPerfilCalculado)}
                    </Typography>
                  </CardContent>
                </Card>
              )}

              <Box display="flex" justifyContent="center" className="navigation-buttons" style={{ marginTop: '2rem' }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={handleVolver}
                  disabled={saving}
                  className="navigation-button"
                  style={{
                    borderColor: 'var(--main-green)',
                    color: 'var(--main-green)'
                  }}
                >
                  Volver
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving || !isFormValid()}
                  className="navigation-button"
                  style={{
                    backgroundColor: isFormValid() ? 'var(--main-green)' : '#ccc',
                    color: '#fff'
                  }}
                >
                  {saving ? <CircularProgress size={20} color="inherit" /> : 'Continuar'}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default PerfilInversorPage;
