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
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Grid
} from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';
import { authenticationService, empresaService } from '../../../services';

const tipoEmpresaOptions = [
  { value: 'AGRUPACION', label: 'Agrupación' },
  { value: 'ASOCIACION', label: 'Asociación' },
  { value: 'COOPERATIVA', label: 'Coperativa' },
  { value: 'SOCIEDAD_ANONIMA', label: 'Sociedad anónima' },
  { value: 'SOCIEDAD_SIN_FINES_LUCR', label: 'Sociedad sin fines de lucro' },
  { value: 'SRL', label: 'SRL' },
  { value: 'SAS', label: 'SAS' },
  { value: 'FIDEICOMISO', label: 'Fideicomiso' },
  { value: 'OTRA', label: 'Otra' }
];

const usoFirmaOptions = [
  { value: 'INDISTINTA', label: 'Indistinta' },
  { value: 'CONJUNTA', label: 'Conjunta' }
];

const initialFormData = {
  denominacion: '',
  tipoEmpresa: '',
  telefono: '',
  celular: '',
  correoElectronico: '',
  usoFirma: '',
  actividad: '',
  comoNosConocio: ''
};

const DatosPrincipalesEmpresaPage = () => {
  const history = useHistory();
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const solicitudId = useMemo(() => localStorage.getItem('currentSolicitudId'), []);

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      if (!solicitudId) {
        setError('No se encontró una solicitud activa.');
        return;
      }

      const response = await empresaService.getDatosPrincipalesEmpresa(solicitudId);

      if (response && (response.status === 200 || response.ok)) {
        setFormData({
          denominacion: response.denominacion || '',
          tipoEmpresa: response.tipoEmpresa || '',
          telefono: response.telefono || '',
          celular: response.celular || '',
          correoElectronico: response.correoElectronico || '',
          usoFirma: response.usoFirma || '',
          actividad: response.actividad || '',
          comoNosConocio: response.comoNosConocio || ''
        });
      } else {
        setError('Error al cargar los datos de la empresa.');
      }
    } catch (err) {
      console.error('Error cargando datos principales empresa:', err);
      setError('Error al cargar los datos de la empresa.');
    } finally {
      setLoading(false);
    }
  }, [solicitudId]);

  useEffect(() => {
    const checkSession = () => {
      const currentUser = authenticationService.currentUserValue;
      if (!currentUser || !authenticationService.checkSessionValidity()) {
        history.push('/');
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

  const isEmailValid = (email) => {
    if (!email) return false;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const isFormValid = () => {
    return (
      formData.denominacion.trim() !== '' &&
      formData.tipoEmpresa.trim() !== '' &&
      isEmailValid(formData.correoElectronico) &&
      formData.usoFirma.trim() !== '' &&
      formData.actividad.trim() !== ''
    );
  };

  const sanitizeNumeric = (value) => value.replace(/[^0-9]/g, '');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!solicitudId) {
      setError('No se encontró una solicitud activa.');
      return;
    }

    if (!isFormValid()) {
      setError('Por favor completá todos los campos obligatorios con información válida.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');

      const payload = {
        solicitudId: parseInt(solicitudId, 10),
        denominacion: formData.denominacion.trim(),
        tipoEmpresa: formData.tipoEmpresa,
        telefono: formData.telefono,
        celular: formData.celular,
        correoElectronico: formData.correoElectronico.trim(),
        usoFirma: formData.usoFirma,
        actividad: formData.actividad.trim(),
        comoNosConocio: formData.comoNosConocio.trim()
      };

      const response = await empresaService.saveDatosPrincipalesEmpresa(payload);

      if (response && (response.status === 200 || response.ok)) {
        history.push('/apertura/empresa/datos-organizacion');
      } else {
        setError('Ocurrió un error al guardar los datos de la empresa.');
      }
    } catch (err) {
      console.error('Error guardando datos principales empresa:', err);
      setError('Ocurrió un error al guardar los datos de la empresa.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="md" style={{ marginTop: '2rem', paddingBottom: '4rem' }}>
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center">
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          style={{ color: 'var(--light-blue)', fontWeight: 'bold', marginBottom: '1rem' }}
        >
          Datos Principales
        </Typography>

        <Card
          style={{
            width: '100%',
            maxWidth: '600px',
            marginBottom: '1.5rem',
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef'
          }}
        >
          <CardContent style={{ padding: '1rem' }}>
            <Typography variant="body2" style={{ color: '#495057', lineHeight: '1.5', textAlign: 'left', fontSize: '14px' }}>
              <span style={{ fontWeight: 'bold' }}>¡Bienvenido a ST SECURITIES S.A.U.!</span>
              <br />
              {'\u00A0\u00A0\u00A0\u00A0\u00A0'}
              Para iniciar la apertura de cuenta de tu empresa completá el siguiente formulario. Una vez validados los datos
              nos comunicaremos para continuar con el proceso.
              <br />
              <span style={{ fontWeight: 'bold' }}>¡Muchas gracias por elegirnos!</span>
            </Typography>
          </CardContent>
        </Card>

        {(error || successMessage) && (
          <Card
            style={{
              marginBottom: '1rem',
              width: '100%',
              maxWidth: '600px',
              backgroundColor: error ? '#ffebee' : '#e8f5e9',
              border: error ? '1px solid #f44336' : '1px solid #4caf50'
            }}
          >
            <CardContent style={{ padding: '1rem' }}>
              <Typography
                variant="body2"
                style={{ color: error ? '#d32f2f' : '#2e7d32', textAlign: 'center' }}
              >
                {error || successMessage}
              </Typography>
            </CardContent>
          </Card>
        )}

        <Card style={{ width: '100%', maxWidth: '600px' }}>
          <CardContent style={{ padding: '2rem' }}>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
              </Box>
            ) : (
              <form onSubmit={handleSubmit}>
                <Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Denominación"
                        value={formData.denominacion}
                        onChange={(e) => handleInputChange('denominacion', e.target.value)}
                        variant="outlined"
                        required
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl variant="outlined" fullWidth required>
                        <InputLabel>Tipo de Empresa</InputLabel>
                        <Select
                          value={formData.tipoEmpresa}
                          onChange={(e) => handleInputChange('tipoEmpresa', e.target.value)}
                          label="Tipo de Empresa"
                        >
                          {tipoEmpresaOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl variant="outlined" fullWidth required>
                        <InputLabel>Uso de Firma</InputLabel>
                        <Select
                          value={formData.usoFirma}
                          onChange={(e) => handleInputChange('usoFirma', e.target.value)}
                          label="Uso de Firma"
                        >
                          {usoFirmaOptions.map((option) => (
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
                        label="Teléfono"
                        value={formData.telefono}
                        onChange={(e) => handleInputChange('telefono', sanitizeNumeric(e.target.value))}
                        variant="outlined"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Celular"
                        value={formData.celular}
                        onChange={(e) => handleInputChange('celular', sanitizeNumeric(e.target.value))}
                        variant="outlined"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Correo electrónico"
                        value={formData.correoElectronico}
                        onChange={(e) => handleInputChange('correoElectronico', e.target.value)}
                        variant="outlined"
                        required
                        error={formData.correoElectronico !== '' && !isEmailValid(formData.correoElectronico)}
                        helperText={
                          formData.correoElectronico !== '' && !isEmailValid(formData.correoElectronico)
                            ? 'Ingresá un correo electrónico válido'
                            : ''
                        }
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Actividad"
                        value={formData.actividad}
                        onChange={(e) => handleInputChange('actividad', e.target.value)}
                        variant="outlined"
                        required
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="¿Cómo nos conoció?"
                        value={formData.comoNosConocio}
                        onChange={(e) => handleInputChange('comoNosConocio', e.target.value)}
                        variant="outlined"
                        multiline
                        rows={3}
                      />
                    </Grid>
                  </Grid>

                  <Box display="flex" justifyContent="center" className="navigation-buttons" style={{ marginTop: '1.5rem' }}>
                    <Button
                      variant="outlined"
                      startIcon={<ArrowBack />}
                      onClick={() => history.push('/tipo-apertura')}
                      className="navigation-button"
                      style={{
                        borderColor: 'var(--main-green)',
                        color: 'var(--main-green)'
                      }}
                      disabled={saving}
                    >
                      Volver
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      className="navigation-button"
                      disabled={saving || !isFormValid()}
                      style={{
                        backgroundColor: isFormValid() ? 'var(--main-green)' : '#ccc',
                        color: '#fff'
                      }}
                    >
                      {saving ? <CircularProgress size={20} color="inherit" /> : 'Siguiente'}
                    </Button>
                  </Box>
                </Box>
              </form>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default DatosPrincipalesEmpresaPage;

