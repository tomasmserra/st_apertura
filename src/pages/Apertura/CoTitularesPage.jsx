import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Step,
  StepLabel,
  Stepper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme
} from '@material-ui/core';
import { Add, Delete, Edit, CloudUpload } from '@material-ui/icons';
import { authenticationService, firmantesService, empresaService } from '../../services';
import env from '../../config/env';

const steps = ['Datos Personales', 'Domicilio', 'Datos Fiscales', 'Declaraciones'];

const initialFormData = {
  id: null,
  datosPrincipales: {
    nombres: '',
    apellidos: '',
    celular: '',
    correoElectronico: '',
    porcentajeParticipacion: ''
  },
  datosPersonales: {
    id: null,
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
      id: null,
      nombres: '',
      apellidos: '',
      tipoID: 'DNI',
      idNumero: '',
      tipoClaveFiscal: 'CUIT',
      claveFiscal: ''
    }
  },
  domicilio: {
    id: null,
    tipo: 'LEGAL',
    calle: '',
    numero: '',
    piso: '',
    depto: '',
    barrio: '',
    ciudad: '',
    provincia: '',
    pais: 'ARGENTINA',
    cp: ''
  },
  datosFiscales: {
    id: null,
    tipo: 'CUIT',
    claveFiscal: '',
    tipoIva: 'CONSUMIDOR_FINAL',
    tipoGanancia: 'NO_INSCRIPTO',
    residenciaFiscal: 'ARGENTINA',
    debeCompletarFiscalExterior: false
  },
  declaraciones: {
    esPep: false,
    motivoPep: '',
    esFATCA: false,
    motivoFatca: '',
    declaraUIF: false,
    motivoUIF: ''
  }
};

const tipoDocumentoOptions = [
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

const tipoFiscalOptions = [
  'CUIT',
  'CUIL',
  'CDI',
  'NIF',
  'NIE',
  'CIF',
  'RUT',
  'RUN',
  'NIT',
  'SAT',
  'RFC',
  'NSS',
  'SSN',
  'TIN',
  'TaxID',
  'CPF',
  'DUI',
  'RTU',
  'Otro'
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

const CoTitularesPage = ({
  title = 'Co-Titulares',
  entitySingular = 'Co-Titular',
  entityPlural = 'Co-Titulares',
  addButtonLabel,
  addTitle,
  editTitle,
  saveButtonLabel,
  emptyStateMessage,
  tipoFirmante = 'CO_TITULAR',
  finalizeButtonLabel,
  finalizePath = '/apertura/fin',
  backPath = null,
  listKey = 'firmantes',
  fetchService,
  createService,
  updateService,
  deleteService,
  showPorcentajeParticipacion = false,
  headerMessage = null
} = {}) => {
  const entityLowerSingular = entitySingular.toLowerCase();
  const entityLowerPlural = entityPlural.toLowerCase();
  const resolvedAddButtonLabel = addButtonLabel || `Agregar ${entitySingular}`;
  const resolvedEditTitle = editTitle || `Editar ${entitySingular}`;
  const resolvedAddTitle = addTitle || `Agregar ${entitySingular}`;
  const resolvedSaveButtonLabel = saveButtonLabel || `Guardar ${entitySingular}`;
  const resolvedEmptyStateMessage =
    emptyStateMessage ||
    `Aún no registraste ${entityLowerPlural}. Utilizá el botón "${resolvedAddButtonLabel}" para comenzar.`;
  const resolvedFinalizeButtonLabel = finalizeButtonLabel || 'Finalizar';
  const history = useHistory();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [firmantes, setFirmantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState(initialFormData);
  const [editingFirmanteId, setEditingFirmanteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [buscandoAccionista, setBuscandoAccionista] = useState(false);
  const [provincias, setProvincias] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [provinciaSeleccionadaId, setProvinciaSeleccionadaId] = useState(null);
  const [uploadedDniFiles, setUploadedDniFiles] = useState([]);
  const [uploadingDniFiles, setUploadingDniFiles] = useState(false);

  const solicitudId = useMemo(() => localStorage.getItem('currentSolicitudId'), []);

  const fetchFn = useCallback(
    (id) => (fetchService ? fetchService(id) : firmantesService.getFirmantes(id)),
    [fetchService]
  );

  const createFn = useCallback(
    (id, payload) => (createService ? createService(id, payload) : firmantesService.createFirmante(id, payload)),
    [createService]
  );

  const updateFn = useCallback(
    (id, firmanteId, payload) =>
      updateService ? updateService(id, firmanteId, payload) : firmantesService.updateFirmante(id, firmanteId, payload),
    [updateService]
  );

  const deleteFn = useCallback(
    (id, firmanteId) =>
      deleteService ? deleteService(id, firmanteId) : firmantesService.deleteFirmante(id, firmanteId),
    [deleteService]
  );

  const cargarFirmantes = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      if (!solicitudId) {
        setError('No se encontró el identificador de la solicitud.');
        return;
      }

      const response = await fetchFn(solicitudId);

      let success = false;
      let lista = [];

      if (Array.isArray(response)) {
        success = true;
        lista = response;
      } else if (response && (response.status === 200 || response.status === 204 || response.ok)) {
        success = true;
        lista = response[listKey] || response.firmantes || response.accionistas || [];
      }

      if (success) {
        setFirmantes(lista);
        setError('');
      } else {
        setError(`Error al obtener los ${entityLowerPlural}.`);
      }
    } catch (err) {
      console.error(`Error cargando ${entityLowerPlural}:`, err);
      setError(`Error al cargar los ${entityLowerPlural}.`);
    } finally {
      setLoading(false);
    }
  }, [solicitudId, entityLowerPlural, fetchFn, listKey]);

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
      cargarFirmantes();
    }
  }, [history, cargarFirmantes]);

  // Cargar provincias al montar el componente
  useEffect(() => {
    const cargarProvincias = async () => {
      try {
        const provinciasData = await empresaService.getProvincias();
        if (Array.isArray(provinciasData) && provinciasData.length > 0) {
          setProvincias(provinciasData);
        } else {
          setProvincias([]);
        }
      } catch (err) {
        console.error('Error cargando provincias:', err);
        setProvincias([]);
      }
    };
    cargarProvincias();
  }, []);

  // Cargar localidades cuando se selecciona una provincia
  useEffect(() => {
    const cargarLocalidades = async () => {
      if (provinciaSeleccionadaId) {
        try {
          const localidadesData = await empresaService.getLocalidades(provinciaSeleccionadaId);
          setLocalidades(localidadesData || []);
        } catch (err) {
          console.error('Error cargando localidades:', err);
          setLocalidades([]);
        }
      } else {
        setLocalidades([]);
      }
    };
    cargarLocalidades();
  }, [provinciaSeleccionadaId]);

  // Inicializar provincia seleccionada cuando se cargan los datos y las provincias están disponibles
  useEffect(() => {
    const inicializarProvincia = async () => {
      if (formData.domicilio.provincia && provincias.length > 0 && !provinciaSeleccionadaId) {
        const provinciaEncontrada = provincias.find(p => p.codigoUIF === formData.domicilio.provincia);
        if (provinciaEncontrada) {
          setProvinciaSeleccionadaId(provinciaEncontrada.id);
          // Cargar las localidades de esa provincia
          try {
            const localidadesData = await empresaService.getLocalidades(provinciaEncontrada.id);
            setLocalidades(localidadesData || []);
          } catch (err) {
            console.error('Error cargando localidades:', err);
          }
        }
      }
    };
    inicializarProvincia();
  }, [formData.domicilio.provincia, provincias, provinciaSeleccionadaId]);

  const handleOpenCrear = () => {
    setFormData(initialFormData);
    setActiveStep(0);
    setEditingFirmanteId(null);
    setFormError('');
    setProvinciaSeleccionadaId(null);
    setLocalidades([]);
    setUploadedDniFiles([]);
    setFormOpen(true);
  };

  const normalizarDatos = (firmante) => {
    if (!firmante) return initialFormData;

    const datosPrincipales = firmante.datosPrincipales || {};
    const datosPersonales = firmante.datosPersonales || {};
    const domicilio = firmante.domicilio || {};
    const datosFiscales = firmante.datosFiscales || {};
    const declaraciones = firmante.declaraciones || {};
    const conyuge = (datosPersonales.conyuge || firmante.conyuge) || {};

    return {
      id: firmante.id || null,
      datosPrincipales: {
        nombres: datosPrincipales.nombres ?? firmante.nombres ?? '',
        apellidos: datosPrincipales.apellidos ?? firmante.apellidos ?? '',
        celular: datosPrincipales.celular ?? firmante.celular ?? '',
        correoElectronico: datosPrincipales.correoElectronico ?? firmante.correoElectronico ?? '',
        porcentajeParticipacion: datosPrincipales.porcentajeParticipacion ?? firmante.porcentajeParticipacion ?? firmante.porcentaje ?? ''
      },
      datosPersonales: {
        id: datosPersonales.id ?? null,
        tipoID: datosPersonales.tipoID ?? firmante.tipoID ?? 'DNI',
        idNumero: datosPersonales.idNumero ?? firmante.idNumero ?? '',
        fechaNacimiento: datosPersonales.fechaNacimiento ?? firmante.fechaNacimiento ?? '',
        lugarNacimiento: datosPersonales.lugarNacimiento ?? firmante.lugarNacimiento ?? '',
        nacionalidad: datosPersonales.nacionalidad ?? firmante.nacionalidad ?? 'ARGENTINA',
        paisOrigen: datosPersonales.paisOrigen ?? firmante.paisOrigen ?? 'ARGENTINA',
        paisResidencia: datosPersonales.paisResidencia ?? firmante.paisResidencia ?? 'ARGENTINA',
        actividad: datosPersonales.actividad ?? firmante.actividad ?? '',
        sexo: datosPersonales.sexo ?? firmante.sexo ?? 'MASCULINO',
        estadoCivil: datosPersonales.estadoCivil ?? firmante.estadoCivil ?? 'SOLTERO',
        dniFrenteArchivoId: datosPersonales.dniFrenteArchivoId ?? firmante.dniFrenteArchivoId ?? null,
        dniReversoArchivoId: datosPersonales.dniReversoArchivoId ?? firmante.dniReversoArchivoId ?? null,
        conyuge: {
          id: conyuge.id ?? null,
          nombres: conyuge.nombres ?? '',
          apellidos: conyuge.apellidos ?? '',
          tipoID: conyuge.tipoID ?? 'DNI',
          idNumero: conyuge.idNumero ?? '',
          tipoClaveFiscal: conyuge.tipoClaveFiscal ?? 'CUIT',
          claveFiscal: conyuge.claveFiscal ?? ''
        }
      },
      domicilio: {
        id: domicilio.id ?? null,
        tipo: domicilio.tipo ?? 'LEGAL',
        calle: domicilio.calle ?? '',
        numero: domicilio.numero ?? '',
        piso: domicilio.piso ?? '',
        depto: domicilio.depto ?? '',
        barrio: domicilio.barrio ?? '',
        ciudad: domicilio.ciudad ?? '',
        provincia: domicilio.provincia ?? '',
        pais: domicilio.pais ?? 'ARGENTINA',
        cp: domicilio.cp ?? ''
      },
      datosFiscales: {
        id: datosFiscales.id ?? null,
        tipo: datosFiscales.tipo ?? 'CUIT',
        claveFiscal: datosFiscales.claveFiscal ?? '',
        tipoIva: datosFiscales.tipoIva ?? 'CONSUMIDOR_FINAL',
        tipoGanancia: datosFiscales.tipoGanancia ?? 'NO_INSCRIPTO',
        residenciaFiscal: datosFiscales.residenciaFiscal ?? 'ARGENTINA',
        debeCompletarFiscalExterior:
          datosFiscales.debeCompletarFiscalExterior ??
          firmante.debeCompletarFiscalExterior ??
          false
      },
      declaraciones: {
        esPep: declaraciones.esPep ?? firmante.esPep ?? false,
        motivoPep: declaraciones.motivoPep ?? firmante.motivoPep ?? '',
        esFATCA: declaraciones.esFATCA ?? firmante.esFATCA ?? false,
        motivoFatca: declaraciones.motivoFatca ?? firmante.motivoFatca ?? '',
        declaraUIF: declaraciones.declaraUIF ?? firmante.declaraUIF ?? false,
        motivoUIF: declaraciones.motivoUIF ?? firmante.motivoUIF ?? ''
      }
    };
  };

  const handleOpenEditar = (firmante) => {
    const normalizado = normalizarDatos(firmante);
    setFormData(normalizado);
    setEditingFirmanteId(normalizado.id);
    setActiveStep(0);
    setFormError('');
    // Limpiar provincia seleccionada para que se recargue si existe
    setProvinciaSeleccionadaId(null);
    setLocalidades([]);
    // Limpiar y cargar archivos de DNI existentes
    setUploadedDniFiles([]);
    if (normalizado.datosPersonales.dniFrenteArchivoId) {
      cargarArchivoDNI(normalizado.datosPersonales.dniFrenteArchivoId, 'frente');
    }
    if (normalizado.datosPersonales.dniReversoArchivoId) {
      cargarArchivoDNI(normalizado.datosPersonales.dniReversoArchivoId, 'reverso');
    }
    setFormOpen(true);
  };

  const handleCancelForm = () => {
    if (loading) return;
    setFormOpen(false);
    setFormData(initialFormData);
    setEditingFirmanteId(null);
    setActiveStep(0);
    setFormError('');
    setSaving(false);
    setProvinciaSeleccionadaId(null);
    setLocalidades([]);
    setUploadedDniFiles([]);
  };

  const handleFieldChange = async (path, value) => {
    setFormData((prev) => {
      const newData = { ...prev };
      let current = newData;
      for (let i = 0; i < path.length - 1; i += 1) {
        const key = path[i];
        current[key] = { ...current[key] };
        current = current[key];
      }
      current[path[path.length - 1]] = value;
      return newData;
    });

    // Si es firmante de empresa y se está cambiando el número de documento, verificar si existe como accionista
    if (
      tipoFirmante === 'FIRMANTE' &&
      path.length === 2 &&
      path[0] === 'datosPersonales' &&
      path[1] === 'idNumero' &&
      value &&
      value.trim() !== '' &&
      solicitudId &&
      !editingFirmanteId // Solo buscar si es un nuevo firmante, no al editar
    ) {
      verificarAccionistaPorDocumento(value.trim());
    }
  };

  const verificarAccionistaPorDocumento = async (numeroDocumento) => {
    if (!solicitudId || !numeroDocumento || numeroDocumento.length < 7) {
      // Solo buscar si el documento tiene al menos 7 caracteres para evitar búsquedas muy tempranas
      return;
    }

    try {
      setBuscandoAccionista(true);
      setFormError('');
      
      const response = await empresaService.getAccionistaPorDocumento(solicitudId, numeroDocumento);
      
      if (response && response.ok && response.status === 200) {
        // El accionista existe, cargar sus datos en el formulario
        console.log('Accionista encontrado:', response);
        
        // Normalizar los datos del accionista al formato de firmante
        const accionistaData = normalizarDatosAccionista(response);
        
        // Preservar los datos que el usuario pudo haber ingresado mientras se buscaba
        // IMPORTANTE: Siempre usar el valor más reciente del formData para idNumero
        setFormData((prevFormData) => {
          // El formData ya tiene el valor más reciente que el usuario ingresó (incluyendo el 7º dígito)
          // porque handleFieldChange lo actualizó ANTES de llamar a esta función
          const idNumeroDelUsuario = prevFormData.datosPersonales.idNumero || '';
          
          return {
            ...accionistaData,
            datosPrincipales: {
              ...accionistaData.datosPrincipales,
              // Si el usuario ya ingresó datos principales, mantenerlos (prioridad al usuario)
              nombres: prevFormData.datosPrincipales.nombres || accionistaData.datosPrincipales.nombres || '',
              apellidos: prevFormData.datosPrincipales.apellidos || accionistaData.datosPrincipales.apellidos || '',
              celular: prevFormData.datosPrincipales.celular || accionistaData.datosPrincipales.celular || '',
              correoElectronico: prevFormData.datosPrincipales.correoElectronico || accionistaData.datosPrincipales.correoElectronico || '',
              porcentajeParticipacion: prevFormData.datosPrincipales.porcentajeParticipacion || accionistaData.datosPrincipales.porcentajeParticipacion || ''
            },
            datosPersonales: {
              ...accionistaData.datosPersonales,
              // SIEMPRE usar el valor del formData (el más reciente que el usuario ingresó)
              // Esto evita borrar el 7º dígito o cualquier otro dígito que el usuario haya escrito
              idNumero: idNumeroDelUsuario || numeroDocumento
            }
          };
        });
        
        // Mostrar un mensaje informativo
        setFormError('');
      } else {
        // No existe o hubo un error, no hacer nada (mantener todos los datos que el usuario ingresó)
        console.log('Accionista no encontrado para el documento:', numeroDocumento);
        // No tocamos el formData, así que todos los datos que el usuario ingresó se mantienen intactos
      }
    } catch (err) {
      console.error('Error verificando accionista por documento:', err);
      // En caso de error, no interrumpir el flujo del usuario ni modificar ningún dato
    } finally {
      setBuscandoAccionista(false);
    }
  };

  const normalizarDatosAccionista = (accionista) => {
    if (!accionista || accionista.tipo !== 'PERSONA' || !accionista.datosPersona) {
      return { ...initialFormData };
    }

    const datosPersona = accionista.datosPersona;
    const datosPrincipales = datosPersona.datosPrincipales || {};
    const datosPersonales = datosPersona.datosPersonales || {};
    const domicilio = datosPersona.domicilio || {};
    const datosFiscales = datosPersona.datosFiscales || {};
    const declaraciones = datosPersona.declaraciones || {};
    const conyuge = datosPersonales.conyuge || {};

    return {
      id: null, // Nuevo firmante, no tiene ID aún
      datosPrincipales: {
        nombres: datosPrincipales.nombres || '',
        apellidos: datosPrincipales.apellidos || '',
        celular: datosPrincipales.celular || '',
        correoElectronico: datosPrincipales.correoElectronico || '',
        porcentajeParticipacion: '' // No transferir porcentaje de participación
      },
      datosPersonales: {
        id: datosPersonales.id || null,
        tipoID: datosPersonales.tipoID || 'DNI',
        idNumero: datosPersonales.idNumero || '',
        fechaNacimiento: datosPersonales.fechaNacimiento || '',
        lugarNacimiento: datosPersonales.lugarNacimiento || '',
        nacionalidad: datosPersonales.nacionalidad || 'ARGENTINA',
        paisOrigen: datosPersonales.paisOrigen || 'ARGENTINA',
        paisResidencia: datosPersonales.paisResidencia || 'ARGENTINA',
        actividad: datosPersonales.actividad || '',
        sexo: datosPersonales.sexo || 'MASCULINO',
        estadoCivil: datosPersonales.estadoCivil || 'SOLTERO',
        dniFrenteArchivoId: datosPersonales.dniFrenteArchivoId || null,
        dniReversoArchivoId: datosPersonales.dniReversoArchivoId || null,
        conyuge: {
          id: conyuge.id || null,
          nombres: conyuge.nombres || '',
          apellidos: conyuge.apellidos || '',
          tipoID: conyuge.tipoID || 'DNI',
          idNumero: conyuge.idNumero || '',
          tipoClaveFiscal: conyuge.tipoClaveFiscal || 'CUIT',
          claveFiscal: conyuge.claveFiscal || ''
        }
      },
      domicilio: {
        id: domicilio.id || null,
        tipo: domicilio.tipo || 'LEGAL',
        calle: domicilio.calle || '',
        numero: domicilio.numero || '',
        piso: domicilio.piso || '',
        depto: domicilio.depto || '',
        barrio: domicilio.barrio || '',
        ciudad: domicilio.ciudad || '',
        provincia: domicilio.provincia || '',
        pais: domicilio.pais || 'ARGENTINA',
        cp: domicilio.cp || ''
      },
      datosFiscales: {
        id: datosFiscales.id || null,
        tipo: datosFiscales.tipo || 'CUIT',
        claveFiscal: datosFiscales.claveFiscal || '',
        tipoIva: datosFiscales.tipoIva || 'CONSUMIDOR_FINAL',
        tipoGanancia: datosFiscales.tipoGanancia || 'NO_INSCRIPTO',
        residenciaFiscal: datosFiscales.residenciaFiscal || 'ARGENTINA',
        debeCompletarFiscalExterior: datosFiscales.debeCompletarFiscalExterior || false
      },
      declaraciones: {
        esPep: declaraciones.esPep || false,
        motivoPep: declaraciones.motivoPep || '',
        esFATCA: declaraciones.esFATCA || false,
        motivoFatca: declaraciones.motivoFatca || '',
        declaraUIF: declaraciones.declaraUIF || false,
        motivoUIF: declaraciones.motivoUIF || ''
      }
    };
  };

  const cargarArchivoDNI = async (archivoId, side) => {
    try {
      const response = await authenticationService.getArchivo(archivoId);
      
      if (response && response.ok) {
        const archivoExistente = {
          id: archivoId,
          name: response.filename || 'DNI.pdf',
          size: response.blob.size,
          type: response.blob.type,
          url: response.url,
          side
        };
        
        setUploadedDniFiles(prev => {
          const filtered = prev.filter(file => file.side !== side);
          return [...filtered, archivoExistente];
        });
      }
    } catch (error) {
      console.error('Error al cargar el archivo DNI:', error);
    }
  };

  const handleDniFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    // Validar tamaño de archivos antes de procesar
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        setFormError(`El archivo "${file.name}" excede el límite de 10MB. Por favor, selecciona un archivo más pequeño.`);
        event.target.value = null;
        return;
      }
    }

    const availableSides = [];
    if (!formData.datosPersonales.dniFrenteArchivoId) availableSides.push('frente');
    if (!formData.datosPersonales.dniReversoArchivoId) availableSides.push('reverso');

    if (availableSides.length === 0) {
      setFormError('Ya cargaste el frente y dorso del DNI. Eliminá un archivo para volver a subir.');
      event.target.value = null;
      return;
    }

    const filesToUpload = files.slice(0, availableSides.length);

    setUploadingDniFiles(true);
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
            newData.datosPersonales.dniFrenteArchivoId = result.id;
          } else if (result.side === 'reverso') {
            newData.datosPersonales.dniReversoArchivoId = result.id;
          }
        });
        return newData;
      });

      setUploadedDniFiles(prev => {
        let updated = [...prev];
        uploadedResults.forEach(result => {
          updated = updated.filter(file => file.side !== result.side);
          updated.push(result);
        });
        return updated;
      });

      setFormError('');
    } catch (err) {
      console.error('Error uploading files:', err);
      setFormError('Error al subir los archivos de DNI');
    } finally {
      setUploadingDniFiles(false);
      event.target.value = null;
    }
  };

  const removeDniFile = (fileId) => {
    const fileToRemove = uploadedDniFiles.find(file => file.id === fileId);
    setUploadedDniFiles(prev => prev.filter(file => file.id !== fileId));
    
    if (fileToRemove) {
      setFormData(prev => ({
        ...prev,
        datosPersonales: {
          ...prev.datosPersonales,
          ...(fileToRemove.side === 'frente'
            ? { dniFrenteArchivoId: null }
            : { dniReversoArchivoId: null })
        }
      }));
    }
  };

  const persistCurrentForm = async () => {
    if (!solicitudId) {
      setFormError('No se encontró el identificador de la solicitud.');
      return false;
    }

    let currentId = formData.id ?? editingFirmanteId ?? null;
    if (typeof currentId === 'string') {
      const parsed = Number(currentId);
      if (!Number.isNaN(parsed)) {
        currentId = parsed;
      }
    }
    const payload = {
      id: currentId,
      tipo: tipoFirmante,
      datosPrincipales: {
        ...formData.datosPrincipales,
        nombres: formData.datosPrincipales.nombres ?? '',
        apellidos: formData.datosPrincipales.apellidos ?? '',
        celular: formData.datosPrincipales.celular ?? '',
        correoElectronico: formData.datosPrincipales.correoElectronico ?? '',
        porcentajeParticipacion: formData.datosPrincipales.porcentajeParticipacion ?? ''
      },
      datosPersonales: {
        ...formData.datosPersonales,
        tipoID: formData.datosPersonales.tipoID ?? 'DNI',
        idNumero: formData.datosPersonales.idNumero ?? '',
        fechaNacimiento: formData.datosPersonales.fechaNacimiento ?? '',
        lugarNacimiento: formData.datosPersonales.lugarNacimiento ?? '',
        nacionalidad: formData.datosPersonales.nacionalidad ?? 'ARGENTINA',
        paisOrigen: formData.datosPersonales.paisOrigen ?? 'ARGENTINA',
        paisResidencia: formData.datosPersonales.paisResidencia ?? 'ARGENTINA',
        actividad: formData.datosPersonales.actividad ?? '',
        sexo: formData.datosPersonales.sexo ?? 'MASCULINO',
        estadoCivil: formData.datosPersonales.estadoCivil ?? 'SOLTERO',
        dniFrenteArchivoId: formData.datosPersonales.dniFrenteArchivoId ?? null,
        dniReversoArchivoId: formData.datosPersonales.dniReversoArchivoId ?? null,
        conyuge: formData.datosPersonales.estadoCivil === 'CASADO' ? {
          ...formData.datosPersonales.conyuge
        } : null
      },
      domicilio: {
        ...formData.domicilio,
        tipo: formData.domicilio.tipo ?? 'LEGAL',
        calle: formData.domicilio.calle ?? '',
        numero: formData.domicilio.numero ?? '',
        piso: formData.domicilio.piso ?? '',
        depto: formData.domicilio.depto ?? '',
        barrio: formData.domicilio.barrio ?? '',
        ciudad: formData.domicilio.ciudad ?? '',
        provincia: formData.domicilio.provincia ?? '',
        pais: formData.domicilio.pais ?? 'ARGENTINA',
        cp: formData.domicilio.cp ?? ''
      },
      datosFiscales: {
        ...formData.datosFiscales,
        tipo: formData.datosFiscales.tipo ?? 'CUIT',
        claveFiscal: formData.datosFiscales.claveFiscal ?? '',
        tipoIva: formData.datosFiscales.tipoIva ?? 'CONSUMIDOR_FINAL',
        tipoGanancia: formData.datosFiscales.tipoGanancia ?? 'NO_INSCRIPTO',
        residenciaFiscal: formData.datosFiscales.residenciaFiscal ?? 'ARGENTINA',
        debeCompletarFiscalExterior: formData.datosFiscales.debeCompletarFiscalExterior ?? false
      },
      declaraciones: {
        esPep: formData.declaraciones.esPep,
        motivoPep: formData.declaraciones.motivoPep,
        esFATCA: formData.declaraciones.esFATCA,
        motivoFatca: formData.declaraciones.motivoFatca,
        declaraUIF: formData.declaraciones.declaraUIF,
        motivoUIF: formData.declaraciones.motivoUIF
      },
      nombres: formData.datosPrincipales.nombres,
      apellidos: formData.datosPrincipales.apellidos,
      celular: formData.datosPrincipales.celular,
      correoElectronico: formData.datosPrincipales.correoElectronico,
      ...(showPorcentajeParticipacion && formData.datosPrincipales.porcentajeParticipacion
        ? {
            porcentajeParticipacion: parseFloat(formData.datosPrincipales.porcentajeParticipacion)
          }
        : {}),
      tipoID: formData.datosPersonales.tipoID,
      idNumero: formData.datosPersonales.idNumero,
      fechaNacimiento: formData.datosPersonales.fechaNacimiento,
      lugarNacimiento: formData.datosPersonales.lugarNacimiento,
      nacionalidad: formData.datosPersonales.nacionalidad,
      paisOrigen: formData.datosPersonales.paisOrigen,
      paisResidencia: formData.datosPersonales.paisResidencia,
      actividad: formData.datosPersonales.actividad,
      sexo: formData.datosPersonales.sexo,
      estadoCivil: formData.datosPersonales.estadoCivil,
      dniFrenteArchivoId: formData.datosPersonales.dniFrenteArchivoId,
      dniReversoArchivoId: formData.datosPersonales.dniReversoArchivoId,
      esPep: formData.declaraciones.esPep,
      motivoPep: formData.declaraciones.motivoPep,
      esFATCA: formData.declaraciones.esFATCA,
      motivoFatca: formData.declaraciones.motivoFatca,
      declaraUIF: formData.declaraciones.declaraUIF,
      motivoUIF: formData.declaraciones.motivoUIF
    };

    try {
      setSaving(true);
      let response;
      if (currentId) {
        response = await updateFn(solicitudId, currentId, payload);
      } else {
        response = await createFn(solicitudId, payload);
      }

      const success =
        response && (response.status === 200 || response.status === 201 || response.status === 204 || response.ok);

      if (!success) {
        setFormError(`Error al guardar el ${entityLowerSingular}.`);
        return false;
      }

      setFormError('');
      return true;
    } catch (err) {
      console.error(`Error guardando ${entityLowerSingular}:`, err);
      setFormError(`Error al guardar el ${entityLowerSingular}.`);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const isStepValid = (stepIndex) => {
    switch (stepIndex) {
      case 0: {
        const { nombres, apellidos, celular, correoElectronico, porcentajeParticipacion } = formData.datosPrincipales;
        const { tipoID, idNumero, fechaNacimiento, lugarNacimiento, nacionalidad, paisOrigen, paisResidencia, actividad, sexo, estadoCivil, conyuge, dniFrenteArchivoId } = formData.datosPersonales;
        // Validar datos principales
        if (!nombres || !apellidos || !celular || !correoElectronico) {
          return false;
        }
        if (showPorcentajeParticipacion) {
          const porcentaje = parseFloat(porcentajeParticipacion);
          if (!porcentajeParticipacion || isNaN(porcentaje) || porcentaje < 0 || porcentaje > 100) {
            return false;
          }
        }
        // Validar datos personales
        if (!tipoID || !idNumero || !fechaNacimiento || !lugarNacimiento || !nacionalidad || !paisOrigen || !paisResidencia || !actividad || !sexo || !estadoCivil) {
          return false;
        }
        // Validar que se haya subido al menos el frente del DNI
        if (!dniFrenteArchivoId) {
          return false;
        }
        // Validar datos del cónyuge si el estado civil es CASADO
        if (estadoCivil === 'CASADO') {
          if (!conyuge.nombres || !conyuge.apellidos || !conyuge.tipoID || !conyuge.idNumero || !conyuge.tipoClaveFiscal || !conyuge.claveFiscal) {
            return false;
          }
        }
        return true;
      }
      case 1: {
        const { calle, numero, ciudad, provincia, pais, cp } = formData.domicilio;
        if (!calle || !numero || !ciudad || !provincia || !pais || !cp) {
          return false;
        }
        break;
      }
      default:
        break;
    }
    return true;
  };

  const validateStep = (stepIndex) => {
    if (!isStepValid(stepIndex)) {
      switch (stepIndex) {
        case 0: {
          const { nombres, apellidos, celular, correoElectronico, porcentajeParticipacion } = formData.datosPrincipales;
          const { tipoID, idNumero, fechaNacimiento, lugarNacimiento, nacionalidad, paisOrigen, paisResidencia, actividad, sexo, estadoCivil, conyuge, dniFrenteArchivoId } = formData.datosPersonales;
          if (!nombres || !apellidos || !celular || !correoElectronico) {
            setFormError('Completá al menos nombre, apellido, celular y correo electrónico.');
          } else if (showPorcentajeParticipacion) {
            const porcentaje = parseFloat(porcentajeParticipacion);
            if (!porcentajeParticipacion || isNaN(porcentaje) || porcentaje < 0 || porcentaje > 100) {
              setFormError('Completá el porcentaje de participación (debe ser un número entre 0 y 100).');
            }
          } else if (!tipoID || !idNumero || !fechaNacimiento || !lugarNacimiento || !nacionalidad || !paisOrigen || !paisResidencia || !actividad || !sexo || !estadoCivil) {
            setFormError('Completá todos los datos personales requeridos.');
          } else if (!dniFrenteArchivoId) {
            setFormError('Debe subir al menos el frente del DNI.');
          } else if (estadoCivil === 'CASADO' && (!conyuge.nombres || !conyuge.apellidos || !conyuge.tipoID || !conyuge.idNumero || !conyuge.tipoClaveFiscal || !conyuge.claveFiscal)) {
            setFormError('Completá todos los datos del cónyuge requeridos.');
          }
          break;
        }
        case 1: {
          const { calle, numero, ciudad, provincia, pais, cp } = formData.domicilio;
          if (!calle || !numero || !ciudad || !provincia || !pais || !cp) {
            setFormError('Completá todos los datos del domicilio requeridos (calle, número, ciudad, provincia, país y código postal).');
          }
          break;
        }
        default:
          setFormError('Completá los campos requeridos.');
          break;
      }
      return false;
    }
    setFormError('');
    return true;
  };

  const handleNext = () => {
    if (!validateStep(activeStep)) return;
    persistCurrentForm().then((saved) => {
      if (saved) {
        setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
      }
    });
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSave = async () => {
    if (!validateStep(activeStep)) return;

    persistCurrentForm().then(async (saved) => {
      if (saved) {
        setFormOpen(false);
        setFormData(initialFormData);
        setEditingFirmanteId(null);
        setActiveStep(0);
        setUploadedDniFiles([]);
        await cargarFirmantes();
      }
    });
  };

  const isCurrentStepValid = isStepValid(activeStep);

  const handleDelete = async (firmante) => {
    if (!solicitudId || !firmante?.id) return;
    const confirmar = window.confirm(
      `¿Seguro que querés eliminar al ${entityLowerSingular} ${firmante.datosPrincipales?.nombres || ''} ${firmante.datosPrincipales?.apellidos || ''}?`
    );
    if (!confirmar) return;

    try {
      setLoading(true);
      const response = await deleteFn(solicitudId, firmante.id);
      if (response && (response.status === 200 || response.status === 204 || response.ok)) {
        await cargarFirmantes();
      } else {
        setError(`Error al eliminar el ${entityLowerSingular}.`);
      }
    } catch (err) {
      console.error(`Error eliminando ${entityLowerSingular}:`, err);
      setError(`Error al eliminar el ${entityLowerSingular}.`);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" required>
                <InputLabel>Tipo de documento</InputLabel>
                <Select
                  value={formData.datosPersonales.tipoID}
                  onChange={(e) => handleFieldChange(['datosPersonales', 'tipoID'], e.target.value)}
                  label="Tipo de documento"
                >
                  {tipoDocumentoOptions.map((option) => (
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
                label="Número de documento"
                variant="outlined"
                value={formData.datosPersonales.idNumero}
                onChange={(e) => handleFieldChange(['datosPersonales', 'idNumero'], e.target.value.replace(/[^0-9]/g, ''))}
                required
                InputProps={{
                  endAdornment: buscandoAccionista ? (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ) : null
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombres"
                variant="outlined"
                value={formData.datosPrincipales.nombres}
                onChange={(e) => handleFieldChange(['datosPrincipales', 'nombres'], e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Apellidos"
                variant="outlined"
                value={formData.datosPrincipales.apellidos}
                onChange={(e) => handleFieldChange(['datosPrincipales', 'apellidos'], e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Celular"
                variant="outlined"
                value={formData.datosPrincipales.celular}
                onChange={(e) => handleFieldChange(['datosPrincipales', 'celular'], e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Correo electrónico"
                variant="outlined"
                value={formData.datosPrincipales.correoElectronico}
                onChange={(e) => handleFieldChange(['datosPrincipales', 'correoElectronico'], e.target.value)}
                required
              />
            </Grid>
            {showPorcentajeParticipacion && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Porcentaje de participación (%)"
                  variant="outlined"
                  type="number"
                  inputProps={{ min: 0, max: 100, step: 0.01 }}
                  value={formData.datosPrincipales.porcentajeParticipacion}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || (!isNaN(value) && parseFloat(value) >= 0 && parseFloat(value) <= 100)) {
                      handleFieldChange(['datosPrincipales', 'porcentajeParticipacion'], value);
                    }
                  }}
                  required
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha de nacimiento"
                type="date"
                variant="outlined"
                value={formData.datosPersonales.fechaNacimiento}
                onChange={(e) => handleFieldChange(['datosPersonales', 'fechaNacimiento'], e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Lugar de nacimiento"
                variant="outlined"
                value={formData.datosPersonales.lugarNacimiento}
                onChange={(e) => handleFieldChange(['datosPersonales', 'lugarNacimiento'], e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Nacionalidad</InputLabel>
                <Select
                  value={formData.datosPersonales.nacionalidad}
                  onChange={(e) => handleFieldChange(['datosPersonales', 'nacionalidad'], e.target.value)}
                  label="Nacionalidad"
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
                <InputLabel>País de origen</InputLabel>
                <Select
                  value={formData.datosPersonales.paisOrigen}
                  onChange={(e) => handleFieldChange(['datosPersonales', 'paisOrigen'], e.target.value)}
                  label="País de origen"
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
                <InputLabel>País de residencia</InputLabel>
                <Select
                  value={formData.datosPersonales.paisResidencia}
                  onChange={(e) => handleFieldChange(['datosPersonales', 'paisResidencia'], e.target.value)}
                  label="País de residencia"
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
                label="Actividad"
                variant="outlined"
                value={formData.datosPersonales.actividad}
                onChange={(e) => handleFieldChange(['datosPersonales', 'actividad'], e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Sexo</InputLabel>
                <Select
                  value={formData.datosPersonales.sexo}
                  onChange={(e) => handleFieldChange(['datosPersonales', 'sexo'], e.target.value)}
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
                  value={formData.datosPersonales.estadoCivil}
                  onChange={(e) => handleFieldChange(['datosPersonales', 'estadoCivil'], e.target.value)}
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

            {/* Subida de DNI */}
            <Grid item xs={12}>
              <Box display="flex" flexDirection="column" alignItems="center" gap="1rem" style={{ marginTop: '1rem' }}>
                <input
                  accept="image/*,.pdf"
                  style={{ display: 'none' }}
                  id="dni-file-upload"
                  multiple
                  type="file"
                  onChange={handleDniFileUpload}
                  disabled={uploadingDniFiles || (formData.datosPersonales.dniFrenteArchivoId && formData.datosPersonales.dniReversoArchivoId)}
                />
                <label htmlFor="dni-file-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={uploadingDniFiles ? <CircularProgress size={20} /> : <CloudUpload />}
                    disabled={uploadingDniFiles || (formData.datosPersonales.dniFrenteArchivoId && formData.datosPersonales.dniReversoArchivoId)}
                    style={{ borderColor: 'var(--main-green)', color: 'var(--main-green)' }}
                  >
                    {uploadingDniFiles ? 'Subiendo...' : 'Subir DNI (Frente y Dorso)'}
                  </Button>
                </label>
                <Typography variant="caption" display="block" style={{ marginTop: '0.5rem', color: '#666', textAlign: 'center' }}>
                  Límite de tamaño: 10MB por archivo
                </Typography>
                {uploadedDniFiles.length > 0 && (
                  <Box display="flex" justifyContent="center" gap="0.5rem" flexWrap="wrap">
                    {uploadedDniFiles.map((file) => (
                      <Chip
                        key={file.id}
                        label={`DNI ${file.side === 'frente' ? 'Frente' : 'Dorso'}: ${file.name}`}
                        onDelete={() => removeDniFile(file.id)}
                        color="primary"
                        variant="outlined"
                        style={{ maxWidth: '300px' }}
                      />
                    ))}
                  </Box>
                )}
                {!formData.datosPersonales.dniFrenteArchivoId && (
                  <Typography variant="caption" style={{ color: '#f44336' }}>
                    * Debe subir al menos el frente del DNI
                  </Typography>
                )}
              </Box>
            </Grid>
            
            {/* Campos del Cónyuge - Solo mostrar si Estado Civil es CASADO */}
            {formData.datosPersonales.estadoCivil === 'CASADO' && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" style={{ marginBottom: '1rem', color: 'var(--light-blue)', marginTop: '1rem' }}>
                    Datos del Cónyuge
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nombres"
                    variant="outlined"
                    value={formData.datosPersonales.conyuge.nombres}
                    onChange={(e) => handleFieldChange(['datosPersonales', 'conyuge', 'nombres'], e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Apellidos"
                    variant="outlined"
                    value={formData.datosPersonales.conyuge.apellidos}
                    onChange={(e) => handleFieldChange(['datosPersonales', 'conyuge', 'apellidos'], e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined" required>
                    <InputLabel>Tipo de documento</InputLabel>
                    <Select
                      value={formData.datosPersonales.conyuge.tipoID}
                      onChange={(e) => handleFieldChange(['datosPersonales', 'conyuge', 'tipoID'], e.target.value)}
                      label="Tipo de documento"
                    >
                      {tipoDocumentoOptions.map((option) => (
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
                    label="Número de documento"
                    variant="outlined"
                    value={formData.datosPersonales.conyuge.idNumero}
                    onChange={(e) => handleFieldChange(['datosPersonales', 'conyuge', 'idNumero'], e.target.value.replace(/[^0-9]/g, ''))}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined" required>
                    <InputLabel>Tipo de clave fiscal</InputLabel>
                    <Select
                      value={formData.datosPersonales.conyuge.tipoClaveFiscal}
                      onChange={(e) => handleFieldChange(['datosPersonales', 'conyuge', 'tipoClaveFiscal'], e.target.value)}
                      label="Tipo de clave fiscal"
                    >
                      {tipoFiscalOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Clave fiscal"
                    variant="outlined"
                    value={formData.datosPersonales.conyuge.claveFiscal}
                    onChange={(e) => handleFieldChange(['datosPersonales', 'conyuge', 'claveFiscal'], e.target.value)}
                    required
                  />
                </Grid>
              </>
            )}
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Calle"
                variant="outlined"
                value={formData.domicilio.calle}
                onChange={(e) => handleFieldChange(['domicilio', 'calle'], e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Número"
                variant="outlined"
                value={formData.domicilio.numero}
                onChange={(e) => handleFieldChange(['domicilio', 'numero'], e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Piso"
                variant="outlined"
                value={formData.domicilio.piso}
                onChange={(e) => handleFieldChange(['domicilio', 'piso'], e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Departamento"
                variant="outlined"
                value={formData.domicilio.depto}
                onChange={(e) => handleFieldChange(['domicilio', 'depto'], e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Barrio"
                variant="outlined"
                value={formData.domicilio.barrio}
                onChange={(e) => handleFieldChange(['domicilio', 'barrio'], e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>País</InputLabel>
                <Select
                  value={formData.domicilio.pais}
                  onChange={(e) => handleFieldChange(['domicilio', 'pais'], e.target.value)}
                  label="País"
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
              <FormControl fullWidth variant="outlined" required>
                <InputLabel>Provincia</InputLabel>
                <Select
                  value={provinciaSeleccionadaId || ''}
                  onChange={(e) => {
                    const provinciaId = e.target.value;
                    setProvinciaSeleccionadaId(provinciaId);
                    const provincia = provincias.find(p => p.id === provinciaId);
                    if (provincia) {
                      handleFieldChange(['domicilio', 'provincia'], provincia.codigoUIF);
                    }
                    // Limpiar ciudad cuando cambia la provincia
                    handleFieldChange(['domicilio', 'ciudad'], '');
                  }}
                  label="Provincia"
                >
                  {provincias.map((provincia) => (
                    <MenuItem key={provincia.id} value={provincia.id}>
                      {provincia.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" required>
                <InputLabel>Ciudad</InputLabel>
                <Select
                  value={formData.domicilio.ciudad || ''}
                  onChange={(e) => {
                    const localidadCodigoUIF = e.target.value;
                    handleFieldChange(['domicilio', 'ciudad'], localidadCodigoUIF);
                  }}
                  label="Ciudad"
                  disabled={!provinciaSeleccionadaId || localidades.length === 0}
                >
                  {localidades.map((localidad) => (
                    <MenuItem key={localidad.id} value={localidad.codigoUIF}>
                      {localidad.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Código Postal"
                variant="outlined"
                value={formData.domicilio.cp}
                onChange={(e) => handleFieldChange(['domicilio', 'cp'], e.target.value)}
                required
              />
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Tipo identificador fiscal</InputLabel>
                <Select
                  value={formData.datosFiscales.tipo}
                  onChange={(e) => handleFieldChange(['datosFiscales', 'tipo'], e.target.value)}
                  label="Tipo identificador fiscal"
                >
                  {tipoFiscalOptions.map((tipo) => (
                    <MenuItem key={tipo} value={tipo}>
                      {tipo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Clave fiscal"
                variant="outlined"
                value={formData.datosFiscales.claveFiscal}
                onChange={(e) => handleFieldChange(['datosFiscales', 'claveFiscal'], e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Tipo IVA</InputLabel>
                <Select
                  value={formData.datosFiscales.tipoIva}
                  onChange={(e) => handleFieldChange(['datosFiscales', 'tipoIva'], e.target.value)}
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
                <InputLabel>Tipo Ganancias</InputLabel>
                <Select
                  value={formData.datosFiscales.tipoGanancia}
                  onChange={(e) => handleFieldChange(['datosFiscales', 'tipoGanancia'], e.target.value)}
                  label="Tipo Ganancias"
                >
                  {tipoGananciaOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Residencia Fiscal</InputLabel>
                <Select
                  value={formData.datosFiscales.residenciaFiscal}
                  onChange={(e) => handleFieldChange(['datosFiscales', 'residenciaFiscal'], e.target.value)}
                  label="Residencia Fiscal"
                >
                  {paisesOptions.map((pais) => (
                    <MenuItem key={pais} value={pais}>
                      {pais}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );
      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    color="primary"
                    checked={formData.declaraciones.esPep}
                    onChange={(e) => handleFieldChange(['declaraciones', 'esPep'], e.target.checked)}
                  />
                }
                label="¿Es Persona Expuesta Políticamente (PEP)?"
              />
              {formData.declaraciones.esPep && (
                <TextField
                  fullWidth
                  label="Motivo PEP"
                  variant="outlined"
                  multiline
                  rows={2}
                  value={formData.declaraciones.motivoPep}
                  onChange={(e) => handleFieldChange(['declaraciones', 'motivoPep'], e.target.value)}
                  style={{ marginTop: '1rem' }}
                />
              )}
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    color="primary"
                    checked={formData.declaraciones.esFATCA}
                    onChange={(e) => handleFieldChange(['declaraciones', 'esFATCA'], e.target.checked)}
                  />
                }
                label="¿Es Residente tributario fuera de Argentina (FATCA)?"
              />
              {formData.declaraciones.esFATCA && (
                <TextField
                  fullWidth
                  label="Motivo FATCA"
                  variant="outlined"
                  multiline
                  rows={2}
                  value={formData.declaraciones.motivoFatca}
                  onChange={(e) => handleFieldChange(['declaraciones', 'motivoFatca'], e.target.value)}
                  style={{ marginTop: '1rem' }}
                />
              )}
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    color="primary"
                    checked={formData.declaraciones.declaraUIF}
                    onChange={(e) => handleFieldChange(['declaraciones', 'declaraUIF'], e.target.checked)}
                  />
                }
                label="¿Es Sujeto Obligado a informar ante la UIF?"
              />
              {formData.declaraciones.declaraUIF && (
                <TextField
                  fullWidth
                  label="Motivo UIF"
                  variant="outlined"
                  multiline
                  rows={2}
                  value={formData.declaraciones.motivoUIF}
                  onChange={(e) => handleFieldChange(['declaraciones', 'motivoUIF'], e.target.value)}
                  style={{ marginTop: '1rem' }}
                />
              )}
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <Box
        display="flex"
        flexDirection={isMobile ? 'column' : 'row'}
        alignItems={isMobile ? 'flex-start' : 'center'}
        justifyContent="space-between"
        marginBottom="1.5rem"
        gap="1rem"
      >
        <Typography variant="h4" component="h1" style={{ color: 'var(--light-blue)', fontWeight: 'bold' }}>
          {title}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleOpenCrear}
          style={{ backgroundColor: 'var(--main-green)', color: '#fff', alignSelf: isMobile ? 'stretch' : 'auto' }}
        >
          {resolvedAddButtonLabel}
        </Button>
      </Box>

      {headerMessage && (
        <Card
          style={{
            marginBottom: '1rem',
            backgroundColor: '#e3f2fd',
            border: '1px solid #2196f3'
          }}
        >
          <CardContent>
            <Typography variant="body2" style={{ color: '#1976d2' }}>
              {headerMessage}
            </Typography>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card
          style={{
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
      <Card>
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          ) : firmantes.length === 0 ? (
            <Typography variant="body2" color="textSecondary" align="center">
              {resolvedEmptyStateMessage}
            </Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombres</TableCell>
                  <TableCell>Apellidos</TableCell>
                  {!isMobile && <TableCell>Documento</TableCell>}
                  {showPorcentajeParticipacion && <TableCell align="right">Porcentaje (%)</TableCell>}
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {firmantes.map((firmante) => {
                  const nombres = firmante?.datosPrincipales?.nombres || firmante?.nombres || '-';
                  const apellidos = firmante?.datosPrincipales?.apellidos || firmante?.apellidos || '-';
                  const documentoTipo = firmante?.datosPersonales?.tipoID || firmante?.tipoID || '';
                  const documentoNumero = firmante?.datosPersonales?.idNumero || firmante?.idNumero || '';
                  const documento =
                    documentoTipo && documentoNumero ? `${documentoTipo} ${documentoNumero}` : documentoTipo || documentoNumero || '-';
                  const porcentaje =
                    showPorcentajeParticipacion &&
                    (firmante?.datosPrincipales?.porcentajeParticipacion ?? firmante?.porcentajeParticipacion ?? firmante?.porcentaje ?? null);
                  const porcentajeDisplay = porcentaje !== null && porcentaje !== undefined ? `${parseFloat(porcentaje).toFixed(2)}%` : '-';

                  return (
                    <TableRow key={firmante.id || `${nombres}-${apellidos}`}>
                      <TableCell>{nombres}</TableCell>
                      <TableCell>{apellidos}</TableCell>
                      {!isMobile && <TableCell>{documento}</TableCell>}
                      {showPorcentajeParticipacion && <TableCell align="right">{porcentajeDisplay}</TableCell>}
                      <TableCell align="right">
                        <IconButton onClick={() => handleOpenEditar(firmante)}>
                          <Edit />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(firmante)}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {formOpen && (
        <Card style={{ marginTop: '2rem' }}>
          <CardContent>
            <Box
              display="flex"
              flexDirection={isMobile ? 'column' : 'row'}
              alignItems={isMobile ? 'flex-start' : 'center'}
              justifyContent="space-between"
              marginBottom="1rem"
              gap="0.75rem"
            >
              <Typography variant="h6" style={{ fontWeight: 'bold' }}>
                {editingFirmanteId ? resolvedEditTitle : resolvedAddTitle}
              </Typography>
              <Button onClick={handleCancelForm} disabled={loading}>
                Cancelar
              </Button>
            </Box>
            {!isMobile ? (
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            ) : (
              <Box
                padding="0.75rem 1rem"
                borderRadius="8px"
                border="1px solid #e0e0e0"
                bgcolor="#fafafa"
              >
                <Typography variant="subtitle2" style={{ color: '#555' }}>
                  Paso {activeStep + 1} de {steps.length}
                </Typography>
                <Typography variant="subtitle1" style={{ fontWeight: 600, marginTop: '0.25rem' }}>
                  {steps[activeStep]}
                </Typography>
              </Box>
            )}
            <Box marginTop="2rem">{renderStepContent(activeStep)}</Box>
            {formError && (
              <Box marginTop="1.5rem">
                <Typography variant="body2" style={{ color: '#d32f2f' }}>
                  {formError}
                </Typography>
              </Box>
            )}
            <Box
              marginTop="2rem"
              display="flex"
              justifyContent={isMobile ? 'center' : 'flex-end'}
              gap="1rem"
              flexWrap="wrap"
            >
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={activeStep === 0 || loading || saving}
              >
                Volver
              </Button>
              {activeStep < steps.length - 1 ? (
                <Button
                  variant="outlined"
                  onClick={handleNext}
                  disabled={loading || saving || !isCurrentStepValid}
                >
                  Continuar
                </Button>
              ) : (
                <Button
                  onClick={handleSave}
                  style={{ backgroundColor: 'var(--main-green)', color: '#fff' }}
                  disabled={loading || saving || !isCurrentStepValid}
                >
                  {saving ? <CircularProgress size={20} color="inherit" /> : resolvedSaveButtonLabel}
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      )}
      {firmantes.length > 0 && (() => {
        let sumaPorcentajes = 0;
        let porcentajeValido = true;

        if (showPorcentajeParticipacion) {
          sumaPorcentajes = firmantes.reduce((sum, firmante) => {
            const porcentaje =
              firmante?.porcentajeParticipacion ?? firmante?.porcentaje ?? firmante?.datosPrincipales?.porcentajeParticipacion ?? null;
            if (porcentaje !== null && porcentaje !== undefined) {
              const num = parseFloat(porcentaje);
              if (!isNaN(num)) {
                return sum + num;
              }
            }
            return sum;
          }, 0);
          porcentajeValido = sumaPorcentajes > 10;
        }

        return (
          <Box marginTop="2.5rem">
            {showPorcentajeParticipacion && !porcentajeValido && (
              <Card
                style={{
                  marginBottom: '1rem',
                  backgroundColor: '#ffebee',
                  border: '1px solid #f44336'
                }}
              >
                <CardContent>
                  <Typography variant="body2" style={{ color: '#d32f2f' }}>
                    Para continuar, la suma del porcentaje de participación de los accionistas debe ser superior al 10%.
                    Suma actual: {sumaPorcentajes.toFixed(2)}%
                  </Typography>
                </CardContent>
              </Card>
            )}
            <Box 
              display="flex" 
              justifyContent="center" 
              className="navigation-buttons"
              style={{ marginTop: '2rem' }}
            >
              {backPath && (
                <Button
                  variant="outlined"
                  onClick={() => history.push(backPath)}
                  className="navigation-button"
                  style={{
                    borderColor: 'var(--main-green)',
                    color: 'var(--main-green)'
                  }}
                >
                  Volver
                </Button>
              )}
              <Button
                variant="contained"
                onClick={() => history.push(finalizePath)}
                color="primary"
                disabled={showPorcentajeParticipacion && !porcentajeValido}
                className="navigation-button"
                style={{
                  backgroundColor: showPorcentajeParticipacion && !porcentajeValido ? '#ccc' : 'var(--main-green)',
                  color: '#fff'
                }}
              >
                {resolvedFinalizeButtonLabel}
              </Button>
            </Box>
          </Box>
        );
      })()}
    </Container>
  );
};

export default CoTitularesPage;

