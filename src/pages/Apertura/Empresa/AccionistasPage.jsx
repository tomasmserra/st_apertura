import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
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
  useTheme,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@material-ui/core';
import { Add, Delete, Edit, ExpandMore } from '@material-ui/icons';
import { authenticationService, empresaService } from '../../../services';

// Constantes y opciones
const tipoEmpresaOptions = [
  { value: 'AGRUPACION', label: 'Agrupación' },
  { value: 'ASOCIACION', label: 'Asociación' },
  { value: 'COOPERATIVA', label: 'Cooperativa' },
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
  'ARGENTINA', 'BRASIL', 'CHILE', 'URUGUAY', 'PARAGUAY', 'BOLIVIA', 'PERU',
  'COLOMBIA', 'VENEZUELA', 'ECUADOR', 'MEXICO', 'ESPAÑA', 'ITALIA', 'FRANCIA',
  'ALEMANIA', 'ESTADOS_UNIDOS', 'CANADA', 'REINO_UNIDO', 'OTRO'
];

const tipoFiscalOptions = [
  'CUIT', 'CUIL', 'CDI', 'NIF', 'NIE', 'CIF', 'RUT', 'RUN', 'NIT', 'SAT',
  'RFC', 'NSS', 'SSN', 'TIN', 'TaxID', 'CPF', 'DUI', 'RTU', 'Otro'
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

const stepsPersona = ['Tipo', 'Datos Personales', 'Domicilio', 'Datos Fiscales', 'Declaraciones'];
const stepsEmpresa = ['Tipo', 'Datos Principales', 'Datos Fiscales', 'Accionistas'];

// Datos iniciales
const initialFormDataPersona = {
  tipo: 'PERSONA',
  datosPrincipales: {
    nombres: '',
    apellidos: '',
    celular: '',
    correoElectronico: '',
    porcentajeParticipacion: ''
  },
  datosPersonales: {
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
  },
  domicilio: {
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

const initialFormDataEmpresa = {
  tipo: 'EMPRESA',
  datosPrincipales: {
    denominacion: '',
    tipoEmpresa: '',
    telefono: '',
    celular: '',
    correoElectronico: '',
    usoFirma: '',
    actividad: '',
    porcentajeParticipacion: ''
  },
  datosFiscales: {
    tipo: 'CUIT',
    claveFiscal: '',
    tipoIva: 'CONSUMIDOR_FINAL',
    tipoGanancia: 'NO_INSCRIPTO',
    residenciaFiscal: '',
    debeCompletarFiscalExterior: false
  },
  accionistas: []
};

// Componente recursivo para mostrar accionistas de una empresa
const AccionistasNestedTable = ({ accionistas, nivel = 0, onEdit, onDelete, solicitudId, empresaId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!accionistas || accionistas.length === 0) {
    return (
      <Typography variant="body2" color="textSecondary" style={{ padding: '1rem', fontStyle: 'italic' }}>
        Sin accionistas registrados
      </Typography>
    );
  }

  return (
    <Table size="small" style={{ marginLeft: nivel * 20 }}>
      <TableHead>
        <TableRow>
          {!isMobile && <TableCell>Tipo</TableCell>}
          <TableCell>Nombre/Denominación</TableCell>
          {!isMobile && <TableCell>Porcentaje (%)</TableCell>}
        </TableRow>
      </TableHead>
      <TableBody>
        {accionistas.map((accionista) => {
          const nombre = accionista.datosPersona?.datosPrincipales
            ? `${accionista.datosPersona.datosPrincipales.nombres || ''} ${accionista.datosPersona.datosPrincipales.apellidos || ''}`.trim()
            : accionista.datosEmpresa?.datosPrincipales?.denominacion || '-';
          const porcentaje = accionista.datosPersona?.datosPrincipales?.porcentajeParticipacion 
            ?? accionista.datosEmpresa?.datosPrincipales?.porcentajeParticipacion 
            ?? null;
          const tipo = accionista.tipo || '-';

          return (
            <React.Fragment key={accionista.id}>
              <TableRow>
                {!isMobile && <TableCell>{tipo === 'PERSONA' ? 'Persona' : 'Empresa'}</TableCell>}
                <TableCell>{nombre}</TableCell>
                {!isMobile && <TableCell>{porcentaje !== null ? `${parseFloat(porcentaje).toFixed(2)}%` : '-'}</TableCell>}
              </TableRow>
              {accionista.datosEmpresa?.accionistas && accionista.datosEmpresa.accionistas.length > 0 && (
                <TableRow>
                  <TableCell colSpan={isMobile ? 1 : 3} style={{ padding: 0, border: 'none' }}>
                    <Box paddingLeft={2}>
                      <Typography variant="caption" style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'block' }}>
                        Accionistas de {nombre}:
                      </Typography>
                      <AccionistasNestedTable
                        accionistas={accionista.datosEmpresa.accionistas}
                        nivel={nivel + 1}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        solicitudId={solicitudId}
                        empresaId={accionista.id}
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
};

const AccionistasPage = () => {
  const history = useHistory();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [accionistas, setAccionistas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState(initialFormDataPersona);
  const [editingAccionistaId, setEditingAccionistaId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [parentEmpresaId, setParentEmpresaId] = useState(null); // Para manejar accionistas anidados
  const [accionistasDialogOpen, setAccionistasDialogOpen] = useState(false);
  const [currentEmpresaAccionistas, setCurrentEmpresaAccionistas] = useState(null);
  const [currentEmpresaId, setCurrentEmpresaId] = useState(null);
  const [nestedFormOpen, setNestedFormOpen] = useState(false);
  const [nestedFormData, setNestedFormData] = useState(initialFormDataPersona);
  const [nestedActiveStep, setNestedActiveStep] = useState(0);
  const [nestedSaving, setNestedSaving] = useState(false);
  const [nestedAccionistaId, setNestedAccionistaId] = useState(null);
  const [nestedFormError, setNestedFormError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accionistaToDelete, setAccionistaToDelete] = useState(null);
  const [nestedAccionistaTempIndex, setNestedAccionistaTempIndex] = useState(null); // Índice temporal del accionista en el array
  const [provincias, setProvincias] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [provinciaSeleccionadaId, setProvinciaSeleccionadaId] = useState(null);
  const [nestedProvincias, setNestedProvincias] = useState([]);
  const [nestedLocalidades, setNestedLocalidades] = useState([]);
  const [nestedProvinciaSeleccionadaId, setNestedProvinciaSeleccionadaId] = useState(null);

  const solicitudId = useMemo(() => localStorage.getItem('currentSolicitudId'), []);

  const cargarAccionistas = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      if (!solicitudId) {
        setError('No se encontró el identificador de la solicitud.');
        return;
      }

      const response = await empresaService.getAccionistasEmpresa(solicitudId);

      if (response && (response.status === 200 || response.ok)) {
        // La respuesta ahora viene directamente como array con la nueva estructura
        const lista = Array.isArray(response) ? response : response.accionistas || [];
        setAccionistas(lista);
      } else {
        setError('Error al obtener los accionistas.');
      }
    } catch (err) {
      console.error('Error cargando accionistas:', err);
      setError('Error al cargar los accionistas.');
    } finally {
      setLoading(false);
    }
  }, [solicitudId]);

  // Cargar provincias al montar el componente
  useEffect(() => {
    const cargarProvincias = async () => {
      try {
        console.log('Cargando provincias...');
        const provinciasData = await empresaService.getProvincias();
        console.log('Provincias recibidas en componente:', provinciasData);
        if (Array.isArray(provinciasData) && provinciasData.length > 0) {
          setProvincias(provinciasData);
          setNestedProvincias(provinciasData);
          console.log('Provincias establecidas en estado:', provinciasData.length);
        } else {
          console.warn('No se recibieron provincias o el array está vacío');
          setProvincias([]);
          setNestedProvincias([]);
        }
      } catch (err) {
        console.error('Error cargando provincias:', err);
        setProvincias([]);
        setNestedProvincias([]);
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

  // Cargar localidades anidadas cuando se selecciona una provincia anidada
  useEffect(() => {
    const cargarLocalidadesAnidadas = async () => {
      if (nestedProvinciaSeleccionadaId) {
        try {
          const localidadesData = await empresaService.getLocalidades(nestedProvinciaSeleccionadaId);
          setNestedLocalidades(localidadesData || []);
        } catch (err) {
          console.error('Error cargando localidades anidadas:', err);
          setNestedLocalidades([]);
        }
      } else {
        setNestedLocalidades([]);
      }
    };
    cargarLocalidadesAnidadas();
  }, [nestedProvinciaSeleccionadaId]);

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
      cargarAccionistas();
    }
  }, [history, cargarAccionistas]);

  const handleOpenCrear = () => {
    setFormData(initialFormDataPersona);
    setActiveStep(0);
    setEditingAccionistaId(null);
    setFormError('');
    setFormOpen(true);
    setParentEmpresaId(null);
    setProvinciaSeleccionadaId(null);
    setLocalidades([]);
  };

  const handleOpenCrearNested = (empresaId) => {
    setFormData(initialFormDataPersona);
    setActiveStep(0);
    setEditingAccionistaId(null);
    setFormError('');
    setFormOpen(true);
    setParentEmpresaId(empresaId);
  };

  const handleFieldChange = (path, value) => {
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
  };

  const normalizarDatos = (accionista) => {
    if (!accionista) {
      return formData.tipo === 'PERSONA' ? initialFormDataPersona : initialFormDataEmpresa;
    }

    // La nueva estructura usa el campo 'tipo' para determinar si es PERSONA o EMPRESA
    if (accionista.tipo === 'PERSONA' && accionista.datosPersona) {
      const datos = accionista.datosPersona || {};
      return {
        id: accionista.id,
        tipo: 'PERSONA',
        datosPrincipales: {
          nombres: datos.datosPrincipales?.nombres ?? '',
          apellidos: datos.datosPrincipales?.apellidos ?? '',
          celular: datos.datosPrincipales?.celular ?? '',
          correoElectronico: datos.datosPrincipales?.correoElectronico ?? '',
          porcentajeParticipacion: datos.datosPrincipales?.porcentajeParticipacion ?? ''
        },
        datosPersonales: {
          ...datos.datosPersonales,
          tipoID: datos.datosPersonales?.tipoID ?? 'DNI',
          idNumero: datos.datosPersonales?.idNumero ?? '',
          fechaNacimiento: datos.datosPersonales?.fechaNacimiento ?? '',
          lugarNacimiento: datos.datosPersonales?.lugarNacimiento ?? '',
          nacionalidad: datos.datosPersonales?.nacionalidad ?? 'ARGENTINA',
          paisOrigen: datos.datosPersonales?.paisOrigen ?? 'ARGENTINA',
          paisResidencia: datos.datosPersonales?.paisResidencia ?? 'ARGENTINA',
          actividad: datos.datosPersonales?.actividad ?? '',
          sexo: datos.datosPersonales?.sexo ?? 'MASCULINO',
          estadoCivil: datos.datosPersonales?.estadoCivil ?? 'SOLTERO',
          conyuge: datos.datosPersonales?.conyuge || {
            nombres: '',
            apellidos: '',
            tipoID: 'DNI',
            idNumero: '',
            tipoClaveFiscal: 'CUIT',
            claveFiscal: ''
          }
        },
        domicilio: datos.domicilio || {
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
        datosFiscales: datos.datosFiscales || {
          tipo: 'CUIT',
          claveFiscal: '',
          tipoIva: 'CONSUMIDOR_FINAL',
          tipoGanancia: 'NO_INSCRIPTO',
          residenciaFiscal: 'ARGENTINA',
          debeCompletarFiscalExterior: false
        },
        declaraciones: datos.declaraciones || {
          esPep: false,
          motivoPep: '',
          esFATCA: false,
          motivoFatca: '',
          declaraUIF: false,
          motivoUIF: ''
        }
      };
    } else if (accionista.tipo === 'EMPRESA' && accionista.datosEmpresa) {
      const datos = accionista.datosEmpresa;
      return {
        id: accionista.id,
        tipo: 'EMPRESA',
        datosPrincipales: {
          denominacion: datos.datosPrincipales?.denominacion ?? '',
          tipoEmpresa: datos.datosPrincipales?.tipoEmpresa ?? '',
          telefono: datos.datosPrincipales?.telefono ?? '',
          celular: datos.datosPrincipales?.celular ?? '',
          correoElectronico: datos.datosPrincipales?.correoElectronico ?? '',
          usoFirma: datos.datosPrincipales?.usoFirma ?? '',
          actividad: datos.datosPrincipales?.actividad ?? '',
          porcentajeParticipacion: datos.datosPrincipales?.porcentajeParticipacion ?? ''
        },
        datosFiscales: datos.datosFiscales || {
          tipo: 'CUIT',
          claveFiscal: '',
          tipoIva: 'CONSUMIDOR_FINAL',
          tipoGanancia: 'NO_INSCRIPTO',
          residenciaFiscal: '',
          debeCompletarFiscalExterior: false
        },
        accionistas: datos.accionistas || []
      };
    }
  };

  const handleOpenEditar = async (accionista, empresaParentId = null) => {
    const normalizado = normalizarDatos(accionista);
    setFormData(normalizado);
    setEditingAccionistaId(normalizado.id);
    // Ir directamente al paso 1 (Datos Principales) ya que el tipo ya lo conocemos
    setActiveStep(1);
    setFormError('');
    setFormOpen(true);
    setParentEmpresaId(empresaParentId);
    
    // Si hay una provincia guardada, buscar su ID para inicializar el combo
    if (normalizado.domicilio?.provincia) {
      const provinciaEncontrada = provincias.find(p => p.codigoUIF === normalizado.domicilio.provincia);
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
    } else {
      setProvinciaSeleccionadaId(null);
      setLocalidades([]);
    }
  };

  const handleCancelForm = () => {
    if (loading) return;
    setFormOpen(false);
    setFormData(initialFormDataPersona);
    setEditingAccionistaId(null);
    setActiveStep(0);
    setFormError('');
    setSaving(false);
    setParentEmpresaId(null);
    setProvinciaSeleccionadaId(null);
    setLocalidades([]);
  };

  const isStepValid = (stepIndex) => {
    const steps = formData.tipo === 'PERSONA' ? stepsPersona : stepsEmpresa;

    if (stepIndex === 0) {
      return formData.tipo === 'PERSONA' || formData.tipo === 'EMPRESA';
    }

    if (formData.tipo === 'PERSONA') {
      switch (stepIndex) {
        case 1: {
          const { nombres, apellidos, correoElectronico, porcentajeParticipacion, celular } = formData.datosPrincipales;
          const { tipoID, idNumero, fechaNacimiento, lugarNacimiento, nacionalidad, paisOrigen, paisResidencia, actividad, sexo, estadoCivil } = formData.datosPersonales;
          // Validar datos principales
          if (!(nombres && apellidos && correoElectronico && porcentajeParticipacion && celular)) {
            return false;
          }
          // Validar datos personales
          return !!(tipoID && idNumero && fechaNacimiento && lugarNacimiento && nacionalidad && paisOrigen && paisResidencia && actividad && sexo && estadoCivil);
        }
        case 2: {
          const { calle, ciudad, provincia, pais, cp } = formData.domicilio;
          return !!(calle && ciudad && provincia && pais && cp);
        }
        case 3: {
          const { tipo, claveFiscal, tipoIva, tipoGanancia } = formData.datosFiscales;
          return !!(tipo && claveFiscal && tipoIva && tipoGanancia);
        }
        default:
          return true;
      }
    } else {
      switch (stepIndex) {
        case 1: {
          const { denominacion, tipoEmpresa, correoElectronico, porcentajeParticipacion, telefono, celular, usoFirma, actividad } = formData.datosPrincipales;
          return !!(denominacion && tipoEmpresa && correoElectronico && porcentajeParticipacion && telefono && celular && usoFirma && actividad);
        }
        case 2: {
          const { tipo, claveFiscal, tipoIva, tipoGanancia } = formData.datosFiscales;
          return !!(tipo && claveFiscal && tipoIva && tipoGanancia);
        }
        default:
          return true;
      }
    }
  };

  const validateStep = (stepIndex) => {
    if (!isStepValid(stepIndex)) {
      setFormError('Completá todos los campos requeridos para continuar.');
      return false;
    }
    setFormError('');
    return true;
  };

  // Validación para el formulario anidado
  const isNestedStepValid = (stepIndex) => {
    if (stepIndex === 0) {
      return nestedFormData.tipo === 'PERSONA' || nestedFormData.tipo === 'EMPRESA';
    }

    if (nestedFormData.tipo === 'PERSONA') {
      switch (stepIndex) {
        case 1: {
          const { nombres, apellidos, correoElectronico, porcentajeParticipacion, celular } = nestedFormData.datosPrincipales;
          const { tipoID, idNumero, fechaNacimiento, lugarNacimiento, nacionalidad, paisOrigen, paisResidencia, actividad, sexo, estadoCivil } = nestedFormData.datosPersonales;
          // Validar datos principales
          if (!(nombres && apellidos && correoElectronico && porcentajeParticipacion && celular)) {
            return false;
          }
          // Validar datos personales
          return !!(tipoID && idNumero && fechaNacimiento && lugarNacimiento && nacionalidad && paisOrigen && paisResidencia && actividad && sexo && estadoCivil);
        }
        case 2: {
          const { calle, ciudad, provincia, pais, cp } = nestedFormData.domicilio;
          return !!(calle && ciudad && provincia && pais && cp);
        }
        case 3: {
          const { tipo, claveFiscal, tipoIva, tipoGanancia } = nestedFormData.datosFiscales;
          return !!(tipo && claveFiscal && tipoIva && tipoGanancia);
        }
        default:
          return true;
      }
    } else {
      switch (stepIndex) {
        case 1: {
          const { denominacion, tipoEmpresa, correoElectronico, porcentajeParticipacion, telefono, celular, usoFirma, actividad } = nestedFormData.datosPrincipales;
          return !!(denominacion && tipoEmpresa && correoElectronico && porcentajeParticipacion && telefono && celular && usoFirma && actividad);
        }
        case 2: {
          const { tipo, claveFiscal, tipoIva, tipoGanancia } = nestedFormData.datosFiscales;
          return !!(tipo && claveFiscal && tipoIva && tipoGanancia);
        }
        default:
          return true;
      }
    }
  };

  const handleNext = async () => {
    if (!validateStep(activeStep)) return;
    
    const steps = formData.tipo === 'PERSONA' ? stepsPersona : stepsEmpresa;
    
    // Si estamos en el paso 1 (Datos Personales) y es nuevo, guardar para obtener el ID
    if (activeStep === 1 && !editingAccionistaId) {
      console.log('📘 handleNext - Paso 1 (Datos Personales) - Accionista NUEVO');
      
      try {
        setSaving(true);
        setFormError('');

        // Construir payload mínimo para crear el accionista
        const payload = {
          tipo: formData.tipo,
          datosPersona: formData.tipo === 'PERSONA' ? {
            datosPrincipales: {
              nombres: formData.datosPrincipales.nombres,
              apellidos: formData.datosPrincipales.apellidos,
              celular: formData.datosPrincipales.celular || '',
              correoElectronico: formData.datosPrincipales.correoElectronico,
              porcentajeParticipacion: parseFloat(formData.datosPrincipales.porcentajeParticipacion) || 0
            }
          } : undefined,
          datosEmpresa: formData.tipo === 'EMPRESA' ? {
            datosPrincipales: {
              solicitudId: parseInt(solicitudId, 10),
              denominacion: formData.datosPrincipales.denominacion,
              tipoEmpresa: formData.datosPrincipales.tipoEmpresa,
              telefono: formData.datosPrincipales.telefono || '',
              celular: formData.datosPrincipales.celular || '',
              correoElectronico: formData.datosPrincipales.correoElectronico,
              usoFirma: formData.datosPrincipales.usoFirma || '',
              actividad: formData.datosPrincipales.actividad || '',
              porcentajeParticipacion: parseFloat(formData.datosPrincipales.porcentajeParticipacion) || 0
            },
            datosFiscales: formData.datosFiscales || {
              tipo: 'CUIT',
              claveFiscal: '',
              tipoIva: 'CONSUMIDOR_FINAL',
              tipoGanancia: 'NO_INSCRIPTO',
              residenciaFiscal: '',
              debeCompletarFiscalExterior: false
            },
            accionistas: []
          } : undefined
        };

        console.log('Guardando accionista nuevo - Payload:', payload);
        const response = await empresaService.saveAccionistaEmpresa(solicitudId, payload);
        console.log('Response de saveAccionistaEmpresa:', response);
        
        if (response && (response.status === 200 || response.status === 201 || response.ok)) {
          // Obtener el ID del accionista guardado
          const accionistaId = 
            response.id || 
            (formData.tipo === 'PERSONA' 
              ? (response.datosPersona?.id || response.datosPersona?.datosPrincipales?.id)
              : (response.datosEmpresa?.id || response.datosEmpresa?.datosPrincipales?.id));
          
          if (accionistaId) {
            setEditingAccionistaId(accionistaId);
            setFormData({ ...formData, id: accionistaId });
            setFormError('');
            setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
          } else {
            setFormError('Error al obtener el ID del accionista guardado.');
          }
        } else {
          setFormError('Error al guardar el accionista. Intente nuevamente.');
        }
      } catch (err) {
        console.error('Error guardando accionista:', err);
        setFormError('Error al guardar el accionista.');
      } finally {
        setSaving(false);
      }
    } else if (editingAccionistaId) {
      // Si ya tiene ID, actualizar en cada paso
      console.log(`📘 handleNext - Paso ${activeStep} - Actualizando accionista existente`);
      
      try {
        setSaving(true);
        setFormError('');

        const payload = buildPayload();
        console.log('Actualizando accionista - Payload:', payload);
        const response = await empresaService.updateAccionistaEmpresa(solicitudId, editingAccionistaId, payload);
        console.log('Response de updateAccionistaEmpresa:', response);
        
        if (response && (response.status === 200 || response.status === 204 || response.ok)) {
          setFormError('');
          setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
        } else {
          setFormError('Error al actualizar el accionista. Intente nuevamente.');
        }
      } catch (err) {
        console.error('Error actualizando accionista:', err);
        setFormError('Error al actualizar el accionista.');
      } finally {
        setSaving(false);
      }
    } else {
      // Si no tiene ID y no es paso 1, simplemente avanzar (no debería pasar)
      console.warn('⚠️ Intento de avanzar sin ID y no es paso 1');
      setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const buildPayload = () => {
    const payload = {
      id: editingAccionistaId || null,
      tipo: formData.tipo
    };

    if (formData.tipo === 'PERSONA') {
      payload.datosPersona = {
        id: formData.id || null,
        datosPrincipales: {
          nombres: formData.datosPrincipales.nombres,
          apellidos: formData.datosPrincipales.apellidos,
          celular: formData.datosPrincipales.celular,
          correoElectronico: formData.datosPrincipales.correoElectronico,
          porcentajeParticipacion: parseFloat(formData.datosPrincipales.porcentajeParticipacion) || 0
        },
        datosPersonales: formData.datosPersonales,
        domicilio: formData.domicilio,
        datosFiscales: formData.datosFiscales,
        declaraciones: formData.declaraciones
      };
    } else {
      payload.datosEmpresa = {
        id: formData.id || null,
        datosPrincipales: {
          solicitudId: parseInt(solicitudId, 10),
          denominacion: formData.datosPrincipales.denominacion,
          tipoEmpresa: formData.datosPrincipales.tipoEmpresa,
          telefono: formData.datosPrincipales.telefono || '',
          celular: formData.datosPrincipales.celular || '',
          correoElectronico: formData.datosPrincipales.correoElectronico,
          usoFirma: formData.datosPrincipales.usoFirma || '',
          actividad: formData.datosPrincipales.actividad || '',
          porcentajeParticipacion: parseFloat(formData.datosPrincipales.porcentajeParticipacion) || 0
        },
        datosFiscales: formData.datosFiscales,
        accionistas: formData.accionistas || []
      };
    }

    return payload;
  };

  const handleSave = async () => {
    if (!validateStep(activeStep)) return;

    const steps = formData.tipo === 'PERSONA' ? stepsPersona : stepsEmpresa;
    if (activeStep < steps.length - 1) {
      handleNext();
      return;
    }

    if (!solicitudId) {
      setFormError('No se encontró el identificador de la solicitud.');
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload();
      let response;

      if (parentEmpresaId) {
        // Guardar accionista anidado - necesitamos actualizar la empresa padre
        // Por ahora, manejaremos esto actualizando toda la empresa padre
        setFormError('La funcionalidad de accionistas anidados se implementará en la siguiente iteración.');
        return;
      }

      if (editingAccionistaId) {
        response = await empresaService.updateAccionistaEmpresa(solicitudId, editingAccionistaId, payload);
      } else {
        response = await empresaService.saveAccionistaEmpresa(solicitudId, payload);
      }

      if (response && (response.status === 200 || response.status === 201 || response.status === 204 || response.ok)) {
        setFormOpen(false);
        setFormData(initialFormDataPersona);
        setEditingAccionistaId(null);
        setActiveStep(0);
        await cargarAccionistas();
      } else {
        setFormError('Error al guardar el accionista. Intente nuevamente.');
      }
    } catch (err) {
      console.error('Error guardando accionista:', err);
      setFormError('Error al guardar el accionista.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (accionistaId, empresaParentId = null) => {
    if (!solicitudId || !accionistaId) return;
    setAccionistaToDelete({ id: accionistaId, empresaParentId });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!solicitudId || !accionistaToDelete?.id) return;

    try {
      setLoading(true);
      setDeleteDialogOpen(false);
      const response = await empresaService.deleteAccionistaEmpresa(solicitudId, accionistaToDelete.id);
      if (response && (response.status === 200 || response.status === 204 || response.ok)) {
        await cargarAccionistas();
        setAccionistaToDelete(null);
      } else {
        setError('Error al eliminar el accionista.');
      }
    } catch (err) {
      console.error('Error eliminando accionista:', err);
      setError('Error al eliminar el accionista.');
    } finally {
      setLoading(false);
    }
  };

  const handleManageAccionistas = (empresa) => {
    setCurrentEmpresaId(empresa.id);
    setCurrentEmpresaAccionistas(empresa.datosEmpresa?.accionistas || []);
    setAccionistasDialogOpen(true);
  };

  // Función auxiliar para calcular suma de porcentajes recursivamente
  const calcularSumaPorcentajes = (accionistasList) => {
    return accionistasList.reduce((sum, accionista) => {
      // Obtener porcentaje según el tipo: PERSONA o EMPRESA
      const porcentaje = accionista.tipo === 'PERSONA'
        ? accionista.datosPersona?.datosPrincipales?.porcentajeParticipacion ?? 0
        : accionista.datosEmpresa?.datosPrincipales?.porcentajeParticipacion ?? 0;
      
      // Si es empresa y tiene accionistas anidados, calcular recursivamente
      const subPorcentajes = accionista.tipo === 'EMPRESA' && accionista.datosEmpresa?.accionistas
        ? calcularSumaPorcentajes(accionista.datosEmpresa.accionistas)
        : 0;
      
      return sum + (parseFloat(porcentaje) || 0) + (parseFloat(subPorcentajes) || 0);
    }, 0);
  };

  const sumaTotalPorcentajes = calcularSumaPorcentajes(accionistas);
  const porcentajeValido = sumaTotalPorcentajes > 10;

  const isCurrentStepValid = isStepValid(activeStep);
  const currentSteps = formData.tipo === 'PERSONA' ? stepsPersona : stepsEmpresa;

  // Función para renderizar el contenido de cada paso
  const renderStepContent = (stepIndex) => {
    if (stepIndex === 0) {
      // Selección de tipo
      return (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <Typography variant="subtitle1" gutterBottom>
                Seleccioná el tipo de accionista:
              </Typography>
              <RadioGroup
                value={formData.tipo}
                onChange={(e) => {
                  const newTipo = e.target.value;
                  setFormData(newTipo === 'PERSONA' ? initialFormDataPersona : initialFormDataEmpresa);
                }}
              >
                <FormControlLabel value="PERSONA" control={<Radio />} label="Persona" />
                <FormControlLabel value="EMPRESA" control={<Radio />} label="Empresa" />
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
      );
    }

    if (formData.tipo === 'PERSONA') {
      switch (stepIndex) {
        case 1: // Datos Principales Persona
          return (
            <Grid container spacing={3}>
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
                  type="email"
                  value={formData.datosPrincipales.correoElectronico}
                  onChange={(e) => handleFieldChange(['datosPrincipales', 'correoElectronico'], e.target.value)}
                  required
                />
              </Grid>
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
              
              {/* Datos Personales */}
              <Grid item xs={12}>
                <Typography variant="h6" style={{ marginBottom: '1rem', color: 'var(--light-blue)', marginTop: '2rem' }}>
                  Datos Personales
                </Typography>
              </Grid>
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
                  type="email"
                  value={formData.datosPrincipales.correoElectronico}
                  onChange={(e) => handleFieldChange(['datosPrincipales', 'correoElectronico'], e.target.value)}
                  required
                />
              </Grid>
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
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined" required>
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
                <FormControl fullWidth variant="outlined" required>
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
                <FormControl fullWidth variant="outlined" required>
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
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined" required>
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
                <FormControl fullWidth variant="outlined" required>
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
            </Grid>
          );
        case 2: // Domicilio (antes era case 3)
          return (
            <React.Fragment key="domicilio-step">
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
                <FormControl fullWidth variant="outlined" required>
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
            </React.Fragment>
          );
        case 4: // Datos Fiscales Persona
          return (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined" required>
                  <InputLabel>Tipo Fiscal</InputLabel>
                  <Select
                    value={formData.datosFiscales.tipo}
                    onChange={(e) => handleFieldChange(['datosFiscales', 'tipo'], e.target.value)}
                    label="Tipo Fiscal"
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
                  label="Clave Fiscal"
                  variant="outlined"
                  value={formData.datosFiscales.claveFiscal}
                  onChange={(e) => handleFieldChange(['datosFiscales', 'claveFiscal'], e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined" required>
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
                <FormControl fullWidth variant="outlined" required>
                  <InputLabel>Tipo Ganancia</InputLabel>
                  <Select
                    value={formData.datosFiscales.tipoGanancia}
                    onChange={(e) => handleFieldChange(['datosFiscales', 'tipoGanancia'], e.target.value)}
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
          );
        case 4: // Declaraciones
          return (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
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
    } else {
      // EMPRESA
      switch (stepIndex) {
        case 1: // Datos Principales Empresa
          return (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Denominación"
                  variant="outlined"
                  value={formData.datosPrincipales.denominacion}
                  onChange={(e) => handleFieldChange(['datosPrincipales', 'denominacion'], e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Tipo de Empresa</InputLabel>
                  <Select
                    value={formData.datosPrincipales.tipoEmpresa}
                    onChange={(e) => handleFieldChange(['datosPrincipales', 'tipoEmpresa'], e.target.value)}
                    label="Tipo de Empresa"
                    required
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
                <FormControl fullWidth variant="outlined" required>
                  <InputLabel>Uso de Firma</InputLabel>
                  <Select
                    value={formData.datosPrincipales.usoFirma}
                    onChange={(e) => handleFieldChange(['datosPrincipales', 'usoFirma'], e.target.value)}
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
                  variant="outlined"
                  value={formData.datosPrincipales.telefono}
                  onChange={(e) => handleFieldChange(['datosPrincipales', 'telefono'], e.target.value)}
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Correo electrónico"
                  variant="outlined"
                  type="email"
                  value={formData.datosPrincipales.correoElectronico}
                  onChange={(e) => handleFieldChange(['datosPrincipales', 'correoElectronico'], e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Actividad"
                  variant="outlined"
                  value={formData.datosPrincipales.actividad}
                  onChange={(e) => handleFieldChange(['datosPrincipales', 'actividad'], e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Porcentaje de participación (%)"
                  variant="outlined"
                  type="number"
                  inputProps={{ min: 0, max: 100, step: 0.01 }}
                  value={formData.datosPrincipales.porcentajeParticipacion || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || (!isNaN(value) && parseFloat(value) >= 0 && parseFloat(value) <= 100)) {
                      handleFieldChange(['datosPrincipales', 'porcentajeParticipacion'], value);
                    }
                  }}
                  required
                />
              </Grid>
            </Grid>
          );
        case 2: // Datos Fiscales Empresa
          return (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined" required>
                  <InputLabel>Tipo Fiscal</InputLabel>
                  <Select
                    value={formData.datosFiscales.tipo}
                    onChange={(e) => handleFieldChange(['datosFiscales', 'tipo'], e.target.value)}
                    label="Tipo Fiscal"
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
                  label="Clave Fiscal"
                  variant="outlined"
                  value={formData.datosFiscales.claveFiscal}
                  onChange={(e) => handleFieldChange(['datosFiscales', 'claveFiscal'], e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined" required>
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
                <FormControl fullWidth variant="outlined" required>
                  <InputLabel>Tipo Ganancia</InputLabel>
                  <Select
                    value={formData.datosFiscales.tipoGanancia}
                    onChange={(e) => handleFieldChange(['datosFiscales', 'tipoGanancia'], e.target.value)}
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
          );
        case 3: // Accionistas de la empresa
          const nombreEmpresa = formData.datosPrincipales?.denominacion || '';
          return (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Accionistas de la Empresa{nombreEmpresa ? ` ${nombreEmpresa}` : ''}
                </Typography>
                {(formData.accionistas || []).length === 0 ? (
                  <Typography variant="body2" color="textSecondary" style={{ marginBottom: '1rem' }}>
                    Aún no se han agregado accionistas a esta empresa.
                  </Typography>
                ) : (
                  <Box marginBottom="1rem">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Tipo</TableCell>
                          <TableCell>Nombre/Denominación</TableCell>
                          <TableCell align="right">Porcentaje (%)</TableCell>
                          <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(formData.accionistas || []).map((accionista, index) => {
                          const nombre = accionista.datosPersona?.datosPrincipales
                            ? `${accionista.datosPersona.datosPrincipales.nombres || ''} ${accionista.datosPersona.datosPrincipales.apellidos || ''}`.trim()
                            : accionista.datosEmpresa?.datosPrincipales?.denominacion || '-';
                          const porcentaje = accionista.datosPersona?.datosPrincipales?.porcentajeParticipacion 
                            ?? accionista.datosEmpresa?.datosPrincipales?.porcentajeParticipacion 
                            ?? null;
                          const tipo = accionista.tipo || '-';

                          return (
                            <TableRow key={accionista.id || index}>
                              <TableCell>{tipo === 'PERSONA' ? 'Persona' : 'Empresa'}</TableCell>
                              <TableCell>{nombre}</TableCell>
                              <TableCell align="right">{porcentaje !== null ? `${parseFloat(porcentaje).toFixed(2)}%` : '-'}</TableCell>
                              <TableCell align="right">
                                <IconButton
                                  size="small"
                                  onClick={async () => {
                                    // Cargar los datos del accionista en el formulario anidado para editar
                                    const accionistaData = tipo === 'PERSONA' 
                                      ? {
                                          tipo: 'PERSONA',
                                          datosPrincipales: accionista.datosPersona?.datosPrincipales || initialFormDataPersona.datosPrincipales,
                                          datosPersonales: accionista.datosPersona?.datosPersonales || initialFormDataPersona.datosPersonales,
                                          domicilio: accionista.datosPersona?.domicilio || initialFormDataPersona.domicilio,
                                          datosFiscales: accionista.datosPersona?.datosFiscales || initialFormDataPersona.datosFiscales,
                                          declaraciones: accionista.datosPersona?.declaraciones || initialFormDataPersona.declaraciones
                                        }
                                      : {
                                          tipo: 'EMPRESA',
                                          datosPrincipales: accionista.datosEmpresa?.datosPrincipales || initialFormDataEmpresa.datosPrincipales,
                                          datosFiscales: accionista.datosEmpresa?.datosFiscales || initialFormDataEmpresa.datosFiscales,
                                          accionistas: accionista.datosEmpresa?.accionistas || []
                                        };
                                    
                                    setNestedFormData(accionistaData);
                                    setNestedAccionistaTempIndex(index);
                                    setNestedActiveStep(1); // Ir directamente a Datos Principales
                                    setNestedFormOpen(true);
                                    setNestedFormError('');
                                    setNestedAccionistaId(null);
                                    
                                    // Si hay una provincia guardada, buscar su ID para inicializar el combo
                                    if (accionistaData.domicilio?.provincia) {
                                      const provinciaEncontrada = nestedProvincias.find(p => p.codigoUIF === accionistaData.domicilio.provincia);
                                      if (provinciaEncontrada) {
                                        setNestedProvinciaSeleccionadaId(provinciaEncontrada.id);
                                        // Cargar las localidades de esa provincia
                                        try {
                                          const localidadesData = await empresaService.getLocalidades(provinciaEncontrada.id);
                                          setNestedLocalidades(localidadesData || []);
                                        } catch (err) {
                                          console.error('Error cargando localidades anidadas:', err);
                                        }
                                      }
                                    } else {
                                      setNestedProvinciaSeleccionadaId(null);
                                      setNestedLocalidades([]);
                                    }
                                  }}
                                >
                                  <Edit />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={async () => {
                                    const currentAccionistas = formData.accionistas || [];
                                    const newAccionistas = currentAccionistas.filter((_, i) => i !== index);
                                    handleFieldChange(['accionistas'], newAccionistas);
                                    // Actualizar la empresa padre sin el accionista eliminado
                                    try {
                                      const empresaPayload = buildPayload();
                                      empresaPayload.datosEmpresa.accionistas = newAccionistas;
                                      await empresaService.updateAccionistaEmpresa(solicitudId, formData.id, empresaPayload);
                                    } catch (err) {
                                      console.error('Error eliminando accionista:', err);
                                      // Revertir si falla
                                      handleFieldChange(['accionistas'], currentAccionistas);
                                    }
                                  }}
                                >
                                  <Delete />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Box>
                )}
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => {
                    console.log('🟢 Click en "Agregar Accionista" - Abriendo formulario anidado');
                    setNestedFormOpen(true);
                    setNestedFormData(initialFormDataPersona);
                    setNestedActiveStep(0);
                    setNestedAccionistaId(null);
                    setNestedFormError('');
                    setNestedAccionistaTempIndex(null); // Resetear índice temporal
                  }}
                  style={{ marginTop: '1rem' }}
                >
                  Agregar Accionista
                </Button>
                {nestedFormOpen && (() => {
                  console.log('🟡 Formulario anidado RENDERIZADO - nestedActiveStep:', nestedActiveStep, 'tipo:', nestedFormData.tipo);
                  return (
                    <Card variant="outlined" style={{ marginTop: '1.5rem', backgroundColor: '#fafafa' }}>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="1rem">
                          <Typography variant="h6">Agregar Accionista</Typography>
                        <Button
                          size="small"
                          onClick={async () => {
                            // Si hay un accionista temporal en el array, eliminarlo antes de cerrar
                            const currentAccionistas = formData.accionistas || [];
                            if (nestedAccionistaTempIndex !== null && currentAccionistas[nestedAccionistaTempIndex]) {
                              const updatedAccionistas = currentAccionistas.filter((_, index) => index !== nestedAccionistaTempIndex);
                              handleFieldChange(['accionistas'], updatedAccionistas);
                              // Actualizar la empresa padre sin el accionista temporal
                              try {
                                const empresaPayload = buildPayload();
                                empresaPayload.datosEmpresa.accionistas = updatedAccionistas;
                                await empresaService.updateAccionistaEmpresa(solicitudId, formData.id, empresaPayload);
                              } catch (err) {
                                console.error('Error eliminando accionista temporal:', err);
                                // Revertir si falla
                                handleFieldChange(['accionistas'], currentAccionistas);
                              }
                            }
                            setNestedFormOpen(false);
                            setNestedFormData(initialFormDataPersona);
                            setNestedActiveStep(0);
                            setNestedAccionistaId(null);
                            setNestedFormError('');
                            setNestedAccionistaTempIndex(null);
                          }}
                        >
                          Cancelar
                        </Button>
                      </Box>
                      <Stepper activeStep={nestedActiveStep} alternativeLabel={!isMobile}>
                        {(nestedFormData.tipo === 'PERSONA' ? stepsPersona : stepsEmpresa).map((label) => (
                          <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                          </Step>
                        ))}
                      </Stepper>
                      <Box marginTop="2rem">
                        {nestedActiveStep === 0 && (
                          <Grid container spacing={3}>
                            <Grid item xs={12}>
                              <FormControl component="fieldset">
                                <RadioGroup
                                  value={nestedFormData.tipo}
                                  onChange={(e) => {
                                    const newTipo = e.target.value;
                                    setNestedFormData(newTipo === 'PERSONA' ? initialFormDataPersona : initialFormDataEmpresa);
                                  }}
                                >
                                  <FormControlLabel value="PERSONA" control={<Radio />} label="Persona" />
                                  <FormControlLabel value="EMPRESA" control={<Radio />} label="Empresa" />
                                </RadioGroup>
                              </FormControl>
                            </Grid>
                          </Grid>
                        )}
                        {nestedActiveStep === 1 && nestedFormData.tipo === 'PERSONA' && (
                          <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                label="Nombres"
                                variant="outlined"
                                value={nestedFormData.datosPrincipales.nombres}
                                onChange={(e) => {
                                  setNestedFormData({
                                    ...nestedFormData,
                                    datosPrincipales: { ...nestedFormData.datosPrincipales, nombres: e.target.value }
                                  });
                                }}
                                required
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                label="Apellidos"
                                variant="outlined"
                                value={nestedFormData.datosPrincipales.apellidos}
                                onChange={(e) => {
                                  setNestedFormData({
                                    ...nestedFormData,
                                    datosPrincipales: { ...nestedFormData.datosPrincipales, apellidos: e.target.value }
                                  });
                                }}
                                required
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                label="Celular"
                                variant="outlined"
                                value={nestedFormData.datosPrincipales.celular}
                                onChange={(e) => {
                                  setNestedFormData({
                                    ...nestedFormData,
                                    datosPrincipales: { ...nestedFormData.datosPrincipales, celular: e.target.value }
                                  });
                                }}
                                required
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                label="Correo electrónico"
                                variant="outlined"
                                type="email"
                                value={nestedFormData.datosPrincipales.correoElectronico}
                                onChange={(e) => {
                                  setNestedFormData({
                                    ...nestedFormData,
                                    datosPrincipales: { ...nestedFormData.datosPrincipales, correoElectronico: e.target.value }
                                  });
                                }}
                                required
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                label="Porcentaje de participación (%)"
                                variant="outlined"
                                type="number"
                                inputProps={{ min: 0, max: 100, step: 0.01 }}
                                value={nestedFormData.datosPrincipales.porcentajeParticipacion}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === '' || (!isNaN(value) && parseFloat(value) >= 0 && parseFloat(value) <= 100)) {
                                    setNestedFormData({
                                      ...nestedFormData,
                                      datosPrincipales: { ...nestedFormData.datosPrincipales, porcentajeParticipacion: value }
                                    });
                                  }
                                }}
                                required
                              />
                            </Grid>
                          </Grid>
                        )}
                        {nestedActiveStep === 1 && nestedFormData.tipo === 'EMPRESA' && (
                          <Grid container spacing={3}>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Denominación"
                                variant="outlined"
                                value={nestedFormData.datosPrincipales.denominacion}
                                onChange={(e) => {
                                  setNestedFormData({
                                    ...nestedFormData,
                                    datosPrincipales: { ...nestedFormData.datosPrincipales, denominacion: e.target.value }
                                  });
                                }}
                                required
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <FormControl fullWidth variant="outlined">
                                <InputLabel>Tipo de Empresa</InputLabel>
                                <Select
                                  value={nestedFormData.datosPrincipales.tipoEmpresa}
                                  onChange={(e) => {
                                    setNestedFormData({
                                      ...nestedFormData,
                                      datosPrincipales: { ...nestedFormData.datosPrincipales, tipoEmpresa: e.target.value }
                                    });
                                  }}
                                  label="Tipo de Empresa"
                                  required
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
                              <TextField
                                fullWidth
                                label="Correo electrónico"
                                variant="outlined"
                                type="email"
                                value={nestedFormData.datosPrincipales.correoElectronico}
                                onChange={(e) => {
                                  setNestedFormData({
                                    ...nestedFormData,
                                    datosPrincipales: { ...nestedFormData.datosPrincipales, correoElectronico: e.target.value }
                                  });
                                }}
                                required
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <FormControl fullWidth variant="outlined" required>
                                <InputLabel>Tipo de documento</InputLabel>
                                <Select
                                  value={nestedFormData.datosPersonales.tipoID}
                                  onChange={(e) => {
                                    setNestedFormData({
                                      ...nestedFormData,
                                      datosPersonales: { ...nestedFormData.datosPersonales, tipoID: e.target.value }
                                    });
                                  }}
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
                                  value={nestedFormData.datosPersonales.idNumero}
                                  onChange={(e) => {
                                    setNestedFormData({
                                      ...nestedFormData,
                                      datosPersonales: { ...nestedFormData.datosPersonales, idNumero: e.target.value.replace(/[^0-9]/g, '') }
                                    });
                                  }}
                                  required
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Nombres"
                                  variant="outlined"
                                  value={nestedFormData.datosPrincipales.nombres}
                                  onChange={(e) => {
                                    setNestedFormData({
                                      ...nestedFormData,
                                      datosPrincipales: { ...nestedFormData.datosPrincipales, nombres: e.target.value }
                                    });
                                  }}
                                  required
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Apellidos"
                                  variant="outlined"
                                  value={nestedFormData.datosPrincipales.apellidos}
                                  onChange={(e) => {
                                    setNestedFormData({
                                      ...nestedFormData,
                                      datosPrincipales: { ...nestedFormData.datosPrincipales, apellidos: e.target.value }
                                    });
                                  }}
                                  required
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Celular"
                                  variant="outlined"
                                  value={nestedFormData.datosPrincipales.celular}
                                  onChange={(e) => {
                                    setNestedFormData({
                                      ...nestedFormData,
                                      datosPrincipales: { ...nestedFormData.datosPrincipales, celular: e.target.value }
                                    });
                                  }}
                                  required
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Correo electrónico"
                                  variant="outlined"
                                  type="email"
                                  value={nestedFormData.datosPrincipales.correoElectronico}
                                  onChange={(e) => {
                                    setNestedFormData({
                                      ...nestedFormData,
                                      datosPrincipales: { ...nestedFormData.datosPrincipales, correoElectronico: e.target.value }
                                    });
                                  }}
                                  required
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Porcentaje de participación (%)"
                                  variant="outlined"
                                  type="number"
                                  inputProps={{ min: 0, max: 100, step: 0.01 }}
                                  value={nestedFormData.datosPrincipales.porcentajeParticipacion}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '' || (!isNaN(value) && parseFloat(value) >= 0 && parseFloat(value) <= 100)) {
                                      setNestedFormData({
                                        ...nestedFormData,
                                        datosPrincipales: { ...nestedFormData.datosPrincipales, porcentajeParticipacion: value }
                                      });
                                    }
                                  }}
                                  required
                                />
                              </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                label="Fecha de nacimiento"
                                type="date"
                                variant="outlined"
                                value={nestedFormData.datosPersonales.fechaNacimiento}
                                onChange={(e) => {
                                  setNestedFormData({
                                    ...nestedFormData,
                                    datosPersonales: { ...nestedFormData.datosPersonales, fechaNacimiento: e.target.value }
                                  });
                                }}
                                InputLabelProps={{ shrink: true }}
                                required
                              />
                            </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Lugar de nacimiento"
                                  variant="outlined"
                                  value={nestedFormData.datosPersonales.lugarNacimiento}
                                  onChange={(e) => {
                                    setNestedFormData({
                                      ...nestedFormData,
                                      datosPersonales: { ...nestedFormData.datosPersonales, lugarNacimiento: e.target.value }
                                    });
                                  }}
                                  required
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <FormControl fullWidth variant="outlined" required>
                                  <InputLabel>Nacionalidad</InputLabel>
                                  <Select
                                    value={nestedFormData.datosPersonales.nacionalidad}
                                    onChange={(e) => {
                                      setNestedFormData({
                                        ...nestedFormData,
                                        datosPersonales: { ...nestedFormData.datosPersonales, nacionalidad: e.target.value }
                                      });
                                    }}
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
                                <FormControl fullWidth variant="outlined" required>
                                  <InputLabel>País de origen</InputLabel>
                                  <Select
                                    value={nestedFormData.datosPersonales.paisOrigen}
                                    onChange={(e) => {
                                      setNestedFormData({
                                        ...nestedFormData,
                                        datosPersonales: { ...nestedFormData.datosPersonales, paisOrigen: e.target.value }
                                      });
                                    }}
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
                                <FormControl fullWidth variant="outlined" required>
                                  <InputLabel>País de residencia</InputLabel>
                                  <Select
                                    value={nestedFormData.datosPersonales.paisResidencia}
                                    onChange={(e) => {
                                      setNestedFormData({
                                        ...nestedFormData,
                                        datosPersonales: { ...nestedFormData.datosPersonales, paisResidencia: e.target.value }
                                      });
                                    }}
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
                                  value={nestedFormData.datosPersonales.actividad}
                                  onChange={(e) => {
                                    setNestedFormData({
                                      ...nestedFormData,
                                      datosPersonales: { ...nestedFormData.datosPersonales, actividad: e.target.value }
                                    });
                                  }}
                                  required
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <FormControl fullWidth variant="outlined" required>
                                  <InputLabel>Sexo</InputLabel>
                                  <Select
                                    value={nestedFormData.datosPersonales.sexo}
                                    onChange={(e) => {
                                      setNestedFormData({
                                        ...nestedFormData,
                                        datosPersonales: { ...nestedFormData.datosPersonales, sexo: e.target.value }
                                      });
                                    }}
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
                                <FormControl fullWidth variant="outlined" required>
                                  <InputLabel>Estado Civil</InputLabel>
                                  <Select
                                    value={nestedFormData.datosPersonales.estadoCivil}
                                    onChange={(e) => {
                                      setNestedFormData({
                                        ...nestedFormData,
                                        datosPersonales: { ...nestedFormData.datosPersonales, estadoCivil: e.target.value }
                                    });
                                  }}
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
                          </Grid>
                        )}
                        {nestedActiveStep === 2 && nestedFormData.tipo === 'PERSONA' && (
                          <React.Fragment key="nested-domicilio-step">
                            <Grid container spacing={3}>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Calle"
                                  variant="outlined"
                                  value={nestedFormData.domicilio.calle}
                                  onChange={(e) => {
                                    setNestedFormData({
                                      ...nestedFormData,
                                      domicilio: { ...nestedFormData.domicilio, calle: e.target.value }
                                    });
                                  }}
                                  required
                                />
                              </Grid>
                              <Grid item xs={12} sm={3}>
                                <TextField
                                  fullWidth
                                  label="Número"
                                  variant="outlined"
                                  value={nestedFormData.domicilio.numero}
                                  onChange={(e) => {
                                    setNestedFormData({
                                      ...nestedFormData,
                                      domicilio: { ...nestedFormData.domicilio, numero: e.target.value }
                                    });
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={3}>
                                <TextField
                                  fullWidth
                                  label="Piso"
                                  variant="outlined"
                                  value={nestedFormData.domicilio.piso}
                                  onChange={(e) => {
                                    setNestedFormData({
                                      ...nestedFormData,
                                      domicilio: { ...nestedFormData.domicilio, piso: e.target.value }
                                    });
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Departamento"
                                  variant="outlined"
                                  value={nestedFormData.domicilio.depto}
                                  onChange={(e) => {
                                    setNestedFormData({
                                      ...nestedFormData,
                                      domicilio: { ...nestedFormData.domicilio, depto: e.target.value }
                                    });
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Barrio"
                                  variant="outlined"
                                  value={nestedFormData.domicilio.barrio}
                                  onChange={(e) => {
                                    setNestedFormData({
                                      ...nestedFormData,
                                      domicilio: { ...nestedFormData.domicilio, barrio: e.target.value }
                                    });
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <FormControl fullWidth variant="outlined" required>
                                  <InputLabel>Provincia</InputLabel>
                                  <Select
                                    value={nestedProvinciaSeleccionadaId || ''}
                                    onChange={(e) => {
                                      const provinciaId = e.target.value;
                                      setNestedProvinciaSeleccionadaId(provinciaId);
                                      const provincia = nestedProvincias.find(p => p.id === provinciaId);
                                      if (provincia) {
                                        setNestedFormData({
                                          ...nestedFormData,
                                          domicilio: { ...nestedFormData.domicilio, provincia: provincia.codigoUIF, ciudad: '' }
                                        });
                                      }
                                    }}
                                    label="Provincia"
                                  >
                                    {nestedProvincias.map((provincia) => (
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
                                    value={nestedFormData.domicilio.ciudad || ''}
                                    onChange={(e) => {
                                      const localidadCodigoUIF = e.target.value;
                                      setNestedFormData({
                                        ...nestedFormData,
                                        domicilio: { ...nestedFormData.domicilio, ciudad: localidadCodigoUIF }
                                      });
                                    }}
                                    label="Ciudad"
                                    disabled={!nestedProvinciaSeleccionadaId || nestedLocalidades.length === 0}
                                  >
                                    {nestedLocalidades.map((localidad) => (
                                      <MenuItem key={localidad.id} value={localidad.codigoUIF}>
                                        {localidad.nombre}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <FormControl fullWidth variant="outlined" required>
                                  <InputLabel>País</InputLabel>
                                  <Select
                                    value={nestedFormData.domicilio.pais}
                                    onChange={(e) => {
                                      setNestedFormData({
                                        ...nestedFormData,
                                        domicilio: { ...nestedFormData.domicilio, pais: e.target.value }
                                      });
                                    }}
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
                                <TextField
                                  fullWidth
                                  label="Código Postal"
                                  variant="outlined"
                                  value={nestedFormData.domicilio.cp}
                                  onChange={(e) => {
                                    setNestedFormData({
                                      ...nestedFormData,
                                      domicilio: { ...nestedFormData.domicilio, cp: e.target.value }
                                    });
                                  }}
                                  required
                                />
                              </Grid>
                            </Grid>
                          </React.Fragment>
                        )}
                        {nestedActiveStep === 3 && nestedFormData.tipo === 'PERSONA' && (
                          <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                              <FormControl fullWidth variant="outlined" required>
                                <InputLabel>Tipo Fiscal</InputLabel>
                                <Select
                                  value={nestedFormData.datosFiscales.tipo}
                                  onChange={(e) => {
                                    setNestedFormData({
                                      ...nestedFormData,
                                      datosFiscales: { ...nestedFormData.datosFiscales, tipo: e.target.value }
                                    });
                                  }}
                                  label="Tipo Fiscal"
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
                                label="Clave Fiscal"
                                variant="outlined"
                                value={nestedFormData.datosFiscales.claveFiscal}
                                onChange={(e) => {
                                  setNestedFormData({
                                    ...nestedFormData,
                                    datosFiscales: { ...nestedFormData.datosFiscales, claveFiscal: e.target.value }
                                  });
                                }}
                                required
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <FormControl fullWidth variant="outlined" required>
                                <InputLabel>Tipo IVA</InputLabel>
                                <Select
                                  value={nestedFormData.datosFiscales.tipoIva}
                                  onChange={(e) => {
                                    setNestedFormData({
                                      ...nestedFormData,
                                      datosFiscales: { ...nestedFormData.datosFiscales, tipoIva: e.target.value }
                                    });
                                  }}
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
                              <FormControl fullWidth variant="outlined" required>
                                <InputLabel>Tipo Ganancia</InputLabel>
                                <Select
                                  value={nestedFormData.datosFiscales.tipoGanancia}
                                  onChange={(e) => {
                                    setNestedFormData({
                                      ...nestedFormData,
                                      datosFiscales: { ...nestedFormData.datosFiscales, tipoGanancia: e.target.value }
                                    });
                                  }}
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
                        )}
                        {nestedActiveStep === 4 && nestedFormData.tipo === 'PERSONA' && (
                          <Grid container spacing={3}>
                            <Grid item xs={12}>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={nestedFormData.declaraciones.esPep}
                                    onChange={(e) => {
                                      setNestedFormData({
                                        ...nestedFormData,
                                        declaraciones: { ...nestedFormData.declaraciones, esPep: e.target.checked }
                                      });
                                    }}
                                  />
                                }
                                label="¿Es Persona Expuesta Políticamente (PEP)?"
                              />
                            </Grid>
                            {nestedFormData.declaraciones.esPep && (
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label="Motivo PEP"
                                  variant="outlined"
                                  multiline
                                  rows={2}
                                  value={nestedFormData.declaraciones.motivoPep}
                                  onChange={(e) => {
                                    setNestedFormData({
                                      ...nestedFormData,
                                      declaraciones: { ...nestedFormData.declaraciones, motivoPep: e.target.value }
                                    });
                                  }}
                                />
                              </Grid>
                            )}
                            <Grid item xs={12}>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={nestedFormData.declaraciones.esFATCA}
                                    onChange={(e) => {
                                      setNestedFormData({
                                        ...nestedFormData,
                                        declaraciones: { ...nestedFormData.declaraciones, esFATCA: e.target.checked }
                                      });
                                    }}
                                  />
                                }
                                label="¿Es FATCA?"
                              />
                            </Grid>
                            {nestedFormData.declaraciones.esFATCA && (
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label="Motivo FATCA"
                                  variant="outlined"
                                  multiline
                                  rows={2}
                                  value={nestedFormData.declaraciones.motivoFatca}
                                  onChange={(e) => {
                                    setNestedFormData({
                                      ...nestedFormData,
                                      declaraciones: { ...nestedFormData.declaraciones, motivoFatca: e.target.value }
                                    });
                                  }}
                                />
                              </Grid>
                            )}
                            <Grid item xs={12}>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={nestedFormData.declaraciones.declaraUIF}
                                    onChange={(e) => {
                                      setNestedFormData({
                                        ...nestedFormData,
                                        declaraciones: { ...nestedFormData.declaraciones, declaraUIF: e.target.checked }
                                      });
                                    }}
                                  />
                                }
                                label="¿Declara UIF?"
                              />
                            </Grid>
                            {nestedFormData.declaraciones.declaraUIF && (
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label="Motivo UIF"
                                  variant="outlined"
                                  multiline
                                  rows={2}
                                  value={nestedFormData.declaraciones.motivoUIF}
                                  onChange={(e) => {
                                    setNestedFormData({
                                      ...nestedFormData,
                                      declaraciones: { ...nestedFormData.declaraciones, motivoUIF: e.target.value }
                                    });
                                  }}
                                />
                              </Grid>
                            )}
                          </Grid>
                        )}
                        {nestedActiveStep === 1 && nestedFormData.tipo === 'EMPRESA' && (
                          <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                              <FormControl fullWidth variant="outlined" required>
                                <InputLabel>Tipo Fiscal</InputLabel>
                                <Select
                                  value={nestedFormData.datosFiscales.tipo}
                                  onChange={(e) => {
                                    setNestedFormData({
                                      ...nestedFormData,
                                      datosFiscales: { ...nestedFormData.datosFiscales, tipo: e.target.value }
                                    });
                                  }}
                                  label="Tipo Fiscal"
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
                                label="Clave Fiscal"
                                variant="outlined"
                                value={nestedFormData.datosFiscales.claveFiscal}
                                onChange={(e) => {
                                  setNestedFormData({
                                    ...nestedFormData,
                                    datosFiscales: { ...nestedFormData.datosFiscales, claveFiscal: e.target.value }
                                  });
                                }}
                                required
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <FormControl fullWidth variant="outlined" required>
                                <InputLabel>Tipo IVA</InputLabel>
                                <Select
                                  value={nestedFormData.datosFiscales.tipoIva}
                                  onChange={(e) => {
                                    setNestedFormData({
                                      ...nestedFormData,
                                      datosFiscales: { ...nestedFormData.datosFiscales, tipoIva: e.target.value }
                                    });
                                  }}
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
                              <FormControl fullWidth variant="outlined" required>
                                <InputLabel>Tipo Ganancia</InputLabel>
                                <Select
                                  value={nestedFormData.datosFiscales.tipoGanancia}
                                  onChange={(e) => {
                                    setNestedFormData({
                                      ...nestedFormData,
                                      datosFiscales: { ...nestedFormData.datosFiscales, tipoGanancia: e.target.value }
                                    });
                                  }}
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
                        )}
                      </Box>
                      {nestedFormError && (
                        <Box marginTop="1rem">
                          <Typography variant="body2" style={{ color: '#d32f2f' }}>
                            {nestedFormError}
                          </Typography>
                        </Box>
                      )}
                      <Box marginTop="2rem" display="flex" justifyContent="flex-end" gap="1rem">
                        <Button
                          variant="outlined"
                          onClick={() => setNestedActiveStep((prev) => Math.max(prev - 1, 0))}
                          disabled={nestedActiveStep === 0 || nestedSaving}
                        >
                          Volver
                        </Button>
                        {(() => {
                          const maxSteps = nestedFormData.tipo === 'PERSONA' ? stepsPersona.length : stepsEmpresa.length;
                          const showContinuar = nestedActiveStep < maxSteps - 1;
                          console.log('Renderizando botón Continuar:', {
                            nestedActiveStep,
                            maxSteps,
                            showContinuar,
                            tipo: nestedFormData.tipo
                          });
                          return showContinuar ? (
                            <Button
                              variant="outlined"
                              onClick={async (e) => {
                                console.log('🚀 BOTÓN CONTINUAR CLICKEADO');
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('=== Continuar clicked ===');
                                console.log('nestedActiveStep:', nestedActiveStep);
                                console.log('nestedAccionistaId:', nestedAccionistaId);
                                console.log('nestedFormData.tipo:', nestedFormData.tipo);
                                console.log('nestedSaving:', nestedSaving);
                              
                              // Validar campos requeridos del paso actual antes de continuar
                              if (!isNestedStepValid(nestedActiveStep)) {
                                setNestedFormError('Completá todos los campos requeridos para continuar.');
                                return;
                              }
                              
                              // Actualizar la empresa padre con el accionista parcial para no perder los datos
                              try {
                                setNestedSaving(true);
                                setNestedFormError('');

                                // Obtener el array actual de accionistas directamente de formData
                                const currentAccionistas = formData.accionistas || [];

                                // Construir el objeto accionista parcial con los datos completados hasta el momento
                                const accionistaParcial = {
                                  tipo: nestedFormData.tipo,
                                  datosPersona: nestedFormData.tipo === 'PERSONA' ? {
                                    datosPrincipales: {
                                      nombres: nestedFormData.datosPrincipales.nombres || '',
                                      apellidos: nestedFormData.datosPrincipales.apellidos || '',
                                      celular: nestedFormData.datosPrincipales.celular || '',
                                      correoElectronico: nestedFormData.datosPrincipales.correoElectronico || '',
                                      porcentajeParticipacion: parseFloat(nestedFormData.datosPrincipales.porcentajeParticipacion) || 0
                                    },
                                    datosPersonales: nestedFormData.datosPersonales || initialFormDataPersona.datosPersonales,
                                    domicilio: nestedFormData.domicilio || initialFormDataPersona.domicilio,
                                    datosFiscales: nestedFormData.datosFiscales || initialFormDataPersona.datosFiscales,
                                    declaraciones: nestedFormData.declaraciones || initialFormDataPersona.declaraciones
                                  } : null,
                                  datosEmpresa: nestedFormData.tipo === 'EMPRESA' ? {
                                    datosPrincipales: {
                                      denominacion: nestedFormData.datosPrincipales.denominacion || '',
                                      tipoEmpresa: nestedFormData.datosPrincipales.tipoEmpresa || '',
                                      telefono: nestedFormData.datosPrincipales.telefono || '',
                                      celular: nestedFormData.datosPrincipales.celular || '',
                                      correoElectronico: nestedFormData.datosPrincipales.correoElectronico || '',
                                      usoFirma: nestedFormData.datosPrincipales.usoFirma || '',
                                      actividad: nestedFormData.datosPrincipales.actividad || '',
                                      porcentajeParticipacion: parseFloat(nestedFormData.datosPrincipales.porcentajeParticipacion) || 0
                                    },
                                    datosFiscales: nestedFormData.datosFiscales || initialFormDataEmpresa.datosFiscales,
                                    accionistas: nestedFormData.accionistas || []
                                  } : null
                                };

                                // Si ya existe un accionista temporal en el array, actualizarlo; si no, agregarlo
                                let updatedAccionistas;
                                let tempIndex = nestedAccionistaTempIndex;
                                
                                if (tempIndex !== null && tempIndex >= 0 && tempIndex < currentAccionistas.length) {
                                  // Actualizar el accionista existente en el array
                                  updatedAccionistas = [...currentAccionistas];
                                  updatedAccionistas[tempIndex] = accionistaParcial;
                                } else {
                                  // Agregar un nuevo accionista temporal al array
                                  updatedAccionistas = [...currentAccionistas, accionistaParcial];
                                  tempIndex = updatedAccionistas.length - 1;
                                  setNestedAccionistaTempIndex(tempIndex);
                                }
                                
                                // Actualizar formData con el array actualizado
                                handleFieldChange(['accionistas'], updatedAccionistas);

                                // Construir payload con el array actualizado
                                const empresaPayload = buildPayload();
                                empresaPayload.datosEmpresa.accionistas = updatedAccionistas;

                                // Actualizar la empresa padre con todos sus accionistas (incluyendo el parcial)
                                const response = await empresaService.updateAccionistaEmpresa(solicitudId, formData.id, empresaPayload);
                                
                                if (response && (response.status === 200 || response.status === 204 || response.ok)) {
                                  setNestedFormError('');
                                  setNestedActiveStep((prev) => prev + 1);
                                } else {
                                  setNestedFormError('Error al guardar los datos. Intente nuevamente.');
                                  // Revertir el cambio en el array si falla
                                  handleFieldChange(['accionistas'], currentAccionistas);
                                }
                              } catch (err) {
                                console.error('Error actualizando empresa padre:', err);
                                setNestedFormError('Error al guardar los datos.');
                                // Revertir el cambio en el array si falla
                                const currentAccionistas = formData.accionistas || [];
                                handleFieldChange(['accionistas'], currentAccionistas);
                              } finally {
                                setNestedSaving(false);
                              }
                              }}
                              disabled={nestedSaving}
                              style={{ minWidth: '120px' }}
                            >
                              {nestedSaving ? <CircularProgress size={20} /> : 'Continuar'}
                            </Button>
                          ) : (
                          <Button
                            variant="contained"
                            style={{ backgroundColor: 'var(--main-green)', color: '#fff' }}
                            onClick={async () => {
                              // Agregar/actualizar el accionista al array de la empresa padre
                              // Luego actualizar la empresa padre con todos sus accionistas
                              try {
                                setNestedSaving(true);
                                setNestedFormError('');

                                // Construir el objeto accionista completo para agregar a la empresa padre
                                const newAccionista = {
                                  tipo: nestedFormData.tipo,
                                  datosPersona: nestedFormData.tipo === 'PERSONA' ? {
                                    datosPrincipales: {
                                      nombres: nestedFormData.datosPrincipales.nombres || '',
                                      apellidos: nestedFormData.datosPrincipales.apellidos || '',
                                      celular: nestedFormData.datosPrincipales.celular || '',
                                      correoElectronico: nestedFormData.datosPrincipales.correoElectronico || '',
                                      porcentajeParticipacion: parseFloat(nestedFormData.datosPrincipales.porcentajeParticipacion) || 0
                                    },
                                    datosPersonales: nestedFormData.datosPersonales || initialFormDataPersona.datosPersonales,
                                    domicilio: nestedFormData.domicilio || initialFormDataPersona.domicilio,
                                    datosFiscales: nestedFormData.datosFiscales || initialFormDataPersona.datosFiscales,
                                    declaraciones: nestedFormData.declaraciones || initialFormDataPersona.declaraciones
                                  } : null,
                                  datosEmpresa: nestedFormData.tipo === 'EMPRESA' ? {
                                    datosPrincipales: {
                                      denominacion: nestedFormData.datosPrincipales.denominacion || '',
                                      tipoEmpresa: nestedFormData.datosPrincipales.tipoEmpresa || '',
                                      telefono: nestedFormData.datosPrincipales.telefono || '',
                                      celular: nestedFormData.datosPrincipales.celular || '',
                                      correoElectronico: nestedFormData.datosPrincipales.correoElectronico || '',
                                      usoFirma: nestedFormData.datosPrincipales.usoFirma || '',
                                      actividad: nestedFormData.datosPrincipales.actividad || '',
                                      porcentajeParticipacion: parseFloat(nestedFormData.datosPrincipales.porcentajeParticipacion) || 0
                                    },
                                    datosFiscales: nestedFormData.datosFiscales || initialFormDataEmpresa.datosFiscales,
                                    accionistas: nestedFormData.accionistas || []
                                  } : null
                                };

                                // Obtener el array actual de accionistas directamente de formData
                                const currentAccionistas = formData.accionistas || [];

                                // Si ya existe un accionista temporal en el array, actualizarlo; si no, agregarlo
                                let updatedAccionistas;
                                if (nestedAccionistaTempIndex !== null && nestedAccionistaTempIndex >= 0 && nestedAccionistaTempIndex < currentAccionistas.length) {
                                  // Actualizar el accionista existente en el array
                                  updatedAccionistas = [...currentAccionistas];
                                  updatedAccionistas[nestedAccionistaTempIndex] = newAccionista;
                                } else {
                                  // Agregar un nuevo accionista al array
                                  updatedAccionistas = [...currentAccionistas, newAccionista];
                                }

                                // Actualizar formData con el array actualizado
                                handleFieldChange(['accionistas'], updatedAccionistas);

                                // Construir payload con el array actualizado
                                const empresaPayload = buildPayload();
                                empresaPayload.datosEmpresa.accionistas = updatedAccionistas;

                                // Actualizar la empresa padre con todos sus accionistas anidados
                                const response = await empresaService.updateAccionistaEmpresa(solicitudId, formData.id, empresaPayload);
                                
                                if (response && (response.status === 200 || response.status === 204 || response.ok)) {
                                  // Cerrar el formulario anidado
                                  setNestedFormOpen(false);
                                  setNestedFormData(initialFormDataPersona);
                                  setNestedActiveStep(0);
                                  setNestedAccionistaId(null);
                                  setNestedFormError('');
                                  setNestedAccionistaTempIndex(null);
                                } else {
                                  setNestedFormError('Error al guardar el accionista en la empresa. Intente nuevamente.');
                                  // Revertir el cambio en el array si falla
                                  handleFieldChange(['accionistas'], currentAccionistas);
                                }
                              } catch (err) {
                                console.error('Error agregando accionista a la empresa:', err);
                                setNestedFormError('Error al agregar el accionista a la empresa.');
                                // Revertir el cambio en el array si falla
                                const currentAccionistas = formData.accionistas || [];
                                handleFieldChange(['accionistas'], currentAccionistas);
                              } finally {
                                setNestedSaving(false);
                              }
                            }}
                            disabled={nestedSaving}
                          >
                            {nestedSaving ? <CircularProgress size={20} /> : 'Agregar'}
                          </Button>
                          );
                        })()}
                      </Box>
                    </CardContent>
                  </Card>
                  );
                })()}
              </Grid>
            </Grid>
          );
        default:
          return null;
      }
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
          Accionistas
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleOpenCrear}
          style={{ backgroundColor: 'var(--main-green)', color: '#fff', alignSelf: isMobile ? 'stretch' : 'auto' }}
        >
          Agregar Accionista
        </Button>
      </Box>

      <Card
        style={{
          marginBottom: '1rem',
          backgroundColor: '#e3f2fd',
          border: '1px solid #2196f3'
        }}
      >
        <CardContent>
          <Typography variant="body2" style={{ color: '#1976d2' }}>
            Estimado Inversor: A continuación, ingrese los datos de los accionistas de la sociedad. Debe ingresar mas del 10% de participación de accionistas.
          </Typography>
        </CardContent>
      </Card>

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
          ) : accionistas.length === 0 ? (
            <Typography variant="body2" color="textSecondary" align="center">
              Aún no registraste accionistas. Utilizá el botón "Agregar Accionista" para comenzar.
            </Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  {!isMobile && <TableCell>Tipo</TableCell>}
                  <TableCell>Nombre/Denominación</TableCell>
                  {!isMobile && <TableCell>Documento/CUIT</TableCell>}
                  {!isMobile && <TableCell align="right">Porcentaje (%)</TableCell>}
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accionistas.map((accionista) => {
                  // Obtener nombre según el tipo
                  const nombre = accionista.tipo === 'PERSONA' && accionista.datosPersona?.datosPrincipales
                    ? `${accionista.datosPersona.datosPrincipales.nombres || ''} ${accionista.datosPersona.datosPrincipales.apellidos || ''}`.trim()
                    : accionista.tipo === 'EMPRESA' && accionista.datosEmpresa?.datosPrincipales?.denominacion
                    ? accionista.datosEmpresa.datosPrincipales.denominacion
                    : '-';
                  
                  // Obtener porcentaje según el tipo
                  const porcentaje = accionista.tipo === 'PERSONA'
                    ? (accionista.datosPersona?.datosPrincipales?.porcentajeParticipacion ?? null)
                    : (accionista.datosEmpresa?.datosPrincipales?.porcentajeParticipacion ?? null);
                  
                  const tipo = accionista.tipo || '-';
                  
                  // Obtener documento según el tipo
                  const documento = accionista.tipo === 'PERSONA' && accionista.datosPersona?.datosPersonales
                    ? `${accionista.datosPersona.datosPersonales.tipoID || ''} ${accionista.datosPersona.datosPersonales.idNumero || ''}`.trim()
                    : accionista.tipo === 'EMPRESA' && accionista.datosEmpresa?.datosFiscales?.claveFiscal
                    ? accionista.datosEmpresa.datosFiscales.claveFiscal
                    : '-';

                  return (
                    <React.Fragment key={accionista.id}>
                      <TableRow>
                        {!isMobile && <TableCell>{tipo === 'PERSONA' ? 'Persona' : 'Empresa'}</TableCell>}
                        <TableCell>{nombre}</TableCell>
                        {!isMobile && <TableCell>{documento}</TableCell>}
                        {!isMobile && <TableCell align="right">{porcentaje !== null ? `${parseFloat(porcentaje).toFixed(2)}%` : '-'}</TableCell>}
                        <TableCell align="right">
                          <IconButton onClick={() => handleOpenEditar(accionista)}>
                            <Edit />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(accionista.id)}>
                            <Delete />
                          </IconButton>
                          {tipo === 'EMPRESA' && accionista.datosEmpresa?.accionistas && accionista.datosEmpresa.accionistas.length > 0 && (
                            <IconButton onClick={() => handleManageAccionistas(accionista)}>
                              <ExpandMore />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                      {tipo === 'EMPRESA' && accionista.datosEmpresa?.accionistas && accionista.datosEmpresa.accionistas.length > 0 && (
                        <TableRow>
                          <TableCell colSpan={isMobile ? 2 : 5} style={{ padding: '1rem', border: 'none' }}>
                            <Accordion>
                              <AccordionSummary expandIcon={<ExpandMore />}>
                                <Typography variant="subtitle2">
                                  Accionistas de {nombre} ({accionista.datosEmpresa.accionistas.length})
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                <AccionistasNestedTable
                                  accionistas={accionista.datosEmpresa.accionistas}
                                  nivel={0}
                                  onEdit={handleOpenEditar}
                                  onDelete={handleDelete}
                                  solicitudId={solicitudId}
                                  empresaId={accionista.id}
                                />
                              </AccordionDetails>
                            </Accordion>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
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
                {editingAccionistaId ? 'Editar Accionista' : 'Agregar Accionista'}
              </Typography>
              <Button onClick={handleCancelForm} disabled={loading}>
                Cancelar
              </Button>
            </Box>
            {!isMobile ? (
              <Stepper activeStep={activeStep} alternativeLabel>
                {currentSteps.map((label) => (
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
                  Paso {activeStep + 1} de {currentSteps.length}
                </Typography>
                <Typography variant="subtitle1" style={{ fontWeight: 600, marginTop: '0.25rem' }}>
                  {currentSteps[activeStep]}
                </Typography>
              </Box>
            )}
            <Box marginTop="2rem" key={`step-${activeStep}`}>{renderStepContent(activeStep)}</Box>
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
              {activeStep < currentSteps.length - 1 ? (
                <Button
                  variant="outlined"
                  onClick={(e) => {
                    console.log('🔥 BOTÓN CONTINUAR CLICKEADO (Formulario Principal)');
                    console.log('activeStep:', activeStep);
                    console.log('editingAccionistaId:', editingAccionistaId);
                    console.log('formData.tipo:', formData.tipo);
                    console.log('isCurrentStepValid:', isCurrentStepValid);
                    handleNext();
                  }}
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
                  {saving ? <CircularProgress size={20} color="inherit" /> : 'Guardar Accionista'}
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {accionistas.length > 0 && (
        <Box marginTop="2.5rem">
          {!porcentajeValido && (
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
                  Suma actual: {sumaTotalPorcentajes.toFixed(2)}%
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
            <Button
              variant="outlined"
              onClick={() => history.push('/apertura/empresa/documentacion-respaldatoria')}
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
              onClick={() => history.push('/apertura/empresa/firmantes')}
              color="primary"
              disabled={!porcentajeValido}
              className="navigation-button"
              style={{
                backgroundColor: !porcentajeValido ? '#ccc' : 'var(--main-green)',
                color: '#fff'
              }}
            >
              Continuar
            </Button>
          </Box>
        </Box>
      )}

      <Dialog
        open={accionistasDialogOpen}
        onClose={() => setAccionistasDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Accionistas de la Empresa</DialogTitle>
        <DialogContent>
          <AccionistasNestedTable
            accionistas={currentEmpresaAccionistas || []}
            nivel={0}
            onEdit={handleOpenEditar}
            onDelete={handleDelete}
            solicitudId={solicitudId}
            empresaId={currentEmpresaId}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAccionistasDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setAccionistaToDelete(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            ¿Seguro que querés eliminar este accionista? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setAccionistaToDelete(null);
            }}
            color="default"
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmDelete}
            color="secondary"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AccionistasPage;
