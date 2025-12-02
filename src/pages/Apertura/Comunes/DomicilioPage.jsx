import React, { useEffect, useMemo, useState } from 'react';
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

const configs = {
  individuo: {
    get: (solicitudId) => authenticationService.getDomicilioIndividuo(solicitudId),
    save: (datos) => authenticationService.saveDomicilioIndividuo(datos),
    backPath: '/apertura/individuo/datos-personales',
    nextPath: '/apertura/individuo/datos-fiscales',
    defaultTipo: 'LEGAL',
    requiresUsuarioId: true
  },
  empresa: {
    get: (solicitudId) => empresaService.getDomicilioEmpresa(solicitudId),
    save: (datos) => empresaService.saveDomicilioEmpresa(datos),
    backPath: '/apertura/empresa/datos-organizacion',
    nextPath: '/apertura/empresa/datos-fiscales',
    defaultTipo: 'REAL',
    requiresUsuarioId: false
  }
};

const initialFormData = {
  calle: '',
  numero: '',
  piso: '',
  depto: '',
  barrio: '',
  ciudad: '',
  provincia: '',
  pais: 'ARGENTINA',
  cp: ''
};

const DomicilioPage = () => {
  const history = useHistory();
  const location = useLocation();
  const variant = location.pathname.includes('/empresa/') ? 'empresa' : 'individuo';
  const config = configs[variant];

  const [formData, setFormData] = useState(initialFormData);
  const [tipoDomicilio, setTipoDomicilio] = useState(config.defaultTipo);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [provincias, setProvincias] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [provinciaSeleccionadaId, setProvinciaSeleccionadaId] = useState(null);

  const solicitudId = useMemo(() => localStorage.getItem('currentSolicitudId'), []);

  // Cargar provincias al montar el componente
  useEffect(() => {
    const cargarProvincias = async () => {
      try {
        console.log('Cargando provincias...');
        const provinciasData = await empresaService.getProvincias();
        console.log('Provincias recibidas en componente:', provinciasData);
        if (Array.isArray(provinciasData) && provinciasData.length > 0) {
          setProvincias(provinciasData);
          console.log('Provincias establecidas en estado:', provinciasData.length);
        } else {
          console.warn('No se recibieron provincias o el array está vacío');
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
      if (formData.provincia && provincias.length > 0 && !provinciaSeleccionadaId) {
        const provinciaEncontrada = provincias.find(p => p.codigoUIF === formData.provincia);
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
  }, [formData.provincia, provincias, provinciaSeleccionadaId]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, config, solicitudId]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');

      if (!solicitudId) {
        setError('No se encontró una solicitud activa.');
        return;
      }

      const response = await config.get(solicitudId);

      if (response && (response.status === 200 || response.ok)) {
        const domicilioData = {
          calle: response.calle || '',
          numero: response.numero || '',
          piso: response.piso || '',
          depto: response.depto || '',
          barrio: response.barrio || '',
          ciudad: response.ciudad || '',
          provincia: response.provincia || '',
          pais: response.pais || 'ARGENTINA',
          cp: response.cp || ''
        };
        setFormData(domicilioData);
        setTipoDomicilio(response.tipo || config.defaultTipo);
      }
    } catch (err) {
      console.error('Error cargando domicilio:', err);
      setError('Error al cargar el domicilio.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormValid = () => {
    const camposRequeridos = [
      formData.calle,
      formData.ciudad,
      formData.provincia,
      formData.pais,
      formData.cp
    ];

    return camposRequeridos.every((campo) => campo && campo.trim() !== '');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!solicitudId) {
      setError('No se encontró una solicitud activa.');
      return;
    }

    if (!isFormValid()) {
      setError('Completá los campos obligatorios del domicilio.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const payload = {
        solicitudId: parseInt(solicitudId, 10),
        tipo: tipoDomicilio || config.defaultTipo,
        calle: formData.calle.trim(),
        numero: formData.numero.trim(),
        piso: formData.piso.trim(),
        depto: formData.depto.trim(),
        barrio: formData.barrio.trim(),
        ciudad: formData.ciudad.trim(),
        provincia: formData.provincia.trim(),
        pais: formData.pais.trim(),
        cp: formData.cp.trim()
      };

      if (config.requiresUsuarioId) {
        const currentUser = authenticationService.currentUserValue;
        if (!currentUser || !currentUser.id) {
          setError('Error: usuario no encontrado.');
          setSaving(false);
          return;
        }
        payload.idUsuario = currentUser.id;
      }

      const response = await config.save(payload);

      if (response && (response.status === 200 || response.ok)) {
        if (config.nextPath) {
          history.push(config.nextPath);
        } else {
          setError('');
        }
      } else {
        setError('Ocurrió un error al guardar el domicilio.');
      }
    } catch (err) {
      console.error('Error guardando domicilio:', err);
      setError('Ocurrió un error al guardar el domicilio.');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !formData.calle) {
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
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center">
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          style={{ color: 'var(--light-blue)', fontWeight: 'bold', marginBottom: '1rem' }}
        >
          Domicilio
        </Typography>

        {error && (
          <Card
            style={{
              width: '100%',
              maxWidth: '600px',
              marginBottom: '1.5rem',
              backgroundColor: '#ffebee',
              border: '1px solid #f44336'
            }}
          >
            <CardContent style={{ padding: '1rem' }}>
              <Typography variant="body2" style={{ color: '#d32f2f', textAlign: 'center' }}>
                {error}
              </Typography>
            </CardContent>
          </Card>
        )}

        <Card style={{ width: '100%', maxWidth: '600px' }}>
          <CardContent style={{ padding: '2rem' }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={12}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Calle"
                    value={formData.calle}
                    onChange={(e) => handleInputChange('calle', e.target.value)}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Número"
                    value={formData.numero}
                    onChange={(e) => handleInputChange('numero', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Código Postal"
                    value={formData.cp}
                    onChange={(e) => handleInputChange('cp', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Piso"
                    value={formData.piso}
                    onChange={(e) => handleInputChange('piso', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Departamento"
                    value={formData.depto}
                    onChange={(e) => handleInputChange('depto', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>País</InputLabel>
                    <Select
                      value={formData.pais}
                      onChange={(e) => handleInputChange('pais', e.target.value)}
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
                          handleInputChange('provincia', provincia.codigoUIF);
                        }
                        // Limpiar ciudad cuando cambia la provincia
                        handleInputChange('ciudad', '');
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
                      value={formData.ciudad || ''}
                      onChange={(e) => {
                        const localidadCodigoUIF = e.target.value;
                        handleInputChange('ciudad', localidadCodigoUIF);
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
                    variant="outlined"
                    label="Barrio"
                    value={formData.barrio}
                    onChange={(e) => handleInputChange('barrio', e.target.value)}
                  />
                </Grid>
              </Grid>

              <Box display="flex" justifyContent="center" className="navigation-buttons" style={{ marginTop: '2rem' }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={() => history.push(config.backPath)}
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

export default DomicilioPage;
