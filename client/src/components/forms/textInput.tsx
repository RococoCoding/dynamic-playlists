import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, styled } from "@mui/material";
type Props = {
  isDialogOpen: boolean,
  handleDialogClose: () => void,
  inputValue: string,
  inputLabel: string,
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
  handleSubmit: () => void,
  formTitle: string,
}

const StyledDialogTitle = styled(DialogTitle)({
  backgroundColor: '#282c34',
  color: 'white',
});

const StyledDialogContent = styled(DialogContent)({
  backgroundColor: '#282c34',
});

const StyledDialogActions = styled(DialogActions)({
  backgroundColor: '#282c34',
});

const CancelButton = styled(Button)({
  color: 'white'
});

function textInput({
  isDialogOpen,
  handleDialogClose,
  inputValue,
  inputLabel,
  handleInputChange,
  handleSubmit,
  formTitle,
}: Props) {
  return (
    <Dialog open={isDialogOpen} onClose={handleDialogClose}>
      <StyledDialogTitle>{formTitle}</StyledDialogTitle>
      <StyledDialogContent>
        <TextField
          autoFocus
          margin="dense"
          label={inputLabel}
          fullWidth
          sx={{
            input: {
              color: 'white',
            },
          }}
          InputProps={{
            sx: {
              'fieldset': { borderColor: '#636363' }
            }
          }}
          InputLabelProps={{
            sx: {
              color: '#636363',
            },
          }}
          color='primary'
          value={inputValue}
          onChange={handleInputChange}
        />
      </StyledDialogContent>
      <StyledDialogActions>
        <CancelButton onClick={handleDialogClose}>Cancel</CancelButton>
        <Button onClick={handleSubmit} disabled={!inputValue}>Create</Button>
      </StyledDialogActions>
    </Dialog>
  )
}

export default textInput;