import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

interface Props {
  // Callback function to run after the snackbar closes
  closeSnackbar: () => void;

  // Error returned by API call
  error?: string | undefined | null;

  // Loading state of API call
  loading?: boolean;

  // Sets the Alert severity
  severity?: 'error' | 'success';

  // Message to display on success
  successMessage?: string;
}

const DisplayApiResponse = ({
  closeSnackbar,
  error = null,
  loading = false,
  severity = 'error',
  successMessage,
}: Props) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      setOpen(true);
    }
  }, [loading]);

  const handleClose = () => {
    closeSnackbar();
    setOpen(false);
  };

  return (
    !loading
      ? (
        <Grid>
          <Snackbar
            {...!error && { autoHideDuration: 1000 }}
            open={open}
            onClose={handleClose}
          >
            <MuiAlert
              elevation={6}
              onClose={handleClose}
              severity={severity}
              variant="filled"
            >
              {error ? error : successMessage}
            </MuiAlert>
          </Snackbar>
        </Grid>
      ) : <></>
  );
};

export default DisplayApiResponse;
