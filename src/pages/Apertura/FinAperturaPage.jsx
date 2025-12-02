import React from 'react';
import { useHistory } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography
} from '@material-ui/core';
const FinAperturaPage = () => {
  const history = useHistory();

  return (
    <Container maxWidth="md" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          style={{ color: 'var(--light-blue)', fontWeight: 'bold', marginBottom: '1rem' }}
        >
          ¡Proceso de Apertura Finalizado!
        </Typography>

        <Card style={{ width: '100%', maxWidth: '720px' }}>
          <CardContent style={{ padding: '2rem' }}>
            <Typography variant="body1" paragraph>
              Hemos recibido toda la información necesaria para continuar con la apertura de tu cuenta. Nuestro equipo
              revisará la documentación y te contactará a la brevedad con los próximos pasos.
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Si necesitás realizar cambios o cargar co-titulares más adelante, podés volver a ingresar en cualquier
              momento.
            </Typography>
            <Box display="flex" justifyContent="center" marginTop="2rem">
              <Button
                variant="contained"
                onClick={() => history.push('/tipo-apertura')}
                style={{
                  backgroundColor: 'var(--main-green)',
                  color: '#fff',
                  textTransform: 'none'
                }}
              >
                Abrir otra cuenta
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default FinAperturaPage;

