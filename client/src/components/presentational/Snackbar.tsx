import Grid from '@mui/material/Grid';
import MuiSnackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { SeverityLevel } from '../../types';
import styled from '@emotion/styled';

interface Props {
  closeSnackbar: () => void;
  message?: string | undefined | null;
  severity?: SeverityLevel;
}

const StyledSnackbar = styled(MuiSnackbar)({
  bottom: '120px',
  '@media(min-width: 600px)': {
    bottom: '140px'
  }
});

const Snackbar = ({
  closeSnackbar,
  message = '',
  severity = 'error',
}: Props) => {
  const handleClose = () => {
    closeSnackbar();
  };

  return (
    <Grid>
      <StyledSnackbar
        {...!message && { autoHideDuration: 1000 }}
        open={true}
        onClose={handleClose}
      >
        <MuiAlert
          elevation={6}
          onClose={handleClose}
          severity={severity}
          variant="filled"
        >
          {message}
        </MuiAlert>
      </StyledSnackbar>
    </Grid>
  );
};

export default Snackbar;
