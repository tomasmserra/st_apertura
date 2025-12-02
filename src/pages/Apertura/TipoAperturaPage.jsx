import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Container, Typography, Box, Button, Card, CardContent, Grid, Chip, CircularProgress, Alert, Tooltip } from '@mui/material';
import { authenticationService } from '../../services';

const TipoAperturaPage = () => {
  let history = useHistory();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getTipoDisplay = (tipo) => {
    switch (tipo) {
      case 'EMPRESA_CLASICA':
        return 'Empresa';
      case 'INDIVIDUO':
        return 'Individuo';
      default:
        return tipo;
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'COMPLETA':
        return 'success';
      case 'INCOMPLETA':
        return 'warning';
      case 'APROBADA':
        return 'success';
      case 'RECHAZADA':
        return 'error';
      default:
        return 'default';
    }
  };

  useEffect(() => {
    // Verificar si la sesión es válida
    if (!authenticationService.checkSessionValidity()) {
      history.push('/');
      return;
    }

    // Obtener solicitudes del usuario
    const cargarSolicitudes = async () => {
      try {
        const currentUser = authenticationService.currentUserValue;
        if (currentUser && currentUser.id) {
          const response = await authenticationService.getSolicitudesUsuario(currentUser.id);
          if (response && (response.status === 200 || response.ok)) {
            setSolicitudes(Array.isArray(response) ? response : []);
          } else {
            setError('Error al cargar las solicitudes');
          }
        }
      } catch (error) {
        console.error('Error al cargar solicitudes:', error);
        setError('Error de conexión al cargar las solicitudes');
      } finally {
        setLoading(false);
      }
    };

    cargarSolicitudes();
  }, [history]);

  const handleNuevaSolicitud = async (tipo) => {
    try {
      const currentUser = authenticationService.currentUserValue;
      if (!currentUser || !currentUser.id) {
        console.error('Usuario no encontrado');
        return;
      }

      // Crear la solicitud en el backend
      const response = await authenticationService.crearSolicitud(tipo, currentUser.id);
      
      if (response && (response.status === 200 || response.ok)) {
        console.log('Solicitud creada:', response);
        
        // Navegar según el tipo
        if (tipo === 'INDIVIDUO') {
          // Guardar el ID de la solicitud para usar en el proceso
          localStorage.setItem('currentSolicitudId', response.id);
          history.push('/apertura/individuo/datos-principales');
        } else if (tipo === 'EMPRESA_CLASICA') {
          // Guardar el ID de la solicitud para usar en el proceso
          localStorage.setItem('currentSolicitudId', response.id);
          history.push('/apertura/empresa/datos-principales');
        } else {
          console.log('Tipo de solicitud no reconocido:', tipo);
        }
      } else {
        console.error('Error al crear solicitud:', response);
        // TODO: Mostrar mensaje de error al usuario
      }
    } catch (error) {
      console.error('Error al crear solicitud:', error);
      // TODO: Mostrar mensaje de error al usuario
    }
  };

  const handleContinuarSolicitud = (solicitud) => {
    console.log('Continuando solicitud:', solicitud);
    
    // Guardar el ID de la solicitud para usar en el proceso
    localStorage.setItem('currentSolicitudId', solicitud.id);
    console.log('Guardado currentSolicitudId:', solicitud.id);
    
    // Navegar según el tipo de solicitud
    if (solicitud.tipo === 'INDIVIDUO') {
      console.log('Navegando a datos principales de individuo');
      history.push('/apertura/individuo/datos-principales');
    } else if (solicitud.tipo === 'EMPRESA_CLASICA') {
      console.log('Navegando a datos principales de empresa');
      history.push('/apertura/empresa/datos-principales');
    } else {
      console.log('Tipo de solicitud no reconocido:', solicitud.tipo);
    }
  };

  return (
    <Container maxWidth="md" style={{ marginTop: '2rem', paddingBottom: '4rem' }}>
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center"
        textAlign="center"
      >
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          style={{ 
            color: 'var(--main-green)',
            fontWeight: 'bold',
            marginBottom: '2rem'
          }}
        >
          Gestión de Aperturas de Cuenta
        </Typography>

        {/* Lista de solicitudes existentes - Solo mostrar si hay solicitudes */}
        {!loading && !error && solicitudes.length > 0 && (
          <Box width="100%" style={{ marginBottom: '3rem' }}>
            <Typography 
              variant="h5" 
              component="h2" 
              gutterBottom
              style={{ 
                color: 'var(--grey)',
                fontWeight: 'bold',
                marginBottom: '1.5rem',
                textAlign: 'left'
              }}
            >
              Solicitudes Existentes
            </Typography>

            <Grid container spacing={2}>
              {solicitudes.map((solicitud) => (
                <Grid item xs={12} key={solicitud.id}>
                  <Card style={{ textAlign: 'left' }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box flexGrow={1}>
                          <Typography variant="h6" component="div" style={{ fontWeight: 'bold' }}>
                            {solicitud.nombre || 'Sin nombre'}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Tipo: {getTipoDisplay(solicitud.tipo)}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Fecha: {new Date(solicitud.fechaAlta).toLocaleDateString('es-AR')}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip 
                            label={solicitud.estado} 
                            color={getEstadoColor(solicitud.estado)}
                            variant="outlined"
                          />
                          {solicitud.estado === 'INCOMPLETA' && (
                            <Tooltip title="Continuar con el proceso de apertura">
                              <Button
                                variant="contained"
                                size="small"
                                style={{ 
                                  backgroundColor: 'var(--main-green)', 
                                  color: '#fff',
                                  marginLeft: '8px'
                                }}
                                onClick={() => handleContinuarSolicitud(solicitud)}
                              >
                                Continuar
                              </Button>
                            </Tooltip>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Mostrar loading o error solo si hay solicitudes o hay un error */}
        {loading && (
          <Box display="flex" justifyContent="center" style={{ marginTop: '2rem', marginBottom: '3rem' }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" style={{ marginTop: '1rem', marginBottom: '3rem' }}>
            {error}
          </Alert>
        )}

        {/* Botones para nuevas solicitudes */}
        <Box width="100%">
          <Typography 
            variant="h5" 
            component="h2" 
            gutterBottom
            style={{ 
              color: 'var(--grey)',
              fontWeight: 'bold',
              marginBottom: '1.5rem',
              textAlign: 'left'
            }}
          >
            Nueva Solicitud de Apertura
          </Typography>
          
          <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
            <Button
              variant="contained"
              size="large"
              style={{ 
                backgroundColor: 'var(--main-green)', 
                color: '#fff',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
              onClick={() => handleNuevaSolicitud('EMPRESA_CLASICA')}
            >
              EMPRESA
            </Button>
            <Button
              variant="contained"
              size="large"
              style={{ 
                backgroundColor: 'var(--main-green)', 
                color: '#fff',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
              onClick={() => handleNuevaSolicitud('INDIVIDUO')}
            >
              INDIVIDUO
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default TipoAperturaPage;