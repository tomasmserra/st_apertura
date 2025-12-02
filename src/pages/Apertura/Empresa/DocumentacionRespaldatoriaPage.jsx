import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Typography,
  IconButton
} from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';
import DeleteIcon from '@material-ui/icons/Delete';
import { authenticationService, empresaService } from '../../../services';
import env from '../../../config/env';

const initialFormData = {
  estatutoId: null,
  balanceId: null,
  accionistaId: null,
  poderActaId: null,
  poderId: null,
  ddjjGananciasId: null
};

const initialFiles = {
  estatuto: null,
  balance: null,
  accionista: null,
  poderActa: null,
  poder: null,
  ddjjGanancias: null
};

const REQUIRED_FIELDS = ['estatutoId', 'balanceId', 'accionistaId'];

const DocumentacionRespaldatoriaPage = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState(initialFormData);
  const [files, setFiles] = useState(initialFiles);
  const [uploadingField, setUploadingField] = useState('');

  const solicitudId = useMemo(() => localStorage.getItem('currentSolicitudId'), []);

  const fetchArchivoInfo = useCallback(async (archivoId, fieldKey) => {
    if (!archivoId) return;

    try {
      const archivo = await authenticationService.getArchivo(archivoId);
      if (archivo && archivo.ok) {
        setFiles((prev) => ({
          ...prev,
          [fieldKey]: {
            id: archivoId,
            name: archivo.filename || archivo.name || 'Documento.pdf',
            size: archivo.blob?.size || 0,
            url: archivo.url
          }
        }));
      }
    } catch (err) {
      console.error(`Error obteniendo archivo ${fieldKey}:`, err);
    }
  }, []);

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      if (!solicitudId) {
        setError('No se encontró una solicitud activa.');
        return;
      }

      const response = await empresaService.getDocumentacionRespaldatoriaEmpresa(solicitudId);

      if (response && (response.status === 200 || response.ok)) {
        const data = {
          estatutoId: response.estatutoId || null,
          balanceId: response.balanceId || null,
          accionistaId: response.accionistaId || null,
          poderActaId: response.poderActaId || null,
          poderId: response.poderId || null,
          ddjjGananciasId: response.ddjjGananciasId || null
        };

        setFormData(data);

        await Promise.all([
          fetchArchivoInfo(data.estatutoId, 'estatuto'),
          fetchArchivoInfo(data.balanceId, 'balance'),
          fetchArchivoInfo(data.accionistaId, 'accionista'),
          fetchArchivoInfo(data.poderActaId, 'poderActa'),
          fetchArchivoInfo(data.poderId, 'poder'),
          fetchArchivoInfo(data.ddjjGananciasId, 'ddjjGanancias')
        ]);
      } else {
        setError('Error al cargar la documentación respaldatoria existente.');
      }
    } catch (err) {
      console.error('Error cargando documentación respaldatoria:', err);
      setError('Error al cargar la documentación respaldatoria existente.');
    } finally {
      setLoading(false);
    }
  }, [fetchArchivoInfo, solicitudId]);

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

  const handleFileUpload = async (event, fieldKey, formField) => {
    const filesSelected = Array.from(event.target.files || []);
    if (filesSelected.length === 0) return;

    const file = filesSelected[0];
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    // Validar tamaño de archivo antes de subir
    if (file.size > MAX_FILE_SIZE) {
      setError(`El archivo "${file.name}" excede el límite de 10MB. Por favor, selecciona un archivo más pequeño.`);
      event.target.value = null;
      return;
    }

    setUploadingField(fieldKey);
    setError('');

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const apiUrl = env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/api/archivos/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataUpload
      });

      if (!response.ok) {
        throw new Error('Error subiendo el archivo');
      }

      const result = await response.json();
      const archivoId = result.id || result.archivoId;

      if (!archivoId) {
        throw new Error('No se pudo obtener el ID del archivo');
      }

      setFormData((prev) => ({
        ...prev,
        [formField]: archivoId
      }));

      setFiles((prev) => ({
        ...prev,
        [fieldKey]: {
          id: archivoId,
          name: file.name,
          size: file.size
        }
      }));
    } catch (err) {
      console.error(`Error subiendo archivo ${fieldKey}:`, err);
      setError('Error al subir el archivo. Intente nuevamente.');
    } finally {
      setUploadingField('');
      event.target.value = null;
    }
  };

  const handleRemoveFile = (fieldKey, formField) => {
    setFiles((prev) => ({
      ...prev,
      [fieldKey]: null
    }));
    setFormData((prev) => ({
      ...prev,
      [formField]: null
    }));
  };

  const isFormValid = () => {
    const hasRequired = REQUIRED_FIELDS.every((field) => formData[field]);
    const hasPoder = formData.poderActaId || formData.poderId;
    return hasRequired && hasPoder;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!solicitudId) {
      setError('No se encontró una solicitud activa.');
      return;
    }

    if (!isFormValid()) {
      setError('Debe cargar los documentos obligatorios antes de continuar.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        solicitudId: parseInt(solicitudId, 10),
        ...formData
      };

      const response = await empresaService.saveDocumentacionRespaldatoriaEmpresa(payload);

      if (response && (response.status === 200 || response.ok)) {
        history.push('/apertura/empresa/accionistas');
      } else {
        setError('Error al guardar la documentación respaldatoria. Intente nuevamente.');
      }
    } catch (err) {
      console.error('Error guardando documentación respaldatoria:', err);
      setError('Error de conexión al guardar la documentación. Intente nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const renderFileCard = (label, fieldKey, formField, required = false, helperText = '') => {
    const fileInfo = files[fieldKey];
    const inputId = `${fieldKey}-upload`; 

    return (
      <Card style={{ marginBottom: '1.5rem', border: '1px solid #e0e0e0', backgroundColor: '#f9fafb' }} key={fieldKey}>
        <CardContent>
          <Box display="flex" flexDirection="column" alignItems="flex-start" gap={1}>
            <Typography variant="h6" style={{ color: 'var(--light-blue)', fontWeight: 'bold' }}>
              {label} {required && <span style={{ color: '#f44336' }}>*</span>}
            </Typography>
            {helperText && (
              <Typography variant="body2" color="textSecondary">
                {helperText}
              </Typography>
            )}
            <Typography variant="caption" color="textSecondary" style={{ marginBottom: '0.5rem' }}>
              Límite de tamaño: 10MB por archivo
            </Typography>
            <input
              id={inputId}
              type="file"
              style={{ display: 'none' }}
              onChange={(event) => handleFileUpload(event, fieldKey, formField)}
            />
            <Box display="flex" gap={1} alignItems="center">
              <label htmlFor={inputId}>
                <Button
                  variant="contained"
                  component="span"
                  disabled={uploadingField === fieldKey || saving}
                  style={{
                    backgroundColor: 'var(--main-green)',
                    color: '#fff'
                  }}
                >
                  {fileInfo ? 'Reemplazar archivo' : 'Subir archivo'}
                </Button>
              </label>
              {uploadingField === fieldKey && <CircularProgress size={20} />}
              {fileInfo && (
                <IconButton
                  aria-label="Quitar archivo"
                  onClick={() => handleRemoveFile(fieldKey, formField)}
                  disabled={saving}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
            {fileInfo && (
              <Box display="flex" flexDirection="column" marginTop={1}>
                <Typography variant="body2" style={{ fontWeight: 'bold' }}>
                  {fileInfo.name}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {Math.round((fileInfo.size || 0) / 1024)} KB
                </Typography>
                {fileInfo.url && (
                  <Button
                    style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}
                    variant="text"
                    color="primary"
                    onClick={() => window.open(fileInfo.url, '_blank')}
                  >
                    Ver documento
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading && !files.estatuto && !files.balance && !files.accionista) {
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
          Documentación Respaldatoria
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

        <Card style={{ width: '100%', maxWidth: '800px' }}>
          <CardContent style={{ padding: '2rem' }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  {renderFileCard('Estatuto Social', 'estatuto', 'estatutoId', true)}
                </Grid>
                <Grid item xs={12}>
                  {renderFileCard('Balance', 'balance', 'balanceId', true)}
                </Grid>
                <Grid item xs={12}>
                  {renderFileCard('Listado de Accionistas', 'accionista', 'accionistaId', true)}
                </Grid>
                <Grid item xs={12}>
                  {renderFileCard(
                    'Designación Directorio',
                    'poderActa',
                    'poderActaId',
                    !formData.poderId
                  )}
                </Grid>
                <Grid item xs={12}>
                  {renderFileCard(
                    'Poder',
                    'poder',
                    'poderId',
                    !formData.poderActaId
                  )}
                </Grid>
                <Grid item xs={12}>
                  {renderFileCard('Declaración Jurada de Ganancias', 'ddjjGanancias', 'ddjjGananciasId', false)}
                </Grid>
              </Grid>

              <Box display="flex" justifyContent="center" className="navigation-buttons" style={{ marginTop: '2rem' }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={() => history.push('/apertura/empresa/perfil-inversor')}
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
                  disabled={saving || uploadingField !== '' || !isFormValid()}
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

export default DocumentacionRespaldatoriaPage;
