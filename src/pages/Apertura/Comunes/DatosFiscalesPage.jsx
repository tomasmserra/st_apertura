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
  { value: 'CUIL', label: 'CUIL' },
  { value: 'CUIT', label: 'CUIT' },
  { value: 'CDI', label: 'CDI' },
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

const tipoIvaOptions = [
  { value: 'RESPONSABLE_INSCRIPTO', label: 'Responsable inscripto' },
  { value: 'RESPONSABLE_MONOTRIBUTO', label: 'Responsable monotributo' },
  { value: 'CONSUMIDOR_FINAL', label: 'Consumidor final' },
  { value: 'EXENTO', label: 'Exento' },
  { value: 'NO_CATEGORIZADO', label: 'No categorizado' },
  { value: 'NO_ALCANZADO', label: 'No alcanzado' }
];

const tipoGananciaOptions = [
  { value: 'INSCRIPTO', label: 'Inscripto' },
  { value: 'NO_INSCRIPTO', label: 'No inscripto' },
  { value: 'EXENTO', label: 'Exento' },
  { value: 'RESPONSABLE_MONOTRIBUTO', label: 'Responsable monotributo' }
];

const configs = {
  individuo: {
    get: (solicitudId) => authenticationService.getDatosFiscalesIndividuo(solicitudId),
    save: (datos) => authenticationService.saveDatosFiscalesIndividuo(datos),
    backPath: '/apertura/individuo/domicilio',
    nextPath: '/apertura/individuo/datos-fiscales-exterior',
    preparePayload: (formData, solicitudId, currentUser) => ({
      solicitudId: parseInt(solicitudId, 10),
      idUsuario: currentUser?.id,
      tipo: formData.tipo,
      claveFiscal: formData.claveFiscal,
      tipoIva: formData.tipoIva,
      tipoGanancia: formData.tipoGanancia
    })
  },
  empresa: {
    get: (solicitudId) => empresaService.getDatosFiscalesEmpresa(solicitudId),
    save: (datos) => empresaService.saveDatosFiscalesEmpresa(datos),
    backPath: '/apertura/empresa/domicilio',
    nextPath: '/apertura/empresa/datos-fiscales-exterior',
    preparePayload: (formData, solicitudId) => ({
      solicitudId: parseInt(solicitudId, 10),
      tipo: formData.tipo,
      claveFiscal: formData.claveFiscal,
      tipoIva: formData.tipoIva,
      tipoGanancia: formData.tipoGanancia
    })
  }
};

const initialFormData = {
  tipo: 'CUIL',
  claveFiscal: '',
  tipoIva: 'RESPONSABLE_MONOTRIBUTO',
  tipoGanancia: 'RESPONSABLE_MONOTRIBUTO'
};

const DatosFiscalesPage = () => {
  const history = useHistory();
  const location = useLocation();
  const variant = location.pathname.includes('/empresa/') ? 'empresa' : 'individuo';
  const config = configs[variant];

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
        setFormData((prev) => ({
          ...prev,
          tipo: response.tipo || prev.tipo,
          claveFiscal: response.claveFiscal || '',
          tipoIva: response.tipoIva || prev.tipoIva,
          tipoGanancia: response.tipoGanancia || prev.tipoGanancia
        }));
      }
    } catch (err) {
      console.error('Error cargando datos fiscales:', err);
      setError('Error al cargar los datos fiscales.');
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

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormValid = () => {
    const requiredFields = ['tipo', 'claveFiscal', 'tipoIva', 'tipoGanancia'];

    return requiredFields.every((field) => {
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
        setError('Error al guardar los datos fiscales. Intente nuevamente.');
      }
    } catch (err) {
      console.error('Error al guardar datos fiscales:', err);
      setError('Error de conexión al guardar los datos fiscales. Intente nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleVolver = () => {
    history.push(config.backPath);
  };

  if (loading && !formData.claveFiscal) {
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
          Datos Fiscales
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
                    <InputLabel>Tipo IVA</InputLabel>
                    <Select
                      value={formData.tipoIva}
                      onChange={(e) => handleInputChange('tipoIva', e.target.value)}
                      label="Tipo IVA"
                    >
                      {tipoIvaOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Tipo Ganancia</InputLabel>
                    <Select
                      value={formData.tipoGanancia}
                      onChange={(e) => handleInputChange('tipoGanancia', e.target.value)}
                      label="Tipo Ganancia"
                    >
                      {tipoGananciaOptions.map((option) => (
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
      </Box>
    </Container>
  );
};

export default DatosFiscalesPage;
