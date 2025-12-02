import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography
} from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';
import terminosPdf from '../../../pdf/TerminosYCondiciones.pdf';
import gestionFondosPdf from '../../../pdf/GestionFondos.pdf';
import comisionesPdf from '../../../pdf/Comisiones.pdf';

const documentosConfig = {
  'terminos-condiciones': {
    titulo: 'Términos y Condiciones',
    descripcion:
      'Leé el documento completo con los términos y condiciones para la apertura de cuenta y operatoria online.',
    archivo: terminosPdf
  },
  'reglamento-gestion-fondos': {
    titulo: 'Reglamento de Gestión de Fondos',
    descripcion: 'Consultá el reglamento completo de gestión de fondos.',
    archivo: gestionFondosPdf
  },
  'comisiones-derechos-mercado': {
    titulo: 'Comisiones y Derechos de Mercado',
    descripcion: 'Revisá las comisiones y derechos de mercado vigentes.',
    archivo: comisionesPdf
  }
};

const DocumentoPdfPage = () => {
  const history = useHistory();
  const { documento } = useParams();

  const config = documentosConfig[documento];

  if (!config) {
    return (
      <Container maxWidth="md" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Documento no encontrado
            </Typography>
            <Typography variant="body1" paragraph>
              El documento que intentás visualizar no existe o ya no está disponible.
            </Typography>
            <Button variant="contained" color="primary" onClick={() => history.goBack()}>
              Volver
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <Box display="flex" flexDirection="column" alignItems="center">
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          style={{ color: 'var(--light-blue)', fontWeight: 'bold', textAlign: 'center' }}
        >
          {config.titulo}
        </Typography>
        <Typography variant="body1" style={{ marginBottom: '1.5rem', textAlign: 'center', maxWidth: '900px' }}>
          {config.descripcion}
        </Typography>

        <Card style={{ width: '100%', maxWidth: '960px' }}>
          <CardContent style={{ padding: 0 }}>
            <Box
              component="iframe"
              src={config.archivo}
              title={config.titulo}
              style={{
                width: '100%',
                height: '75vh',
                border: 'none'
              }}
            />
          </CardContent>
        </Card>

        <Box marginTop="2rem">
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => {
              if (window.history.length > 1) {
                history.goBack();
              } else {
                window.close();
              }
            }}
            style={{ textTransform: 'none' }}
          >
            Volver
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default DocumentoPdfPage;

