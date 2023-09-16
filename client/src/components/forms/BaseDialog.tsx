import { Dialog, DialogActions, Button, styled } from "@mui/material";
type Props = {
  dialogContent: JSX.Element,
  fullWidth?: boolean,
  handleDialogClose: () => void,
  handleSubmit: () => void,
  isDialogOpen: boolean,
  submitDisabled: boolean,
  submitText?: string,
}

const StyledDialogActions = styled(DialogActions)({
  backgroundColor: '#282c34',
});

const CancelButton = styled(Button)({
  color: 'white'
});

function BaseDialog({
  dialogContent,
  fullWidth = false,
  handleDialogClose,
  handleSubmit,
  isDialogOpen,
  submitDisabled,
  submitText = 'Create',
}: Props) {
  return (
    <Dialog fullWidth={fullWidth} open={isDialogOpen} onClose={handleDialogClose}>
      {dialogContent}
      <StyledDialogActions>
        <CancelButton onClick={handleDialogClose}>Cancel</CancelButton>
        <Button onClick={handleSubmit} disabled={submitDisabled}>{submitText}</Button>
      </StyledDialogActions>
    </Dialog>
  )
}

export default BaseDialog;