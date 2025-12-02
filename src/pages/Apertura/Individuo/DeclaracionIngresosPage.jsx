import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  FormControlLabel,
  Grid,
  Typography
} from '@material-ui/core';
import { ArrowBack, CloudUpload, Delete } from '@material-ui/icons';
import { authenticationService } from '../../../services';
import env from '../../../config/env';

const ORIGEN_FONDOS_OPTIONS = [
  {
    value: 'TRANSFERENCIA_BANCARIA',
    label: 'Transferencia Bancaria a nombre del titular'
  },
  {
    value: 'TRANSFERENCIA_ESPECIES',
    label: 'Transferencia de Especies'
  },
  {
    value: 'CHEQUE',
    label: 'Entrega de Cheques a nombre del titular'
  }
];

const DeclaracionIngresosPage = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    ddJjOrigenFondos: [],
    comprobanteDdJjOrigenFondosId: null
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const checkSession = () => {
      const currentUser = authenticationService.currentUserValue;
      if (!currentUser || !authenticationService.checkSessionValidity()) {
        history.push('/');
        return;
      }
    };

    checkSession();
    cargarDeclaracionIngresos();
  }, [history]);

  const cargarDeclaracionIngresos = async () => {
    try {
      setLoading(true);
      setError('');
      const currentSolicitudId = localStorage.getItem('currentSolicitudId');

      if (!currentSolicitudId) {
        history.push('/tipo-apertura');
        return;
      }

      const response = await authenticationService.getDeclaracionIngresosIndividuo(currentSolicitudId);
      console.log('Respuesta backend declaración ingresos:', response);

      if (response && (response.status === 200 || response.ok)) {
        const {
          ddJjOrigenFondos = [],
          comprobanteDdJjOrigenFondosId = null
        } = response;

        setFormData({
          ddJjOrigenFondos,
          comprobanteDdJjOrigenFondosId
        });

        if (comprobanteDdJjOrigenFondosId) {
          await cargarArchivo(comprobanteDdJjOrigenFondosId);
        } else {
          setUploadedFile(null);
        }
      } else {
        console.log('Error al cargar declaración de ingresos', response);
      }
    } catch (err) {
      console.error('Error cargando declaración de ingresos:', err);
      setError('Error al cargar los datos de declaración de ingresos');
    } finally {
      setLoading(false);
    }
  };

  const cargarArchivo = async (archivoId) => {
    try {
      const archivo = await authenticationService.getArchivo(archivoId);

      if (archivo && archivo.ok) {
        setUploadedFile({
          id: archivoId,
          name: archivo.filename || 'Comprobante.pdf',
          size: archivo.blob?.size || 0,
          url: archivo.url
        });
      } else {
        console.error('Error obteniendo el archivo de comprobante:', archivo);
      }
    } catch (error) {
      console.error('Error obteniendo archivo de comprobante:', error);
    }
  };

  const handleOrigenFondosChange = (value) => {
    setFormData((prev) => {
      const yaSeleccionado = prev.ddJjOrigenFondos.includes(value);
      const ddJjOrigenFondos = yaSeleccionado
        ? prev.ddJjOrigenFondos.filter((item) => item !== value)
        : [...prev.ddJjOrigenFondos, value];

      return {
        ...prev,
        ddJjOrigenFondos
      };
    });
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const file = files[0];
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    // Validar tamaño de archivo antes de subir
    if (file.size > MAX_FILE_SIZE) {
      setError(`El archivo "${file.name}" excede el límite de 10MB. Por favor, selecciona un archivo más pequeño.`);
      event.target.value = null;
      return;
    }

    setUploading(true);
    setError('');
    setSuccessMessage('');

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const apiUrl = env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/api/archivos/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataUpload
      });

      if (!response.ok) {
        throw new Error('Error subiendo el archivo');
      }

      const result = await response.json();
      const archivoId = result.id || result.archivoId || result.comprobanteDdJjOrigenFondosId;

      if (!archivoId) {
        throw new Error('No se pudo obtener el ID del archivo');
      }

      setFormData((prev) => ({
        ...prev,
        comprobanteDdJjOrigenFondosId: archivoId
      }));

      setUploadedFile({
        id: archivoId,
        name: file.name,
        size: file.size
      });
    } catch (err) {
      console.error('Error uploading comprobante:', err);
      setError('Error al subir el comprobante. Por favor, intente nuevamente.');
    } finally {
      setUploading(false);
      event.target.value = null;
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setFormData((prev) => ({
      ...prev,
      comprobanteDdJjOrigenFondosId: null
    }));
  };

  const isFormValid = () => formData.ddJjOrigenFondos.length > 0;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isFormValid()) {
      setError('Debe seleccionar al menos un origen de fondos para continuar.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');

      const currentSolicitudId = localStorage.getItem('currentSolicitudId');

      if (!currentSolicitudId) {
        setError('No se encontró la solicitud en curso.');
        return;
      }

      const payload = {
        solicitudId: parseInt(currentSolicitudId, 10),
        ddJjOrigenFondos: formData.ddJjOrigenFondos,
        comprobanteDdJjOrigenFondosId: formData.comprobanteDdJjOrigenFondosId
      };

      const response = await authenticationService.saveDeclaracionIngresosIndividuo(payload);

      if (response && (response.status === 200 || response.ok)) {
        setSuccessMessage('Declaración de ingresos guardada correctamente.');
        history.push('/apertura/individuo/terminos-condiciones');
      } else {
        setError('Error al guardar la declaración de ingresos.');
      }
    } catch (err) {
      console.error('Error guardando declaración de ingresos:', err);
      setError('Error al guardar la declaración de ingresos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          style={{ color: 'var(--light-blue)', fontWeight: 'bold', marginBottom: '1rem' }}
        >
          Declaración de Ingresos
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
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="body1" style={{ marginBottom: '1rem', textAlign: 'left' }}>
                    Declaro bajo juramento que los fondos y/o valores depositados en la Cuenta Comitente en ST SECURITIES S.A.U.. se acreditarán a través de:
                  </Typography>
                  <Box display="flex" flexDirection="column" alignItems="flex-start">
                    {ORIGEN_FONDOS_OPTIONS.map((option) => (
                      <FormControlLabel
                        key={option.value}
                        control={
                          <Checkbox
                            color="primary"
                            checked={formData.ddJjOrigenFondos.includes(option.value)}
                            onChange={() => handleOrigenFondosChange(option.value)}
                          />
                        }
                        label={option.label}
                      />
                    ))}
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body1" style={{ marginBottom: '0.75rem', textAlign: 'left' }}>
                    Y tiene su origen en la documentación adjunta:
                  </Typography>
                  <input
                    accept="image/*,.pdf"
                    style={{ display: 'none' }}
                    id="comprobante-upload"
                    type="file"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="comprobante-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUpload />}
                      disabled={uploading}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        border: '2px dashed #ccc'
                      }}
                    >
                      {uploading ? 'Subiendo...' : 'Subir comprobante (opcional)'}
                    </Button>
                  </label>
                  <Typography variant="caption" display="block" style={{ marginTop: '0.5rem', color: '#666' }}>
                    Formatos permitidos: JPG, PNG, PDF. En móvil se abrirá la cámara.
                  </Typography>
                  <Typography variant="caption" display="block" style={{ marginTop: '0.5rem', color: '#666' }}>
                    Límite de tamaño: 10MB por archivo
                  </Typography>
                </Grid>

                {uploadedFile && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" style={{ marginBottom: '0.5rem' }}>
                      Archivo cargado:
                    </Typography>
                    <Chip
                      label={`${uploadedFile.name} (${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)`}
                      onDelete={removeFile}
                      deleteIcon={<Delete />}
                      style={{ margin: '0.25rem' }}
                    />
                  </Grid>
                )}

                <Grid item xs={12} style={{ marginTop: '2rem' }}>
                  <Box display="flex" justifyContent="center" className="navigation-buttons">
                    <Button
                      variant="outlined"
                      startIcon={<ArrowBack />}
                      onClick={() => history.push('/apertura/individuo/perfil-inversor')}
                      className="navigation-button"
                      disabled={loading}
                    >
                      Volver
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      className="navigation-button"
                      disabled={loading || !isFormValid()}
                      style={{
                        backgroundColor: isFormValid() ? 'var(--main-green)' : '#ccc',
                        color: '#fff'
                      }}
                    >
                      {loading ? <CircularProgress size={20} color="inherit" /> : 'Continuar'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default DeclaracionIngresosPage;

