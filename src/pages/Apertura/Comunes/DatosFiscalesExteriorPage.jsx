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
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';
import { authenticationService, empresaService } from '../../../services';

const tipoOptions = [
  { value: 'NIF', label: 'NIF' },
  { value: 'NIE', label: 'NIE' },
  { value: 'CIF', label: 'CIF' },
  { value: 'RUT', label: 'RUT' },
  { value: 'RUN', label: 'RUN' },
  { value: 'NIT', label: 'NIT' },
  { value: 'SAT', label: 'SAT' },
  { value: 'RFC', label: 'RFC' },
  { value: 'NSS', label: 'NSS' },
  { value: 'SSN', label: 'SSN' },
  { value: 'TIN', label: 'TIN' },
  { value: 'TaxID', label: 'TaxID' },
  { value: 'CPF', label: 'CPF' },
  { value: 'DUI', label: 'DUI' },
  { value: 'RTU', label: 'RTU' },
  { value: 'Otro', label: 'Otro' }
];

const paisesOptions = [
  { value: 'ARGENTINA', label: 'Argentina' },
  { value: 'BRASIL', label: 'Brasil' },
  { value: 'CHILE', label: 'Chile' },
  { value: 'URUGUAY', label: 'Uruguay' },
  { value: 'PARAGUAY', label: 'Paraguay' },
  { value: 'BOLIVIA', label: 'Bolivia' },
  { value: 'PERU', label: 'Perú' },
  { value: 'COLOMBIA', label: 'Colombia' },
  { value: 'VENEZUELA', label: 'Venezuela' },
  { value: 'ECUADOR', label: 'Ecuador' },
  { value: 'MEXICO', label: 'México' },
  { value: 'ESPAÑA', label: 'España' },
  { value: 'ITALIA', label: 'Italia' },
  { value: 'FRANCIA', label: 'Francia' },
  { value: 'ALEMANIA', label: 'Alemania' },
  { value: 'ESTADOS_UNIDOS', label: 'Estados Unidos' },
  { value: 'CANADA', label: 'Canadá' },
  { value: 'REINO_UNIDO', label: 'Reino Unido' },
  { value: 'OTRO', label: 'Otro' }
];

const configs = {
  individuo: {
    get: (solicitudId) => authenticationService.getDatosFiscalesExteriorIndividuo(solicitudId),
    save: (datos) => authenticationService.saveDatosFiscalesExteriorIndividuo(datos),
    backPath: '/apertura/individuo/datos-fiscales',
    nextPath: '/apertura/individuo/cuentas-bancarias',
    includeUsuarioId: true,
    preparePayload: (formData, solicitudId, currentUser) => ({
      solicitudId: parseInt(solicitudId, 10),
      idUsuario: currentUser?.id,
      tipo: formData.tipo,
      claveFiscal: formData.claveFiscal,
      residenciaFiscal: formData.residenciaFiscal
    })
  },
  empresa: {
    get: (solicitudId) => empresaService.getDatosFiscalesExteriorEmpresa(solicitudId),
    save: (datos) => empresaService.saveDatosFiscalesExteriorEmpresa(datos),
    backPath: '/apertura/empresa/datos-fiscales',
    nextPath: '/apertura/empresa/registro',
    includeUsuarioId: false,
    preparePayload: (formData, solicitudId) => ({
      solicitudId: parseInt(solicitudId, 10),
      tipo: formData.tipo,
      claveFiscal: formData.claveFiscal,
      residenciaFiscal: formData.residenciaFiscal
    })
  }
};

const initialFormData = {
  tipo: 'NIF',
  claveFiscal: '',
  residenciaFiscal: 'ARGENTINA'
};

const DatosFiscalesExteriorPage = () => {
  const history = useHistory();
  const location = useLocation();
  const variant = location.pathname.includes('/empresa/') ? 'empresa' : 'individuo';
  const config = configs[variant];

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [debeCompletar, setDebeCompletar] = useState(true);

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
        const debe = Boolean(response.debeCompletarFiscalExterior);
        setDebeCompletar(debe);

        if (!debe) {
          history.push(config.nextPath);
          return;
        }

        setFormData({
          tipo: response.tipo || 'NIF',
          claveFiscal: response.claveFiscal || '',
          residenciaFiscal: response.residenciaFiscal || 'ARGENTINA'
        });
      }
    } catch (err) {
      console.error('Error cargando datos fiscales exterior:', err);
      setError('Error al cargar los datos fiscales en el exterior.');
    } finally {
      setLoading(false);
    }
  }, [config, history, solicitudId]);

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
    return ['tipo', 'claveFiscal', 'residenciaFiscal'].every((field) => {
      const value = formData[field];
      return value !== undefined && value !== null && value.toString().trim() !== '';
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!solicitudId) {
      setError('No se encontró una solicitud activa.');
      return;
    }

    if (!isFormValid()) {
      setError('Por favor complete todos los campos requeridos.');
      return;
    }

    try {
      setSaving(true);
      const currentUser = authenticationService.currentUserValue;
      const payload = config.preparePayload(formData, solicitudId, currentUser);
      const response = await config.save(payload);

      if (response && (response.status === 200 || response.ok)) {
        history.push(config.nextPath);
      } else {
        setError('Error al guardar los datos fiscales en el exterior. Intente nuevamente.');
      }
    } catch (err) {
      console.error('Error guardando datos fiscales exterior:', err);
      setError('Error de conexión al guardar los datos fiscales en el exterior. Intente nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleVolver = () => {
    history.push(config.backPath);
  };

  const handleSaltar = () => {
    history.push(config.nextPath);
  };

  if (loading && debeCompletar && !formData.claveFiscal) {
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
          Datos Fiscales en el Exterior
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

        {!debeCompletar ? (
          <Card style={{ width: '100%', maxWidth: '600px' }}>
            <CardContent style={{ padding: '2rem', textAlign: 'center' }}>
              <Typography variant="h6" style={{ marginBottom: '1rem', color: 'var(--main-green)' }}>
                ¡Perfecto!
              </Typography>
              <Typography variant="body1" style={{ marginBottom: '2rem' }}>
                No es necesario completar datos fiscales en el exterior para su solicitud.
              </Typography>

              <Box display="flex" justifyContent="center" className="navigation-buttons">
                <Button
                  variant="outlined"
                  onClick={handleVolver}
                  className="navigation-button"
                  style={{
                    borderColor: 'var(--main-green)',
                    color: 'var(--main-green)'
                  }}
                >
                  Volver
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSaltar}
                  className="navigation-button"
                  style={{
                    backgroundColor: 'var(--main-green)',
                    color: '#fff'
                  }}
                >
                  Continuar
                </Button>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Card style={{ width: '100%', maxWidth: '600px' }}>
            <CardContent style={{ padding: '2rem' }}>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Tipo de Clave Fiscal</InputLabel>
                      <Select
                        value={formData.tipo}
                        onChange={(e) => handleInputChange('tipo', e.target.value)}
                        label="Tipo de Clave Fiscal"
                      >
                        {tipoOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      label="Clave Fiscal"
                      value={formData.claveFiscal}
                      onChange={(e) => handleInputChange('claveFiscal', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Residencia Fiscal</InputLabel>
                      <Select
                        value={formData.residenciaFiscal}
                        onChange={(e) => handleInputChange('residenciaFiscal', e.target.value)}
                        label="Residencia Fiscal"
                      >
                        {paisesOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

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
        )}
      </Box>
    </Container>
  );
};

export default DatosFiscalesExteriorPage;
