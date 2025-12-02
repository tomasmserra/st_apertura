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

const lugarInscripcionOptions = [
  'CNV',
  'DJP',
  'ETR',
  'EXT',
  'IAC',
  'IAM',
  'INAES',
  'IGJ',
  'NOI',
  'RIP',
  'RPC',
  'SAC',
  'SEC',
  'Otro'
];

const initialFormData = {
  lugarInscripcionRegistro: '',
  numeroRegistro: '',
  paisRegistro: 'ARGENTINA',
  provinciaRegistro: '',
  lugarRegistro: '',
  fechaRegistro: '',
  folio: '',
  libro: '',
  tomo: ''
};

const RegistroPage = () => {
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

      const response = await empresaService.getDatosRegistroEmpresa(solicitudId);

      if (response && (response.status === 200 || response.ok)) {
        setFormData({
          lugarInscripcionRegistro: response.lugarInscripcionRegistro || '',
          numeroRegistro: response.numeroRegistro || '',
          paisRegistro: response.paisRegistro || 'ARGENTINA',
          provinciaRegistro: response.provinciaRegistro || '',
          lugarRegistro: response.lugarRegistro || '',
          fechaRegistro: response.fechaRegistro || '',
          folio: response.folio || '',
          libro: response.libro || '',
          tomo: response.tomo || ''
        });
      }
    } catch (err) {
      console.error('Error cargando datos de registro:', err);
      setError('Error al cargar los datos de registro.');
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
    const requiredFields = [
      'lugarInscripcionRegistro',
      'numeroRegistro',
      'paisRegistro',
      'provinciaRegistro',
      'lugarRegistro',
      'fechaRegistro'
    ];

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
      const payload = {
        solicitudId: parseInt(solicitudId, 10),
        ...formData
      };

      const response = await empresaService.saveDatosRegistroEmpresa(payload);

      if (response && (response.status === 200 || response.ok)) {
        history.push('/apertura/empresa/cuentas-bancarias');
      } else {
        setError('Error al guardar los datos de registro. Intente nuevamente.');
      }
    } catch (err) {
      console.error('Error guardando datos de registro:', err);
      setError('Error de conexión al guardar los datos de registro. Intente nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleVolver = () => {
    history.push('/apertura/empresa/datos-fiscales');
  };

  if (loading && !formData.numeroRegistro) {
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
          Registro
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
                <Grid item xs={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Tipo de Inscripción</InputLabel>
                    <Select
                      value={formData.lugarInscripcionRegistro}
                      onChange={(e) => handleInputChange('lugarInscripcionRegistro', e.target.value)}
                      label="Lugar de Inscripción"
                    >
                      {lugarInscripcionOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Número de Registro"
                    value={formData.numeroRegistro}
                    onChange={(e) => handleInputChange('numeroRegistro', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>País de Registro</InputLabel>
                    <Select
                      value={formData.paisRegistro}
                      onChange={(e) => handleInputChange('paisRegistro', e.target.value)}
                      label="País de Registro"
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
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Provincia / Estado"
                    value={formData.provinciaRegistro}
                    onChange={(e) => handleInputChange('provinciaRegistro', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Lugar de Registro"
                    value={formData.lugarRegistro}
                    onChange={(e) => handleInputChange('lugarRegistro', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    type="date"
                    label="Fecha de Registro"
                    value={formData.fechaRegistro}
                    onChange={(e) => handleInputChange('fechaRegistro', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Folio"
                    value={formData.folio}
                    onChange={(e) => handleInputChange('folio', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Libro"
                    value={formData.libro}
                    onChange={(e) => handleInputChange('libro', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Tomo"
                    value={formData.tomo}
                    onChange={(e) => handleInputChange('tomo', e.target.value)}
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

export default RegistroPage;
