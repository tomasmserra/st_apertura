import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Box,
  IconButton,
  Chip,
  Snackbar
} from '@material-ui/core';
import { ArrowBack, CloudUpload, Delete } from '@material-ui/icons';
import { authenticationService } from '../../../services';
import env from '../../../config/env';

const DatosPersonalesPage = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    // Datos Principales
    nombres: '',
    apellidos: '',
    celular: '',
    correoElectronico: '',
    comoNosConocio: '',
    // Datos Personales
    tipoID: 'DNI',
    idNumero: '',
    fechaNacimiento: '',
    lugarNacimiento: '',
    nacionalidad: 'ARGENTINA',
    paisOrigen: 'ARGENTINA',
    paisResidencia: 'ARGENTINA',
    actividad: '',
    sexo: 'MASCULINO',
    estadoCivil: 'SOLTERO',
    dniFrenteArchivoId: null,
    dniReversoArchivoId: null,
    conyuge: {
      nombres: '',
      apellidos: '',
      tipoID: 'DNI',
      idNumero: '',
      tipoClaveFiscal: 'CUIT',
      claveFiscal: ''
    }
  });
  const [emailError, setEmailError] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [fechaNacimientoError, setFechaNacimientoError] = useState('');

  useEffect(() => {
    const checkSession = () => {
      const currentUser = authenticationService.currentUserValue;
      if (!currentUser || !authenticationService.checkSessionValidity()) {
        history.push('/');
        return;
      }
      cargarDatosExistentes();
    };

    checkSession();
  }, [history]);

  const cargarDatosExistentes = async () => {
    try {
      setLoading(true);
      const currentSolicitudId = localStorage.getItem('currentSolicitudId');
      
      console.log('Cargando datos personales existentes...');
      console.log('currentSolicitudId:', currentSolicitudId);
      
      if (currentSolicitudId) {
        setUploadedFiles([]);
        
        // Cargar datos principales
        const datosPrincipalesResponse = await authenticationService.getDatosPrincipalesIndividuo(currentSolicitudId);
        console.log('Respuesta del backend datos principales:', datosPrincipalesResponse);
        
        // Cargar datos personales
        const response = await authenticationService.getDatosPersonalesIndividuo(currentSolicitudId);
        console.log('Respuesta del backend datos personales:', response);
        
        // Combinar datos principales y personales
        const datosPrincipales = datosPrincipalesResponse && (datosPrincipalesResponse.status === 200 || datosPrincipalesResponse.ok)
          ? datosPrincipalesResponse
          : {};
        
        if (response && (response.status === 200 || response.ok)) {
          // Los datos están directamente en la respuesta, no en response.data
          if (datosPrincipales.nombres || datosPrincipales.apellidos || response.tipoID || response.idNumero || response.fechaNacimiento) {
            console.log('Cargando datos principales y personales en el formulario:', { datosPrincipales, response });
            const {
              conyuge: conyugeResponse,
              dniFrenteArchivoId,
              dniReversoArchivoId,
              status,
              ok,
              ...restoDatos
            } = response;

            setFormData(prev => ({
              ...prev,
              // Datos principales
              nombres: datosPrincipales.nombres || prev.nombres,
              apellidos: datosPrincipales.apellidos || prev.apellidos,
              celular: datosPrincipales.celular || prev.celular,
              correoElectronico: datosPrincipales.correoElectronico || prev.correoElectronico,
              comoNosConocio: datosPrincipales.comoNosConocio || prev.comoNosConocio,
              // Datos personales
              ...restoDatos,
              dniFrenteArchivoId: dniFrenteArchivoId || null,
              dniReversoArchivoId: dniReversoArchivoId || null,
              conyuge: {
                ...prev.conyuge,
                ...(conyugeResponse || {})
              }
            }));
            
            // Validar email
            if (datosPrincipales.correoElectronico) {
              validateEmail(datosPrincipales.correoElectronico);
            }

            if (response.dniFrenteArchivoId) {
              console.log('Cargando archivo DNI frente con ID:', response.dniFrenteArchivoId);
              cargarArchivoDNI(response.dniFrenteArchivoId, 'frente');
            }

            if (response.dniReversoArchivoId) {
              console.log('Cargando archivo DNI reverso con ID:', response.dniReversoArchivoId);
              cargarArchivoDNI(response.dniReversoArchivoId, 'reverso');
            }
          } else {
            console.log('No hay datos personales existentes para cargar');
          }
        } else {
          console.log('Error en la respuesta del backend datos personales:', response);
        }
      } else {
        console.log('No se encontro currentSolicitudId para cargar datos personales');
      }
    } catch (err) {
      console.error('Error cargando datos personales:', err);
      setError('Error al cargar los datos personales existentes');
    } finally {
      setLoading(false);
    }
  };

  const cargarArchivoDNI = async (archivoId, side) => {
    try {
      console.log('Obteniendo archivo con ID:', archivoId);
      const response = await authenticationService.getArchivo(archivoId);
      
      if (response && response.ok) {
        console.log('Archivo cargado exitosamente:', response);
        console.log('Filename obtenido:', response.filename);
        
        // Crear un objeto de archivo para mostrar en la interfaz
        const archivoExistente = {
          id: archivoId,
          name: response.filename || 'DNI.pdf',
          size: response.blob.size,
          type: response.blob.type,
          url: response.url,
          side
        };
        
        setUploadedFiles(prev => {
          const filtered = prev.filter(file => file.side !== side);
          const updated = [...filtered, archivoExistente];
          console.log('Archivo agregado a uploadedFiles:', archivoExistente);
          return updated;
        });
      } else {
        console.error('Error al cargar el archivo:', response);
      }
    } catch (error) {
      console.error('Error al cargar el archivo DNI:', error);
    }
  };

  const validateFechaNacimiento = (fecha) => {
    if (!fecha) return true; // No validar si está vacío
    
    const fechaNacimiento = new Date(fecha);
    const hoy = new Date();
    const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mes = hoy.getMonth() - fechaNacimiento.getMonth();
    
    // Ajustar si aún no cumplió años este año
    const edadReal = mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate()) ? edad - 1 : edad;
    
    if (edadReal < 18) {
      setFechaNacimientoError('Debe ser mayor de 18 años');
      return false;
    } else {
      setFechaNacimientoError('');
      return true;
    }
  };

  // Función pura para validar email sin actualizar estado (para usar en isFormValid)
  const isEmailValid = (email) => {
    if (!email) {
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Función que valida y actualiza el estado (para usar en handleInputChange)
  const validateEmail = (email) => {
    if (!email) {
      setEmailError('');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Ingrese un correo electrónico válido');
      return false;
    } else {
      setEmailError('');
      return true;
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
    
    // Validar email si es ese campo
    if (field === 'correoElectronico') {
      validateEmail(value);
    }
    
    // Validar fecha de nacimiento si es ese campo
    if (field === 'fechaNacimiento') {
      validateFechaNacimiento(value);
    }
  };

  const handleConyugeChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      conyuge: {
        ...prev.conyuge,
        [field]: value
      }
    }));
    
  };


  const handleDNIChange = (value) => {
    // Solo permitir números
    const numericValue = value.replace(/[^0-9]/g, '');
    handleInputChange('idNumero', numericValue);
  };

  const handleConyugeDNIChange = (value) => {
    // Solo permitir números para DNI del cónyuge
    const numericValue = value.replace(/[^0-9]/g, '');
    handleConyugeChange('idNumero', numericValue);
  };

  const isFormValid = () => {
    // Validar campos requeridos de datos principales
    const datosPrincipalesValidos = 
      formData.nombres.trim() !== '' &&
      formData.apellidos.trim() !== '' &&
      formData.celular.trim() !== '' &&
      formData.correoElectronico.trim() !== '' &&
      formData.comoNosConocio.trim() !== '' &&
      !emailError &&
      isEmailValid(formData.correoElectronico);
    
    // Validar campos requeridos de datos personales
    const camposRequeridos = [
      formData.tipoID,
      formData.idNumero,
      formData.fechaNacimiento,
      formData.lugarNacimiento,
      formData.nacionalidad,
      formData.paisOrigen,
      formData.paisResidencia,
      formData.actividad,
      formData.sexo,
      formData.estadoCivil
    ];

    // Verificar que todos los campos requeridos estén completos
    const camposCompletos = camposRequeridos.every(campo => campo && campo.trim() !== '');
    
    // Verificar que no haya errores de validación
    const sinErrores = !fechaNacimientoError && !emailError;
    
    // Verificar que se haya subido al menos un archivo DNI
    const archivoSubido = formData.dniFrenteArchivoId !== null;
    
    // Si está casado, validar también los campos del cónyuge
    let conyugeValido = true;
    if (formData.estadoCivil === 'CASADO') {
      const camposConyuge = [
        formData.conyuge.nombres,
        formData.conyuge.apellidos,
        formData.conyuge.tipoID,
        formData.conyuge.idNumero,
        formData.conyuge.tipoClaveFiscal,
        formData.conyuge.claveFiscal
      ];
      conyugeValido = camposConyuge.every(campo => campo && campo.trim() !== '');
    }
    
    return datosPrincipalesValidos && camposCompletos && sinErrores && archivoSubido && conyugeValido;
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    // Validar tamaño de archivos antes de procesar
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`El archivo "${file.name}" excede el límite de 10MB. Por favor, selecciona un archivo más pequeño.`);
        event.target.value = null;
        return;
      }
    }

    const availableSides = [];
    if (!formData.dniFrenteArchivoId) availableSides.push('frente');
    if (!formData.dniReversoArchivoId) availableSides.push('reverso');

    if (availableSides.length === 0) {
      setError('Ya cargaste el frente y dorso del DNI. Eliminá un archivo para volver a subir.');
      event.target.value = null;
      return;
    }

    const filesToUpload = files.slice(0, availableSides.length);

    if (filesToUpload.length < files.length) {
      setError('Solo podés subir hasta dos archivos (frente y dorso). Se tomarán los primeros archivos seleccionados.');
    }

    setUploadingFiles(true);
    try {
      const uploadedResults = [];

      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        const side = availableSides[i];

        const uploadData = new FormData();
        uploadData.append('file', file);
        
        const apiUrl = env.REACT_APP_API_URL;
        const response = await fetch(`${apiUrl}/api/archivos/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: uploadData
        });

        if (!response.ok) {
          throw new Error(`Error uploading ${file.name}`);
        }

        const result = await response.json();
        const fileId = result.id || result.dniArchivoId || result.archivoId;

        if (!fileId) {
          throw new Error('No se pudo obtener el ID del archivo subido');
        }

        uploadedResults.push({
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          side
        });
      }

      setFormData(prev => {
        const newData = { ...prev };
        uploadedResults.forEach(result => {
          if (result.side === 'frente') {
            newData.dniFrenteArchivoId = result.id;
          } else if (result.side === 'reverso') {
            newData.dniReversoArchivoId = result.id;
          }
        });
        return newData;
      });

      setUploadedFiles(prev => {
        let updated = [...prev];
        uploadedResults.forEach(result => {
          updated = updated.filter(file => file.side !== result.side);
          updated.push(result);
        });
        return updated;
      });

      setError(prev => {
        if (!prev) return prev;
        const lower = prev.toLowerCase();
        if (lower.includes('archivo') || lower.includes('dni')) {
          return '';
        }
        return prev;
      });
    } catch (err) {
      console.error('Error uploading files:', err);
      setError('Error al subir los archivos');
    } finally {
      setUploadingFiles(false);
      event.target.value = null;
    }
  };

  const removeFile = (fileId) => {
    const fileToRemove = uploadedFiles.find(file => file.id === fileId);
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    
    if (fileToRemove) {
      setFormData(prev => ({
        ...prev,
        ...(fileToRemove.side === 'frente'
          ? { dniFrenteArchivoId: null }
          : { dniReversoArchivoId: null })
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      setError('Por favor complete todos los campos requeridos y corrija los errores.');
      return;
    }
    
    if (!formData.dniFrenteArchivoId) {
      setError('Debe subir al menos el frente del DNI');
      return;
    }

    // Validar edad antes de enviar
    if (!validateFechaNacimiento(formData.fechaNacimiento)) {
      setError('Debe ser mayor de 18 años para continuar');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const currentUser = authenticationService.currentUserValue;
      const currentSolicitudId = localStorage.getItem('currentSolicitudId');
      
      if (!currentUser || !currentUser.id || !currentSolicitudId) {
        setError('Error: Usuario o solicitud no encontrados');
        setLoading(false);
        return;
      }

      // Guardar datos principales primero
      const datosPrincipalesParaGuardar = {
        solicitudId: parseInt(currentSolicitudId),
        idUsuario: currentUser.id,
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        celular: formData.celular,
        correoElectronico: formData.correoElectronico,
        comoNosConocio: formData.comoNosConocio
      };
      
      const datosPrincipalesResponse = await authenticationService.saveDatosPrincipalesIndividuo(datosPrincipalesParaGuardar);
      
      if (!datosPrincipalesResponse || !(datosPrincipalesResponse.status === 200 || datosPrincipalesResponse.ok)) {
        setError('Error al guardar los datos principales');
        setLoading(false);
        return;
      }

      // Luego guardar datos personales
      const dataToSave = {
        tipoID: formData.tipoID,
        idNumero: formData.idNumero,
        fechaNacimiento: formData.fechaNacimiento,
        lugarNacimiento: formData.lugarNacimiento,
        nacionalidad: formData.nacionalidad,
        paisOrigen: formData.paisOrigen,
        paisResidencia: formData.paisResidencia,
        actividad: formData.actividad,
        sexo: formData.sexo,
        estadoCivil: formData.estadoCivil,
        dniFrenteArchivoId: formData.dniFrenteArchivoId,
        dniReversoArchivoId: formData.dniReversoArchivoId,
        conyuge: formData.conyuge,
        solicitudId: parseInt(currentSolicitudId)
      };

      const response = await authenticationService.saveDatosPersonalesIndividuo(dataToSave);
      
      if (response && (response.status === 200 || response.ok)) {
        // Redirigir a la siguiente pantalla
        history.push('/apertura/individuo/domicilio');
      } else {
        setError('Error al guardar los datos personales');
      }
    } catch (err) {
      console.error('Error saving datos personales:', err);
      setError('Error al guardar los datos personales');
    } finally {
      setLoading(false);
    }
  };

  const tipoIDOptions = [
    { value: 'DNI', label: 'DNI' },
    { value: 'LC', label: 'Libreta Cívica' },
    { value: 'LE', label: 'Libreta de Enrolamiento' },
    { value: 'PAS', label: 'Pasaporte' },
    { value: 'EXT', label: 'Cédula Extranjera' }
  ];

  const sexoOptions = [
    { value: 'MASCULINO', label: 'Masculino' },
    { value: 'FEMENINO', label: 'Femenino' },
    { value: 'NO_BINARIO', label: 'No Binario' }
  ];

  const estadoCivilOptions = [
    { value: 'SOLTERO', label: 'Soltero' },
    { value: 'CASADO', label: 'Casado' },
    { value: 'DIVORCIADO', label: 'Divorciado' },
    { value: 'VIUDO', label: 'Viudo' },
    { value: 'CONCUBINATO', label: 'Concubinato' }, 
    { value: 'SEPARADO', label: 'Separado' }
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

  const tipoClaveFiscalOptions = [
    { value: 'CUIT', label: 'CUIT' },
    { value: 'CUIL', label: 'CUIL' },
    { value: 'CDI', label: 'CDI' }
  ];

  if (loading && !formData.idNumero) {
    return (
      <Container maxWidth="md" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
      >
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          style={{ 
            color: 'var(--light-blue)',
            fontWeight: 'bold',
            marginBottom: '1rem'
          }}
        >
          Datos Personales
        </Typography>

        {error && (
          <Card style={{ 
            marginBottom: '1rem', 
            width: '100%', 
            maxWidth: '600px',
            backgroundColor: '#ffebee',
            border: '1px solid #f44336'
          }}>
            <CardContent style={{ padding: '1rem' }}>
              <Typography variant="body2" style={{ color: '#d32f2f', textAlign: 'center' }}>
                {error}
              </Typography>
            </CardContent>
          </Card>
        )}

        <Card style={{ width: '100%', maxWidth: '800px' }}>
          <CardContent style={{ padding: '2rem' }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined" required>
                    <InputLabel>Tipo de Documento</InputLabel>
                    <Select
                      value={formData.tipoID}
                      onChange={(e) => handleInputChange('tipoID', e.target.value)}
                      label="Tipo de Documento"
                    >
                      {tipoIDOptions.map((option) => (
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
                    label="Número de Documento"
                    value={formData.idNumero}
                    onChange={(e) => handleDNIChange(e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nombres"
                    required
                    value={formData.nombres}
                    onChange={(e) => handleInputChange('nombres', e.target.value)}
                    variant="outlined"
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
                    type="tel"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Correo Electrónico"
                    required
                    value={formData.correoElectronico}
                    onChange={(e) => handleInputChange('correoElectronico', e.target.value)}
                    variant="outlined"
                    type="email"
                    error={!!emailError}
                    helperText={emailError}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Fecha de Nacimiento"
                    type="date"
                    value={formData.fechaNacimiento}
                    onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    error={!!fechaNacimientoError}
                    helperText={fechaNacimientoError}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Lugar de Nacimiento"
                    value={formData.lugarNacimiento}
                    onChange={(e) => handleInputChange('lugarNacimiento', e.target.value)}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Nacionalidad</InputLabel>
                    <Select
                      value={formData.nacionalidad}
                      onChange={(e) => handleInputChange('nacionalidad', e.target.value)}
                      label="Nacionalidad"
                    >
                      {paisesOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>País de Origen</InputLabel>
                    <Select
                      value={formData.paisOrigen}
                      onChange={(e) => handleInputChange('paisOrigen', e.target.value)}
                      label="País de Origen"
                    >
                      {paisesOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
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
                      {paisesOptions.map((option) => (
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
                    label="Actividad"
                    value={formData.actividad}
                    onChange={(e) => handleInputChange('actividad', e.target.value)}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Sexo</InputLabel>
                    <Select
                      value={formData.sexo}
                      onChange={(e) => handleInputChange('sexo', e.target.value)}
                      label="Sexo"
                    >
                      {sexoOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Estado Civil</InputLabel>
                    <Select
                      value={formData.estadoCivil}
                      onChange={(e) => handleInputChange('estadoCivil', e.target.value)}
                      label="Estado Civil"
                    >
                      {estadoCivilOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="¿Cómo nos conoció?"
                    required
                    value={formData.comoNosConocio}
                    onChange={(e) => handleInputChange('comoNosConocio', e.target.value)}
                    variant="outlined"
                    multiline
                    rows={3}
                    placeholder="Ej: Google, Redes sociales, Referencia de un amigo, etc."
                  />
                </Grid>

                <Grid item xs={12}>
                  <input
                    accept="image/*,.pdf"
                    style={{ display: 'none' }}
                    id="dni-upload"
                    multiple
                    type="file"
                    onChange={handleFileUpload}
                    capture="environment"
                  />
                  <label htmlFor="dni-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUpload />}
                      disabled={uploadingFiles}
                      style={{ 
                        width: '100%',
                        padding: '1rem',
                        border: '2px dashed #ccc'
                      }}
                    >
                      {uploadingFiles ? 'Subiendo...' : 'Subir DNI (Frente y dorso, máximo 2 archivos)'}
                    </Button>
                  </label>
                  <Typography variant="caption" display="block" style={{ marginTop: '0.5rem', color: '#666' }}>
                    Formatos permitidos: JPG, PNG, PDF. En móvil se abrirá la cámara. Si subís un solo archivo se tomará como frente.
                  </Typography>
                  <Typography variant="caption" display="block" style={{ marginTop: '0.5rem', color: '#666' }}>
                    Límite de tamaño: 10MB por archivo
                  </Typography>
                </Grid>

                {/* Archivos Subidos */}
                {uploadedFiles.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" style={{ marginBottom: '0.5rem' }}>
                      Archivos subidos:
                    </Typography>
                    {uploadedFiles
                      .slice()
                      .sort((a, b) => {
                        const order = { frente: 0, reverso: 1 };
                        return (order[a.side] || 0) - (order[b.side] || 0);
                      })
                      .map((file) => {
                        const sideLabel = file.side === 'frente' ? 'Frente' : 'Reverso';
                        return (
                          <Chip
                            key={`${file.side}-${file.id}`}
                            label={`${sideLabel}: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`}
                            onDelete={() => removeFile(file.id)}
                            deleteIcon={<Delete />}
                            style={{ margin: '0.25rem' }}
                          />
                        );
                      })}
                  </Grid>
                )}

                {/* Datos del Cónyuge - Solo si está casado */}
                {formData.estadoCivil === 'CASADO' && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="h6" style={{ marginBottom: '1rem', color: 'var(--light-blue)', marginTop: '2rem' }}>
                        Datos del Cónyuge
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        label="Nombres del Cónyuge"
                        value={formData.conyuge.nombres}
                        onChange={(e) => handleConyugeChange('nombres', e.target.value)}
                        required
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        label="Apellidos del Cónyuge"
                        value={formData.conyuge.apellidos}
                        onChange={(e) => handleConyugeChange('apellidos', e.target.value)}
                        required
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth variant="outlined" required>
                        <InputLabel>Tipo de Documento</InputLabel>
                        <Select
                          value={formData.conyuge.tipoID}
                          onChange={(e) => handleConyugeChange('tipoID', e.target.value)}
                          label="Tipo de Documento"
                          required
                        >
                          {tipoIDOptions.map((option) => (
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
                        label="Número de Documento"
                        value={formData.conyuge.idNumero}
                        onChange={(e) => handleConyugeDNIChange(e.target.value)}
                        required
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth variant="outlined" required>
                        <InputLabel>Tipo de Clave Fiscal</InputLabel>
                        <Select
                          value={formData.conyuge.tipoClaveFiscal}
                          onChange={(e) => handleConyugeChange('tipoClaveFiscal', e.target.value)}
                          label="Tipo de Clave Fiscal"
                          required
                        >
                          {tipoClaveFiscalOptions.map((option) => (
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
                        value={formData.conyuge.claveFiscal}
                        onChange={(e) => handleConyugeChange('claveFiscal', e.target.value)}
                        required
                      />
                    </Grid>
                  </>
                )}

                {/* Botones */}
                <Grid item xs={12} style={{ marginTop: '2rem' }}>
                  <Box display="flex" justifyContent="center" className="navigation-buttons">
                    <Button
                      variant="outlined"
                      startIcon={<ArrowBack />}
                      onClick={() => history.push('/tipo-apertura')}
                      className="navigation-button"
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
                        color: 'white'
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

export default DatosPersonalesPage;
