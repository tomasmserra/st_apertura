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

const configs = {
  individuo: {
    get: (solicitudId) => authenticationService.getCuentasBancariasIndividuo(solicitudId),
    save: (datos) => authenticationService.saveCuentasBancariasIndividuo(datos),
    backPath: '/apertura/individuo/datos-fiscales-exterior',
    nextPath: '/apertura/individuo/cuentas-bancarias-exterior',
    includeUsuarioId: true
  },
  empresa: {
    get: (solicitudId) => empresaService.getCuentasBancariasEmpresa(solicitudId),
    save: (datos) => empresaService.saveCuentasBancariasEmpresa(datos),
    backPath: '/apertura/empresa/registro',
    nextPath: '/apertura/empresa/cuentas-bancarias-exterior',
    includeUsuarioId: false
  }
};

const initialCuenta = {
  tipo: 'CUENTA_CORRIENTE',
  banco: '',
  moneda: 'PESOS',
  tipoClaveBancaria: 'CBU',
  claveBancaria: ''
};

const tipoOptions = [
  { value: 'CUENTA_CORRIENTE', label: 'Cuenta Corriente' },
  { value: 'CAJA_AHORRO', label: 'Caja de Ahorro' },
  { value: 'CUENTA_JUDICIAL', label: 'Cuenta Judicial' },
  { value: 'OTRO', label: 'Otro' }
];

const monedaOptions = [
  { value: 'PESOS', label: 'Pesos' },
  { value: 'DOLARES', label: 'Dólares' },
  { value: 'BIMONETARIA', label: 'Bimonetaria' }
];

const tipoClaveOptions = [
  { value: 'CBU', label: 'CBU' },
  { value: 'CVU', label: 'CVU' }
];

const getTipoDisplay = (tipo) => {
  const map = {
    CUENTA_CORRIENTE: 'Cuenta Corriente',
    CAJA_AHORRO: 'Caja de Ahorro',
    CUENTA_JUDICIAL: 'Cuenta Judicial',
    OTRO: 'Otro'
  };
  return map[tipo] || tipo;
};

const getMonedaDisplay = (moneda) => {
  const map = {
    PESOS: 'Pesos',
    DOLARES: 'Dólares',
    BIMONETARIA: 'Bimonetaria'
  };
  return map[moneda] || moneda;
};

const getClaveDisplay = (tipo) => {
  const map = {
    CBU: 'CBU',
    CVU: 'CVU'
  };
  return map[tipo] || tipo;
};

const CuentasBancariasPage = () => {
  const history = useHistory();
  const location = useLocation();
  const variant = location.pathname.includes('/empresa/') ? 'empresa' : 'individuo';
  const config = configs[variant];

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [cuentasBancarias, setCuentasBancarias] = useState([]);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [formData, setFormData] = useState(initialCuenta);
  const [claveBancariaError, setClaveBancariaError] = useState('');
  const [formVisible, setFormVisible] = useState(false);

  const solicitudId = useMemo(() => localStorage.getItem('currentSolicitudId'), []);

  const cargarCuentasBancarias = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      if (!solicitudId) {
        setError('No se encontró una solicitud activa.');
        return;
      }

      const response = await config.get(solicitudId);

      if (response && (response.status === 200 || response.ok)) {
        setCuentasBancarias(response.cuentasBancarias || []);
      } else {
        setError('Error al cargar las cuentas bancarias existentes.');
      }
    } catch (err) {
      console.error('Error cargando cuentas bancarias:', err);
      setError('Error al cargar las cuentas bancarias existentes');
    } finally {
      setLoading(false);
    }
  }, [config, solicitudId]);

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
      cargarCuentasBancarias();
    }
  }, [history, cargarCuentasBancarias]);

  const validateClaveBancaria = (tipoClave, valor) => {
    if (!valor) return '';
    const soloNumeros = valor.replace(/[^0-9]/g, '');

    if (tipoClave === 'CBU' || tipoClave === 'CVU') {
      if (soloNumeros.length !== 22) {
        return `${tipoClave} debe tener exactamente 22 dígitos`;
      }
    }
    return '';
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));

    if (field === 'claveBancaria') {
      setClaveBancariaError(validateClaveBancaria(formData.tipoClaveBancaria, value));
    } else if (field === 'tipoClaveBancaria') {
      setClaveBancariaError(validateClaveBancaria(value, formData.claveBancaria));
    }
  };

  const isFormValid = () => {
    const requeridos = ['tipo', 'banco', 'moneda', 'tipoClaveBancaria', 'claveBancaria'];
    const completos = requeridos.every((campo) => {
      const value = formData[campo];
      return value !== undefined && value !== null && value.toString().trim() !== '';
    });
    return completos && !claveBancariaError;
  };

  const handleOpenForm = (index = -1) => {
    if (index >= 0) {
      const cuenta = cuentasBancarias[index];
      setFormData({
        tipo: cuenta.tipo,
        banco: cuenta.banco,
        moneda: cuenta.moneda,
        tipoClaveBancaria: cuenta.tipoClaveBancaria,
        claveBancaria: cuenta.claveBancaria
      });
      setEditingIndex(index);
    } else {
      setFormData(initialCuenta);
      setEditingIndex(-1);
    }
    setClaveBancariaError('');
    setFormVisible(true);
  };

  const handleCloseForm = () => {
    setEditingIndex(-1);
    setClaveBancariaError('');
    setFormData(initialCuenta);
    setFormVisible(false);
  };

  const handleSaveCuenta = () => {
    if (!isFormValid()) {
      setError('Por favor complete todos los campos requeridos.');
      return;
    }

    const nuevasCuentas = [...cuentasBancarias];

    if (editingIndex >= 0) {
      const cuentaExistente = cuentasBancarias[editingIndex];
      nuevasCuentas[editingIndex] = {
        ...cuentaExistente,
        ...formData,
        id: cuentaExistente.id
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

    if (cuentasBancarias.length === 0) {
      setError('Debe registrar al menos una cuenta bancaria para continuar.');
      return;
    }

    try {
      setSaving(true);
      const currentUser = authenticationService.currentUserValue;
      const payload = {
        solicitudId: parseInt(solicitudId, 10),
        cuentasBancarias
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
        setError('Error al guardar las cuentas bancarias. Intente nuevamente.');
      }
    } catch (err) {
      console.error('Error guardando cuentas bancarias:', err);
      setError('Error de conexión al guardar las cuentas bancarias. Intente nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleVolver = () => {
    history.push(config.backPath);
  };

  if (loading && cuentasBancarias.length === 0) {
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
          Cuentas Bancarias
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

        <Card style={{ width: '100%', maxWidth: '800px' }}>
          <CardContent style={{ padding: '2rem' }}>
            <form onSubmit={handleSubmit}>
              <Box display="flex" justifyContent="space-between" alignItems="center" style={{ marginBottom: '2rem' }}>
                <Typography variant="h6" style={{ fontWeight: 'bold' }}>
                  Mis Cuentas Bancarias
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
                          <InputLabel>Tipo de Cuenta</InputLabel>
                          <Select
                            value={formData.tipo}
                            onChange={(e) => handleInputChange('tipo', e.target.value)}
                            label="Tipo de Cuenta"
                          >
                            {tipoOptions.map((option) => (
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
                          label="Banco"
                          value={formData.banco}
                          onChange={(e) => handleInputChange('banco', e.target.value)}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel>Moneda</InputLabel>
                          <Select
                            value={formData.moneda}
                            onChange={(e) => handleInputChange('moneda', e.target.value)}
                            label="Moneda"
                          >
                            {monedaOptions.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel>Tipo de Clave</InputLabel>
                          <Select
                            value={formData.tipoClaveBancaria}
                            onChange={(e) => handleInputChange('tipoClaveBancaria', e.target.value)}
                            label="Tipo de Clave"
                          >
                            {tipoClaveOptions.map((option) => (
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
                          label={getClaveDisplay(formData.tipoClaveBancaria)}
                          value={formData.claveBancaria}
                          onChange={(e) => handleInputChange('claveBancaria', e.target.value.replace(/[^0-9]/g, ''))}
                          required
                          error={!!claveBancariaError}
                          helperText={
                            claveBancariaError || `Ingrese su ${getClaveDisplay(formData.tipoClaveBancaria)} (22 dígitos)`
                          }
                          placeholder={`Ingrese su ${getClaveDisplay(formData.tipoClaveBancaria)}`}
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
                    No hay cuentas bancarias agregadas. Haga clic en "Agregar Cuenta" para comenzar.
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
                              {getTipoDisplay(cuenta.tipo)} - {cuenta.banco}
                            </Typography>
                            <Chip label={getMonedaDisplay(cuenta.moneda)} size="small" color="primary" variant="outlined" />
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="textSecondary">
                            {getClaveDisplay(cuenta.tipoClaveBancaria)}: {cuenta.claveBancaria}
                          </Typography>
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
                  disabled={saving || cuentasBancarias.length === 0}
                  className="navigation-button"
                  style={{
                    backgroundColor: cuentasBancarias.length > 0 ? 'var(--main-green)' : '#ccc',
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

export default CuentasBancariasPage;
