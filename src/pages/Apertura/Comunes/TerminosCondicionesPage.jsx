import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  Typography
} from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';
import { authenticationService, empresaService } from '../../../services';
import terminosPdf from '../../../pdf/TerminosYCondiciones.pdf';
import gestionFondosPdf from '../../../pdf/GestionFondos.pdf';
import comisionesPdf from '../../../pdf/Comisiones.pdf';

const configs = {
  individuo: {
    get: (solicitudId) => authenticationService.getTerminosCondicionesIndividuo(solicitudId),
    save: (datos) => authenticationService.saveTerminosCondicionesIndividuo(datos),
    backPath: '/apertura/individuo/declaracion-ingresos',
    nextYesPath: '/apertura/cotitulares',
    nextNoPath: '/apertura/fin',
    copy: {
      title: 'Términos y Condiciones',
      question: '¿Desea agregar Co-Titulares a su cuenta?',
      yesLabel: 'Agregar Co-Titular',
      noLabel: 'Finalizar Apertura'
    }
  },
  empresa: {
    get: (solicitudId) => empresaService.getTerminosCondicionesEmpresa(solicitudId),
    save: (datos) => empresaService.saveTerminosCondicionesEmpresa(datos),
    backPath: '/apertura/empresa/firmantes',
    nextYesPath: '/apertura/empresa/firmantes',
    nextNoPath: '/apertura/fin',
    copy: {
      title: 'Términos y Condiciones - Empresa',
      question: '¿Desea agregar Firmantes Adicionales a la cuenta?',
      yesLabel: 'Agregar Firmante',
      noLabel: 'Finalizar Apertura'
    }
  }
};

const initialFormData = {
  aceptaTerminosCondiciones: false,
  aceptaReglamentoGestionFondos: false,
  aceptaComisiones: false
};

const TerminosCondicionesPage = () => {
  const history = useHistory();
  const location = useLocation();
  const variant = location.pathname.includes('/empresa/') ? 'empresa' : 'individuo';
  const config = configs[variant];

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState(initialFormData);

  const solicitudId = useMemo(() => localStorage.getItem('currentSolicitudId'), []);

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      if (!solicitudId) {
        setError('No se encontró una solicitud activa.');
        return;
      }

      const response = await config.get(solicitudId);

      if (response && (response.status === 200 || response.ok)) {
        setFormData({
          aceptaTerminosCondiciones: !!response.aceptaTerminosCondiciones,
          aceptaReglamentoGestionFondos: !!response.aceptaReglamentoGestionFondos,
          aceptaComisiones: !!response.aceptaComisiones
        });
      } else {
        setError('Error al cargar los términos y condiciones existentes.');
      }
    } catch (err) {
      console.error('Error cargando términos y condiciones:', err);
      setError('Error al cargar los términos y condiciones.');
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
      cargarDatos();
    }
  }, [history, cargarDatos]);

  const handleChange = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field]
    }));
    setSuccessMessage('');
  };

  const isFormValid = () =>
    formData.aceptaTerminosCondiciones &&
    formData.aceptaReglamentoGestionFondos &&
    formData.aceptaComisiones;

  const guardarTerminos = async () => {
    if (!isFormValid()) {
      setError('Debes aceptar todas las condiciones para continuar.');
      return false;
    }

    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');

      if (!solicitudId) {
        setError('No se encontró la solicitud en curso.');
        return false;
      }

      const payload = {
        solicitudId: parseInt(solicitudId, 10),
        aceptaTerminosCondiciones: formData.aceptaTerminosCondiciones,
        aceptaReglamentoGestionFondos: formData.aceptaReglamentoGestionFondos,
        aceptaComisiones: formData.aceptaComisiones
      };

      const response = await config.save(payload);

      if (response && (response.status === 200 || response.ok)) {
        setSuccessMessage('Términos y condiciones guardados correctamente.');
        return true;
      } else {
        setError('Error al guardar términos y condiciones.');
        return false;
      }
    } catch (err) {
      console.error('Error guardando términos y condiciones:', err);
      setError('Error al guardar términos y condiciones.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleVolver = () => {
    history.push(config.backPath);
  };

  const handleNext = async (path) => {
    const guardado = await guardarTerminos();
    if (guardado) {
      history.push(path);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          style={{ color: 'var(--light-blue)', fontWeight: 'bold', marginBottom: '1rem' }}
        >
          {config.copy.title}
        </Typography>

        {error && (
          <Card
            style={{
              marginBottom: '1rem',
              width: '100%',
              maxWidth: '600px',
              backgroundColor: '#ffebee',
              border: '1px solid #f44336'
            }}
          >
            <CardContent style={{ padding: '1rem' }}>
              <Typography variant="body2" style={{ color: '#d32f2f' }}>
                {error}
              </Typography>
            </CardContent>
          </Card>
        )}

        {successMessage && (
          <Card
            style={{
              marginBottom: '1rem',
              width: '100%',
              maxWidth: '600px',
              backgroundColor: '#e8f5e9',
              border: '1px solid #4caf50'
            }}
          >
            <CardContent style={{ padding: '1rem' }}>
              <Typography variant="body2" style={{ color: '#2e7d32' }}>
                {successMessage}
              </Typography>
            </CardContent>
          </Card>
        )}

        <Card style={{ width: '100%', maxWidth: '800px' }}>
          <CardContent style={{ padding: '2rem' }}>
            <Box display="flex" flexDirection="column" alignItems="flex-start" style={{ gap: '1rem', textAlign: 'left' }}>
              <Box width="100%" marginBottom="0.5rem">
                <Box
                  component="iframe"
                  src={terminosPdf}
                  title="Términos y Condiciones"
                  style={{ width: '100%', height: '15vh', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </Box>
              <FormControlLabel
                control={
                  <Checkbox
                    color="primary"
                    checked={formData.aceptaTerminosCondiciones}
                    onChange={() => handleChange('aceptaTerminosCondiciones')}
                  />
                }
                label={
                  <Typography variant="body1" style={{ lineHeight: 1.5 }}>
                    He leído y acepto los{' '}
                    <a
                      href="/apertura/documento/terminos-condiciones"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--main-green)', fontWeight: 600 }}
                    >
                      términos y condiciones
                    </a>{' '}
                    para la apertura de cuenta en ST SECURITIES S.A.U. y para operar online en los mercados autorizados
                    por la Comisión Nacional de Valores.
                  </Typography>
                }
              />

              <Box width="100%" marginBottom="0.5rem">
                <Box
                  component="iframe"
                  src={gestionFondosPdf}
                  title="Reglamento de Gestión de Fondos"
                  style={{ width: '100%', height: '15vh', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </Box>
              <FormControlLabel
                control={
                  <Checkbox
                    color="primary"
                    checked={formData.aceptaReglamentoGestionFondos}
                    onChange={() => handleChange('aceptaReglamentoGestionFondos')}
                  />
                }
                label={
                  <Typography variant="body1" style={{ lineHeight: 1.5 }}>
                    He leído y acepto el{' '}
                    <a
                      href="/apertura/documento/reglamento-gestion-fondos"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--main-green)', fontWeight: 600 }}
                    >
                      reglamento de gestión de fondos
                    </a>
                    .
                  </Typography>
                }
              />

              <Box width="100%" marginBottom="0.5rem">
                <Box
                  component="iframe"
                  src={comisionesPdf}
                  title="Comisiones y Derechos de Mercado"
                  style={{ width: '100%', height: '15vh', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </Box>
              <FormControlLabel
                control={
                  <Checkbox
                    color="primary"
                    checked={formData.aceptaComisiones}
                    onChange={() => handleChange('aceptaComisiones')}
                  />
                }
                label={
                  <Typography variant="body1" style={{ lineHeight: 1.5 }}>
                    He leído y acepto las{' '}
                    <a
                      href="/apertura/documento/comisiones-derechos-mercado"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--main-green)', fontWeight: 600 }}
                    >
                      comisiones y derechos de mercado
                    </a>
                    .
                  </Typography>
                }
              />
            </Box>

            <Box display="flex" flexDirection="column" alignItems="center" style={{ marginTop: '2rem', gap: '1.5rem' }}>
              {variant === 'individuo' ? (
                <Typography variant="h6" style={{ fontWeight: 'bold', textAlign: 'center', color: '#333' }}>
                  {config.copy.question}
                </Typography>
              ) : (
                <Typography variant="body1" style={{ textAlign: 'center', color: '#333' }}>
                  Podés finalizar la solicitud o continuar más tarde desde el panel principal.
                </Typography>
              )}
              <Box display="flex" justifyContent="center" className="navigation-buttons" style={{ gap: '1.5rem' }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={handleVolver}
                  className="navigation-button"
                  disabled={saving}
                >
                  Volver
                </Button>
                {variant === 'individuo' && (
                  <Button
                    variant="contained"
                    onClick={() => handleNext(config.nextYesPath)}
                    className="navigation-button"
                    disabled={saving || !isFormValid()}
                    style={{
                      backgroundColor: !isFormValid() ? '#ccc' : 'var(--main-green)',
                      color: '#fff'
                    }}
                  >
                    {saving ? <CircularProgress size={20} color="inherit" /> : config.copy.yesLabel}
                  </Button>
                )}
                <Button
                  variant="contained"
                  onClick={() => handleNext(config.nextNoPath)}
                  className="navigation-button"
                  disabled={saving || !isFormValid()}
                  style={{
                    backgroundColor: !isFormValid() ? '#ccc' : 'var(--light-blue)',
                    color: '#fff'
                  }}
                >
                  {saving ? <CircularProgress size={20} color="inherit" /> : config.copy.noLabel}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default TerminosCondicionesPage;
