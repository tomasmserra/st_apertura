import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography,
  Chip
} from '@material-ui/core';
import { ArrowBack, Add, Edit, Delete, Check, Close } from '@material-ui/icons';
import { authenticationService, empresaService } from '../../../services';

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

const tipoClienteOptions = [
  { value: 'PERSONAL', label: 'Personal' },
  { value: 'BUSINESS', label: 'Business' }
];

const tipoCuentaOptions = [
  { value: 'CHECKING', label: 'Checking' },
  { value: 'SAVINGS', label: 'Savings' }
];

const initialCuenta = {
  tipoCliente: 'PERSONAL',
  pais: 'ARGENTINA',
  banco: '',
  tipo: 'CHECKING',
  claveBancaria: '',
  numeroAba: '',
  identificacionSwift: ''
};

const getTipoClienteDisplay = (valor) => {
  const map = {
    PERSONAL: 'Personal',
    BUSINESS: 'Business'
  };
  return map[valor] || valor;
};

const getTipoCuentaDisplay = (valor) => {
  const map = {
    CHECKING: 'Checking',
    SAVINGS: 'Savings'
  };
  return map[valor] || valor;
};

const configs = {
  individuo: {
    get: (solicitudId) => authenticationService.getCuentasBancariasExteriorIndividuo(solicitudId),
    save: (datos) => authenticationService.saveCuentasBancariasExteriorIndividuo(datos),
    backPath: '/apertura/individuo/cuentas-bancarias',
    nextPath: '/apertura/individuo/declaraciones',
    includeUsuarioId: true,
    handleDebeCompletar: true
  },
  empresa: {
    get: (solicitudId) => empresaService.getCuentasBancariasExteriorEmpresa(solicitudId),
    save: (datos) => empresaService.saveCuentasBancariasExteriorEmpresa(datos),
    backPath: '/apertura/empresa/cuentas-bancarias',
    nextPath: '/apertura/empresa/declaraciones',
    includeUsuarioId: false,
    handleDebeCompletar: true
  }
};

const CuentasBancariasExteriorPage = () => {
  const history = useHistory();
  const location = useLocation();
  const variant = location.pathname.includes('/empresa/') ? 'empresa' : 'individuo';
  const config = configs[variant];

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [debeCompletar, setDebeCompletar] = useState(true);
  const [cuentasBancarias, setCuentasBancarias] = useState([]);
  const [formData, setFormData] = useState(initialCuenta);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [formVisible, setFormVisible] = useState(false);

  const solicitudId = useMemo(() => localStorage.getItem('currentSolicitudId'), []);

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      if (!solicitudId) {
        setError('No se encontró una solicitud activa.');
        return;
      }

      const response = await config.get(solicitudId);

      if (response && (response.status === 200 || response.ok)) {
        const debe = typeof response.debeCompletarCuentasBancariasExterior === 'boolean'
          ? response.debeCompletarCuentasBancariasExterior
          : true;
        setDebeCompletar(debe);

        if (debe) {
          setCuentasBancarias(response.cuentasBancarias || []);
        } else {
          history.push(config.nextPath);
        }
      } else {
        setError('Error al cargar las cuentas bancarias en el exterior existentes.');
      }
    } catch (err) {
      console.error('Error cargando cuentas bancarias exterior:', err);
      setError('Error al cargar las cuentas bancarias en el exterior existentes.');
    } finally {
      setLoading(false);
    }
  }, [config, history, solicitudId]);

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
    const requeridos = ['tipoCliente', 'pais', 'banco', 'tipo', 'claveBancaria'];
    return requeridos.every((campo) => {
      const value = formData[campo];
      return value !== undefined && value !== null && value.toString().trim() !== '';
    });
  };

  const handleOpenForm = (index = -1) => {
    if (index >= 0) {
      const cuenta = cuentasBancarias[index];
      setFormData({
        tipoCliente: cuenta.tipoCliente || 'PERSONAL',
        pais: cuenta.pais || 'ARGENTINA',
        banco: cuenta.banco || '',
        tipo: cuenta.tipo || 'CHECKING',
        claveBancaria: cuenta.claveBancaria || '',
        numeroAba: cuenta.numeroAba || '',
        identificacionSwift: cuenta.identificacionSwift || ''
      });
      setEditingIndex(index);
    } else {
      setFormData(initialCuenta);
      setEditingIndex(-1);
    }
    setFormVisible(true);
  };

  const handleCloseForm = () => {
    setFormVisible(false);
    setEditingIndex(-1);
    setFormData(initialCuenta);
  };

  const handleSaveCuenta = () => {
    if (!isFormValid()) {
      setError('Por favor complete todos los campos requeridos.');
      return;
    }

    const nuevasCuentas = [...cuentasBancarias];

    if (editingIndex >= 0) {
      const existente = cuentasBancarias[editingIndex];
      nuevasCuentas[editingIndex] = {
        ...existente,
        ...formData,
        id: existente.id
      };
    } else {
      nuevasCuentas.push({ ...formData });
    }

    setCuentasBancarias(nuevasCuentas);
    handleCloseForm();
    setError('');
  };

  const handleDeleteCuenta = (index) => {
    setCuentasBancarias(cuentasBancarias.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!solicitudId) {
      setError('No se encontró una solicitud activa.');
      return;
    }

    if (debeCompletar && cuentasBancarias.length === 0) {
      setError('Debe registrar al menos una cuenta bancaria en el exterior para continuar.');
      return;
    }

    try {
      setSaving(true);
      const currentUser = authenticationService.currentUserValue;
      const payload = {
        solicitudId: parseInt(solicitudId, 10),
        cuentasBancarias,
        debeCompletarCuentasBancariasExterior: debeCompletar
      };

      if (config.includeUsuarioId) {
        if (!currentUser || !currentUser.id) {
          setError('Error: Usuario no encontrado.');
          setSaving(false);
          return;
        }
        payload.idUsuario = currentUser.id;
      }

      const response = await config.save(payload);

      if (response && (response.status === 200 || response.ok)) {
        history.push(config.nextPath);
      } else {
        setError('Error al guardar las cuentas bancarias en el exterior. Intente nuevamente.');
      }
    } catch (err) {
      console.error('Error guardando cuentas bancarias exterior:', err);
      setError('Error de conexión al guardar las cuentas bancarias en el exterior. Intente nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleVolver = () => {
    history.push(config.backPath);
  };

  const handleSaltar = () => {
    history.push(config.nextPath);
  };

  if (loading && cuentasBancarias.length === 0 && debeCompletar) {
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
          Cuentas Bancarias en el Exterior
        </Typography>

        {error && (
          <Card
            style={{
              width: '100%',
              maxWidth: '800px',
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

        {!debeCompletar ? (
          <Card style={{ width: '100%', maxWidth: '600px' }}>
            <CardContent style={{ padding: '2rem', textAlign: 'center' }}>
              <Typography variant="h6" style={{ marginBottom: '1rem', color: 'var(--main-green)' }}>
                ¡Perfecto!
              </Typography>
              <Typography variant="body1" style={{ marginBottom: '2rem' }}>
                No es necesario completar cuentas bancarias en el exterior para su solicitud.
              </Typography>

              <Box display="flex" justifyContent="center" className="navigation-buttons">
                <Button
                  variant="outlined"
                  onClick={handleVolver}
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
                  onClick={handleSaltar}
                  className="navigation-button"
                  style={{
                    backgroundColor: 'var(--main-green)',
                    color: '#fff'
                  }}
                >
                  Continuar
                </Button>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Card style={{ width: '100%', maxWidth: '800px' }}>
            <CardContent style={{ padding: '2rem' }}>
              <form onSubmit={handleSubmit}>
                <Box display="flex" justifyContent="space-between" alignItems="center" style={{ marginBottom: '2rem' }}>
                  <Typography variant="h6" style={{ fontWeight: 'bold' }}>
                    Mis Cuentas Bancarias en el Exterior
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenForm()}
                    size="small"
                    style={{
                      backgroundColor: 'var(--main-green)',
                      color: '#fff',
                      padding: '6px 12px',
                      fontSize: '12px'
                    }}
                  >
                    Agregar Cuenta
                  </Button>
                </Box>

                {formVisible && (
                  <Card variant="outlined" style={{ marginBottom: '2rem' }}>
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth variant="outlined">
                            <InputLabel>Holder Type</InputLabel>
                            <Select
                              value={formData.tipoCliente}
                              onChange={(e) => handleInputChange('tipoCliente', e.target.value)}
                              label="Holder Type"
                            >
                              {tipoClienteOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth variant="outlined">
                            <InputLabel>País</InputLabel>
                            <Select
                              value={formData.pais}
                              onChange={(e) => handleInputChange('pais', e.target.value)}
                              label="País"
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
                            label="Banco (Bank)"
                            value={formData.banco}
                            onChange={(e) => handleInputChange('banco', e.target.value)}
                            required
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth variant="outlined">
                            <InputLabel>Account Type</InputLabel>
                            <Select
                              value={formData.tipo}
                              onChange={(e) => handleInputChange('tipo', e.target.value)}
                              label="Account Type"
                            >
                              {tipoCuentaOptions.map((option) => (
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
                            variant="outlined"
                            label="Número"
                            value={formData.claveBancaria}
                            onChange={(e) => handleInputChange('claveBancaria', e.target.value)}
                            required
                            placeholder="Ingrese el número de cuenta"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            variant="outlined"
                            label="Número de banco ABA (Routing number)"
                            value={formData.numeroAba}
                            onChange={(e) => handleInputChange('numeroAba', e.target.value)}
                            placeholder="Opcional"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            variant="outlined"
                            label="Identificación SWIFT"
                            value={formData.identificacionSwift}
                            onChange={(e) => handleInputChange('identificacionSwift', e.target.value)}
                            placeholder="Opcional"
                          />
                        </Grid>
                      </Grid>
                      <Box display="flex" justifyContent="flex-end" gap={1} marginTop={2}>
                        <Button onClick={handleCloseForm} startIcon={<Close />}>
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleSaveCuenta}
                          variant="contained"
                          disabled={!isFormValid()}
                          startIcon={<Check />}
                          style={{
                            backgroundColor: isFormValid() ? 'var(--main-green)' : '#ccc',
                            color: '#fff'
                          }}
                        >
                          {editingIndex >= 0 ? 'Actualizar' : 'Agregar'}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                )}

                {cuentasBancarias.length === 0 ? (
                  <Box textAlign="center" style={{ padding: '2rem' }}>
                    <Typography variant="body1" color="textSecondary">
                      No hay cuentas bancarias en el exterior agregadas. Haga clic en "Agregar Cuenta" para comenzar.
                    </Typography>
                  </Box>
                ) : (
                  <List>
                    {cuentasBancarias.map((cuenta, index) => (
                      <ListItem key={cuenta.id || `${cuenta.tipo}-${cuenta.banco}-${index}`} divider>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="subtitle1" style={{ fontWeight: 'bold', paddingRight: '10px' }}>
                                {getTipoCuentaDisplay(cuenta.tipo)} - {cuenta.banco}
                              </Typography>
                              <Chip label={cuenta.pais} size="small" color="primary" variant="outlined" />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="textSecondary">
                                {getTipoClienteDisplay(cuenta.tipoCliente)} - Número: {cuenta.claveBancaria}
                              </Typography>
                              {cuenta.numeroAba && (
                                <Typography variant="body2" color="textSecondary">
                                  ABA: {cuenta.numeroAba}
                                </Typography>
                              )}
                              {cuenta.identificacionSwift && (
                                <Typography variant="body2" color="textSecondary">
                                  SWIFT: {cuenta.identificacionSwift}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton edge="end" onClick={() => handleOpenForm(index)} style={{ marginRight: '8px' }}>
                            <Edit />
                          </IconButton>
                          <IconButton edge="end" onClick={() => handleDeleteCuenta(index)}>
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}

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
                    disabled={saving}
                    className="navigation-button"
                    style={{
                      backgroundColor: 'var(--main-green)',
                      color: '#fff'
                    }}
                  >
                    {saving ? <CircularProgress size={20} color="inherit" /> : 'Continuar'}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
};

export default CuentasBancariasExteriorPage;
