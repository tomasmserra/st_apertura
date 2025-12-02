import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  FormControl,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  TextField,
  Typography
} from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';
import { authenticationService, empresaService } from '../../../services';

const configs = {
  individuo: {
    get: (solicitudId) => authenticationService.getDeclaracionesIndividuo(solicitudId),
    save: (datos) => authenticationService.saveDeclaracionesIndividuo(datos),
    backPath: '/apertura/individuo/cuentas-bancarias-exterior',
    nextPath: '/apertura/individuo/perfil-inversor',
    includePep: true,
    includeUsuarioId: true
  },
  empresa: {
    get: (solicitudId) => empresaService.getDeclaracionesEmpresa(solicitudId),
    save: (datos) => empresaService.saveDeclaracionesEmpresa(datos),
    backPath: '/apertura/empresa/cuentas-bancarias-exterior',
    nextPath: '/apertura/empresa/perfil-inversor',
    includePep: false,
    includeUsuarioId: false
  }
};

const DeclaracionesPage = () => {
  const history = useHistory();
  const location = useLocation();
  const variant = location.pathname.includes('/empresa/') ? 'empresa' : 'individuo';
  const config = configs[variant];

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [backPath, setBackPath] = useState(config.backPath);
  const [formData, setFormData] = useState({
    esPep: false,
    motivoPep: '',
    esFATCA: false,
    motivoFatca: '',
    declaraUIF: false,
    motivoUIF: ''
  });

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
          esPep: response.esPep || false,
          motivoPep: response.motivoPep || '',
          esFATCA: response.esFATCA || false,
          motivoFatca: response.motivoFatca || '',
          declaraUIF: response.declaraUIF || false,
          motivoUIF: response.motivoUIF || ''
        });
      } else {
        setError('Error al cargar las declaraciones existentes.');
      }
    } catch (err) {
      console.error('Error cargando declaraciones:', err);
      setError('Error al cargar las declaraciones existentes.');
    } finally {
      setLoading(false);
    }
  }, [config, solicitudId]);

  // Determinar el backPath según si debe completar cuentas bancarias exterior
  useEffect(() => {
    const determinarBackPath = async () => {
      if (variant === 'empresa' && solicitudId) {
        try {
          const response = await empresaService.getCuentasBancariasEmpresa(solicitudId);
          if (response && (response.status === 200 || response.ok)) {
            const debeCompletar = typeof response.debeCompletarCuentasBancariasExterior === 'boolean'
              ? response.debeCompletarCuentasBancariasExterior
              : true;
            // Si debe completar, va a cuentas-bancarias-exterior, si no, a cuentas-bancarias
            setBackPath(debeCompletar 
              ? '/apertura/empresa/cuentas-bancarias-exterior'
              : '/apertura/empresa/cuentas-bancarias');
          }
        } catch (err) {
          console.error('Error verificando cuentas bancarias:', err);
          // En caso de error, mantener el backPath por defecto
        }
      }
    };
    determinarBackPath();
  }, [variant, solicitudId]);

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

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormValid = () => {
    const pepValido = !config.includePep || !formData.esPep || (formData.motivoPep && formData.motivoPep.trim() !== '');
    const fatcaValido = !formData.esFATCA || (formData.motivoFatca && formData.motivoFatca.trim() !== '');
    const uifValido = !formData.declaraUIF || (formData.motivoUIF && formData.motivoUIF.trim() !== '');
    return pepValido && fatcaValido && uifValido;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!solicitudId) {
      setError('No se encontró una solicitud activa.');
      return;
    }

    if (!isFormValid()) {
      setError('Por favor complete todos los campos requeridos cuando corresponda.');
      return;
    }

    try {
      setSaving(true);
      const currentUser = authenticationService.currentUserValue;
      const payload = {
        solicitudId: parseInt(solicitudId, 10),
        esPep: config.includePep ? formData.esPep : false,
        motivoPep: config.includePep && formData.esPep ? formData.motivoPep : null,
        esFATCA: formData.esFATCA,
        motivoFatca: formData.esFATCA ? formData.motivoFatca : null,
        declaraUIF: formData.declaraUIF,
        motivoUIF: formData.declaraUIF ? formData.motivoUIF : null
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
        setError('Error al guardar las declaraciones. Intente nuevamente.');
      }
    } catch (err) {
      console.error('Error guardando declaraciones:', err);
      setError('Error de conexión al guardar las declaraciones. Intente nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleVolver = (event) => {
    event.preventDefault();
    history.push(backPath);
  };

  if (loading && !formData.esFATCA && !formData.declaraUIF) {
    return (
      <Container maxWidth="md" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" style={{ marginTop: '2rem', paddingBottom: '4rem' }}>
      <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          style={{ color: 'var(--light-blue)', fontWeight: 'bold', marginBottom: '1rem' }}
        >
          Declaraciones
        </Typography>

        {error && (
          <Card
            style={{
              width: '100%',
              maxWidth: '600px',
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

        <Card style={{ width: '100%', maxWidth: '600px' }}>
          <CardContent style={{ padding: '2rem' }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {config.includePep && (
                  <Grid item xs={12}>
                    <Card style={{ padding: '1.5rem', backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
                      <CardContent style={{ padding: 0 }}>
                        <Typography variant="h6" style={{ marginBottom: '1rem', color: 'var(--light-blue)', fontWeight: 'bold' }}>
                          Persona Expuesta Políticamente (PEP)
                        </Typography>
                        <Typography variant="body1" style={{ marginBottom: '1rem' }}>
                          ¿Sos Persona Expuesta Políticamente (PEP)?
                        </Typography>
                        <FormControl component="fieldset">
                          <RadioGroup
                            value={formData.esPep}
                            onChange={(e) => handleInputChange('esPep', e.target.value === 'true')}
                            row
                          >
                            <FormControlLabel value={true} control={<Radio />} label="Sí" />
                            <FormControlLabel value={false} control={<Radio />} label="No" />
                          </RadioGroup>
                        </FormControl>
                        {formData.esPep && (
                          <TextField
                            fullWidth
                            variant="outlined"
                            label="Motivo"
                            value={formData.motivoPep}
                            onChange={(e) => handleInputChange('motivoPep', e.target.value)}
                            required
                            multiline
                            rows={3}
                            style={{ marginTop: '1rem' }}
                            placeholder="Explique el motivo por el cual es considerado PEP"
                          />
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Card style={{ padding: '1.5rem', backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
                    <CardContent style={{ padding: 0 }}>
                      <Typography variant="h6" style={{ marginBottom: '1rem', color: 'var(--light-blue)', fontWeight: 'bold' }}>
                        Residente Tributario (FATCA)
                      </Typography>
                      <Typography variant="body1" style={{ marginBottom: '1rem' }}>
                        ¿Sos Residente tributario fuera de Argentina (FATCA)?
                      </Typography>
                      <FormControl component="fieldset">
                        <RadioGroup
                          value={formData.esFATCA}
                          onChange={(e) => handleInputChange('esFATCA', e.target.value === 'true')}
                          row
                        >
                          <FormControlLabel value={true} control={<Radio />} label="Sí" />
                          <FormControlLabel value={false} control={<Radio />} label="No" />
                        </RadioGroup>
                      </FormControl>
                      {formData.esFATCA && (
                        <TextField
                          fullWidth
                          variant="outlined"
                          label="Motivo"
                          value={formData.motivoFatca}
                          onChange={(e) => handleInputChange('motivoFatca', e.target.value)}
                          required
                          multiline
                          rows={3}
                          style={{ marginTop: '1rem' }}
                          placeholder="Explique el motivo por el cual es residente tributario fuera de Argentina"
                        />
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card style={{ padding: '1.5rem', backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
                    <CardContent style={{ padding: 0 }}>
                      <Typography variant="h6" style={{ marginBottom: '1rem', color: 'var(--light-blue)', fontWeight: 'bold' }}>
                        Sujeto Obligado UIF
                      </Typography>
                      <Typography variant="body1" style={{ marginBottom: '1rem' }}>
                        ¿Sos Sujeto Obligado a informar ante la UIF?
                      </Typography>
                      <FormControl component="fieldset">
                        <RadioGroup
                          value={formData.declaraUIF}
                          onChange={(e) => handleInputChange('declaraUIF', e.target.value === 'true')}
                          row
                        >
                          <FormControlLabel value={true} control={<Radio />} label="Sí" />
                          <FormControlLabel value={false} control={<Radio />} label="No" />
                        </RadioGroup>
                      </FormControl>
                      {formData.declaraUIF && (
                        <TextField
                          fullWidth
                          variant="outlined"
                          label="Motivo"
                          value={formData.motivoUIF}
                          onChange={(e) => handleInputChange('motivoUIF', e.target.value)}
                          required
                          multiline
                          rows={3}
                          style={{ marginTop: '1rem' }}
                          placeholder="Explique el motivo por el cual es sujeto obligado ante la UIF"
                        />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Box display="flex" justifyContent="center" className="navigation-buttons" style={{ marginTop: '2rem' }}>
                <Button
                  type="button"
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

export default DeclaracionesPage;
