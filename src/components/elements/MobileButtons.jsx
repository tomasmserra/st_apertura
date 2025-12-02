import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Link, useHistory } from 'react-router-dom'
import LabelImportantIcon from '@mui/icons-material/LabelImportant';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import MenuIcon from '@mui/icons-material/Menu';
import { authenticationService } from '../../services';

const StyledMenu = styled((props) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color:
      theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '4px 0',
    },
    '& .MuiMenuItem-root': {
      '& .MuiSvgIcon-root': {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      '&:active': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity,
        ),
      },
    },
  },
}));

export default function MobileButtons({ loggedIn, evaluarSesion }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const history = useHistory();
  const open = Boolean(anchorEl);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCerrarSesion = () => {
    handleClose();
    authenticationService.logout();
    if (evaluarSesion) {
      evaluarSesion();
    }
    history.push('/');
  };

  // Menú simplificado para dealApertura
  const menuItems = [
    { title: 'Abrir Cuenta', link: '/' },
    { title: 'Ingresar', link: '/login' },
    { title: 'Operar', link: 'https://anima.stsecurities.com.ar', external: true }
  ];

  return (
    <div>
      <Button
        id="demo-customized-button"
        aria-controls="demo-customized-menu"
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        variant="contained"
        disableElevation
        onClick={handleClick}
      >
        <MenuIcon />
      </Button>
      <StyledMenu
        id="demo-customized-menu"
        MenuListProps={{
          'aria-labelledby': 'demo-customized-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {loggedIn ? (
          <MenuItem onClick={handleCerrarSesion} disableRipple>
            <ExitToAppIcon /> Cerrar Sesión
          </MenuItem>
        ) : (
          menuItems.map((item, index) => {
            if (item.external) {
              return (
                <a key={index} href={item.link} target="_blank" rel="noreferrer" className="inline menu-subitem" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <MenuItem onClick={handleClose} disableRipple>
                    <LabelImportantIcon /> {item.title}
                  </MenuItem>
                </a>
              );
            }
            return (
              <Link key={index} to={item.link} className="inline menu-subitem">
                <MenuItem onClick={handleClose} disableRipple>
                  <LabelImportantIcon /> {item.title}
                </MenuItem>
              </Link>
            );
          })
        )}
      </StyledMenu>
    </div>
  );
}
