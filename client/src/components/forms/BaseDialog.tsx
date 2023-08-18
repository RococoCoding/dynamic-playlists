import { Dialog, DialogActions, Button, styled } from "@mui/material";
type Props = {
  dialogContent: JSX.Element,
  submitDisabled: boolean,
  isDialogOpen: boolean,
  handleDialogClose: () => void,
  handleSubmit: () => void,
}

const StyledDialogActions = styled(DialogActions)({
  backgroundColor: '#282c34',
});

const CancelButton = styled(Button)({
  color: 'white'
});

function BaseDialog({
  dialogContent,
  submitDisabled,
  handleDialogClose,
  handleSubmit,
  isDialogOpen,
}: Props) {
  return (
    <Dialog open={isDialogOpen} onClose={handleDialogClose}>
      {dialogContent}
      <StyledDialogActions>
        <CancelButton onClick={handleDialogClose}>Cancel</CancelButton>
        <Button onClick={handleSubmit} disabled={submitDisabled}>Create</Button>
      </StyledDialogActions>
    </Dialog>
  )
}

export default BaseDialog;