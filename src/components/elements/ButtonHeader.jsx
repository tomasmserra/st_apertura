import * as React from 'react';
import Button from '@mui/material/Button';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Stack from '@mui/material/Stack';
import LabelImportantIcon from '@mui/icons-material/LabelImportant';
import {Link} from 'react-router-dom'

export default function ButtonHeader(props) {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);

  const {title, subItems} = props

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  function handleListKeyDown(event) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(open);
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  return (
    <Stack direction="row" spacing={2} style={{display: "inline"}}>
        <Button
          ref={anchorRef}
          id="composition-button"
          aria-controls={open ? 'composition-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
          className="h-100p btn-header-alto"
        >
          {title}
        </Button>
        {
            subItems && subItems.length > 1 ? 
            <>
                <Popper
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                placement="bottom-start"
                transition
                disablePortal
                >
                {({ TransitionProps, placement }) => (
                    <Grow
                    {...TransitionProps}
                    style={{
                        transformOrigin:
                        placement === 'bottom-start' ? 'left top' : 'left bottom',
                    }}
                    >
                    <Paper>
                        <ClickAwayListener onClickAway={handleClose}>
                        <MenuList
                            autoFocusItem={open}
                            id="composition-menu"
                            aria-labelledby="composition-button"
                            onKeyDown={handleListKeyDown}
                            className="my-auto menu-subitem"
                        >
                            {
                                subItems.map((x, index) => {
                                  if(x.link && x.link.includes("http"))
                                    return <MenuItem key={index} onClick={handleClose}><a href={x.link} target="_blank" className="menu-subitem" rel="noreferrer"><LabelImportantIcon /> <span style={{marginLeft:"10px"}}>{x.title} </span></a> </MenuItem>
                                  else
                                    return <MenuItem key={index} onClick={handleClose}><Link to={x.link || '#'} className="menu-subitem"><LabelImportantIcon /> <span style={{marginLeft:"10px"}}>{x.title} </span></Link></MenuItem>
                                })
                            }
                            
                        </MenuList>
                        </ClickAwayListener>
                    </Paper>
                    </Grow>
                )}
                </Popper>
            </>

            :

            ""
        }
        
    </Stack>
  );
}
