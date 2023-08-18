import { DialogTitle, DialogContent, TextField, styled } from "@mui/material";
type Props = {
  inputValue: string,
  inputLabel: string,
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
  formTitle: string,
}

const StyledDialogTitle = styled(DialogTitle)({
  backgroundColor: '#282c34',
  color: 'white',
});

const StyledDialogContent = styled(DialogContent)({
  backgroundColor: '#282c34',
});

function TextInput({
  inputValue,
  inputLabel,
  handleInputChange,
  formTitle,
}: Props) {
  return (
    <>
      <StyledDialogTitle>{formTitle}</StyledDialogTitle>
      <StyledDialogContent>
        <TextField
          autoFocus
          margin="dense"
          label={inputLabel}
          fullWidth
          color='primary'
          value={inputValue}
          onChange={handleInputChange}
        />
      </StyledDialogContent>
    </>
  )
}

export default TextInput;