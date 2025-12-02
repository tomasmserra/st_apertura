import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
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

const paisesOptions = [
  'ARGENTINA',
  'BRASIL',
  'CHILE',
  'URUGUAY',
  'PARAGUAY',
  'BOLIVIA',
  'PERU',
  'COLOMBIA',
  'VENEZUELA',
  'ECUADOR',
  'MEXICO',
  'ESPAÑA',
  'ITALIA',
  'FRANCIA',
  'ALEMANIA',
  'ESTADOS_UNIDOS',
  'CANADA',
  'REINO_UNIDO',
  'OTRO'
];

const initialFormData = {
  fechaConstitucion: '',
  numeroActa: '',
  paisOrigen: 'ARGENTINA',
  paisResidencia: 'ARGENTINA',
  fechaCierreBalance: ''
};

const parseBackendFechaCierre = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    // Try parsing as YYYY-MM
    const parts = value.split('-');
    if (parts.length >= 2) {
      return `${parts[0]}-${parts[1]}`;
    }
    return '';
  }
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, '0');
  return `${year}-${month}`;
};

const buildBackendFechaCierre = (value) => {
  if (!value) return '';
  const [year, month] = value.split('-');
  if (!year || !month) return '';
  return `${year}-${month}-01`;
};

const DatosOrganizacionPage = () => {
  const history = useHistory();
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

      const response = await empresaService.getDatosOrganizacionEmpresa(solicitudId);

      if (response && (response.status === 200 || response.ok)) {
        setFormData({
          fechaConstitucion: response.fechaConstitucion || '',
          numeroActa: response.numeroActa || '',
          paisOrigen: response.paisOrigen || 'ARGENTINA',
          paisResidencia: response.paisResidencia || 'ARGENTINA',
          fechaCierreBalance: parseBackendFechaCierre(response.fechaCierreBalance)
        });
      }
    } catch (err) {
      console.error('Error cargando datos de la organización:', err);
      setError('Error al cargar los datos de la organización.');
    } finally {
      setLoading(false);
    }
  }, [solicitudId]);

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
    return ['fechaConstitucion', 'numeroActa', 'paisOrigen', 'paisResidencia', 'fechaCierreBalance'].every((field) => {
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
      const payload = {
        solicitudId: parseInt(solicitudId, 10),
        fechaConstitucion: formData.fechaConstitucion,
        numeroActa: formData.numeroActa,
        paisOrigen: formData.paisOrigen,
        paisResidencia: formData.paisResidencia,
        fechaCierreBalance: buildBackendFechaCierre(formData.fechaCierreBalance)
      };

      const response = await empresaService.saveDatosOrganizacionEmpresa(payload);

      if (response && (response.status === 200 || response.ok)) {
        history.push('/apertura/empresa/domicilio');
      } else {
        setError('Error al guardar los datos de la organización. Intente nuevamente.');
      }
    } catch (err) {
      console.error('Error guardando datos de la organización:', err);
      setError('Error de conexión al guardar los datos de la organización. Intente nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleVolver = () => {
    history.push('/apertura/empresa/datos-principales');
  };

  if (loading && !formData.fechaConstitucion) {
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
          Datos de la Organización
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
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    type="date"
                    label="Fecha de Constitución"
                    value={formData.fechaConstitucion}
                    onChange={(e) => handleInputChange('fechaConstitucion', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Número de Acta"
                    value={formData.numeroActa}
                    onChange={(e) => handleInputChange('numeroActa', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>País de Origen</InputLabel>
                    <Select
                      value={formData.paisOrigen}
                      onChange={(e) => handleInputChange('paisOrigen', e.target.value)}
                      label="País de Origen"
                    >
                      {paisesOptions.map((pais) => (
                        <MenuItem key={pais} value={pais}>
                          {pais}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>País de Residencia</InputLabel>
                    <Select
                      value={formData.paisResidencia}
                      onChange={(e) => handleInputChange('paisResidencia', e.target.value)}
                      label="País de Residencia"
                    >
                      {paisesOptions.map((pais) => (
                        <MenuItem key={pais} value={pais}>
                          {pais}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    type="month"
                    label="Fecha de Cierre de Balance"
                    value={formData.fechaCierreBalance}
                    onChange={(e) => handleInputChange('fechaCierreBalance', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
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

export default DatosOrganizacionPage;
