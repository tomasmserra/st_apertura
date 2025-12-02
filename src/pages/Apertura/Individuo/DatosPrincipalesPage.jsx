import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Container, Typography, Box, Button, TextField, Grid, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import { authenticationService } from '../../../services';

const DatosPrincipalesPage = () => {
  let history = useHistory();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emailError, setEmailError] = useState('');
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    celular: '',
    correoElectronico: '',
    comoNosConocio: ''
  });

  useEffect(() => {
    const checkSession = () => {
      const currentUser = authenticationService.currentUserValue;
      if (!currentUser || !authenticationService.checkSessionValidity()) {
        history.push('/tipo-apertura');
        return;
      }
    };

    checkSession();

    const solicitudId = localStorage.getItem('currentSolicitudId');
    if (!solicitudId) {
      history.push('/tipo-apertura');
      return;
    }

    cargarDatosExistentes();
  }, [history]);

  const cargarDatosExistentes = async () => {
    try {
      const currentUser = authenticationService.currentUserValue;
      const currentSolicitudId = localStorage.getItem('currentSolicitudId');
      
      console.log('Cargando datos existentes...');
      console.log('currentUser:', currentUser);
      console.log('currentSolicitudId:', currentSolicitudId);
      
      if (currentSolicitudId) {
        const response = await authenticationService.getDatosPrincipalesIndividuo(currentSolicitudId);
        console.log('Respuesta del backend:', response);
        
        if (response && (response.status === 200 || response.ok)) {
          if (response.nombres || response.apellidos || response.celular || response.correoElectronico || response.comoNosConocio) {
            console.log('Cargando datos existentes en el formulario:', response);
            setFormData({
              nombres: response.nombres || '',
              apellidos: response.apellidos || '',
              celular: response.celular || '',
              correoElectronico: response.correoElectronico || '',
              comoNosConocio: response.comoNosConocio || ''
            });
          } else {
            console.log('No hay datos existentes para cargar');
          }
        } else {
          console.log('Error en la respuesta del backend:', response);
        }
      } else {
        console.log('No se encontro currentSolicitudId en localStorage');
      }
    } catch (error) {
      console.error('Error al cargar datos existentes:', error);
    }
  };

  const handleInputChange = (field, value) => {
    if (field === 'celular') {
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({
        ...prev,
        [field]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    if (field === 'correoElectronico') {
      if (value && !validateEmail(value)) {
        setEmailError('Ingrese un correo electronico valido');
      } else {
        setEmailError('');
      }
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isFormValid = () => {
    const camposCompletos = formData.nombres.trim() !== '' && 
                           formData.apellidos.trim() !== '' && 
                           formData.celular.trim() !== '' && 
                           formData.correoElectronico.trim() !== '' && 
                           formData.comoNosConocio.trim() !== '';
    
    const sinErrores = !emailError;
    const emailValido = validateEmail(formData.correoElectronico);
    
    return camposCompletos && sinErrores && emailValido;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isFormValid()) {
      setError('Por favor complete todos los campos requeridos y corrija los errores.');
      setLoading(false);
      return;
    }

    try {
      const currentUser = authenticationService.currentUserValue;
      const solicitudId = localStorage.getItem('currentSolicitudId');
      
      if (!currentUser || !currentUser.id || !solicitudId) {
        setError('Error: Usuario o solicitud no encontrados');
        setLoading(false);
        return;
      }

      const datosParaGuardar = {
        solicitudId: parseInt(solicitudId),
        idUsuario: currentUser.id,
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        celular: formData.celular,
        correoElectronico: formData.correoElectronico,
        comoNosConocio: formData.comoNosConocio
      };

      console.log('Datos a guardar:', datosParaGuardar);
      
      const response = await authenticationService.saveDatosPrincipalesIndividuo(datosParaGuardar);
      
      if (response && (response.status === 200 || response.ok)) {
        console.log('Datos guardados exitosamente:', response);
        // Redirigir a datos personales (que ahora incluye datos principales)
        history.push('/apertura/individuo/datos-personales');
      } else {
        console.error('Error al guardar datos:', response);
        setError('Error al guardar los datos. Intente nuevamente.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error al guardar datos:', error);
      setError('Error de conexion al guardar los datos. Intente nuevamente.');
      setLoading(false);
    }
  };

  const handleVolver = () => {
    history.push('/tipo-apertura');
  };

  return (
    <Container maxWidth="md" style={{ marginTop: '2rem', paddingBottom: '4rem' }}>
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center">
        <Typography variant="h4" component="h1" gutterBottom style={{ color: 'var(--light-blue)', fontWeight: 'bold', marginBottom: '1rem' }}>
          Datos Principales
        </Typography>
        
        <Card style={{ width: '100%', maxWidth: '600px', marginBottom: '1.5rem', backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
          <CardContent style={{ padding: '1rem' }}>
            <Typography variant="body2" style={{ color: '#495057', lineHeight: '1.5', textAlign: 'left', fontSize: '14px' }}>
              <span style={{ fontWeight: 'bold' }}>¡Bienvenido a ST SECURITIES S.A.U.!</span>
              <br />
              {'\u00A0\u00A0\u00A0\u00A0\u00A0'}Comencemos con la apertura de su cuenta completando el siguiente formulario. Una vez validados sus datos nos comunicaremos con Ud. para brindarle sus credenciales de acceso a nuestra plataforma.
              <br />
              <span style={{ fontWeight: 'bold' }}>¡Muchas gracias por elegirnos!</span>
            </Typography>
          </CardContent>
        </Card>

        <Card style={{ width: '100%', maxWidth: '600px' }}>
          <CardContent style={{ padding: '2rem' }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nombres"
                    required
                    value={formData.nombres}
                    onChange={(e) => handleInputChange('nombres', e.target.value)}
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Apellidos"
                    required
                    value={formData.apellidos}
                    onChange={(e) => handleInputChange('apellidos', e.target.value)}
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Celular"
                    required
                    value={formData.celular}
                    onChange={(e) => handleInputChange('celular', e.target.value)}
                    variant="outlined"
                    margin="normal"
                    type="tel"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Correo Electronico"
                    required
                    value={formData.correoElectronico}
                    onChange={(e) => handleInputChange('correoElectronico', e.target.value)}
                    variant="outlined"
                    margin="normal"
                    type="email"
                    error={!!emailError}
                    helperText={emailError}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="¿Como nos conocio?"
                    required
                    value={formData.comoNosConocio}
                    onChange={(e) => handleInputChange('comoNosConocio', e.target.value)}
                    variant="outlined"
                    margin="normal"
                    multiline
                    rows={3}
                    placeholder="Ej: Google, Redes sociales, Referencia de un amigo, etc."
                  />
                </Grid>
              </Grid>
              
              {error && (
                <Alert severity="error" style={{ marginTop: '1rem' }}>
                  {error}
                </Alert>
              )}
              
              <Box display="flex" justifyContent="center" className="navigation-buttons" style={{ marginTop: '2rem' }}>
                <Button
                  variant="outlined"
                  onClick={handleVolver}
                  disabled={loading}
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
                  disabled={loading || !isFormValid()}
                  className="navigation-button"
                  style={{
                    backgroundColor: isFormValid() ? 'var(--main-green)' : '#ccc',
                    color: '#fff'
                  }}
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : 'Continuar'}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default DatosPrincipalesPage;