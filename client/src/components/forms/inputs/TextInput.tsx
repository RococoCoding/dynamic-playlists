import { TextField } from "@mui/material";
type Props = {
  inputValue: string,
  inputLabel: string,
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
}

function TextInput({
  inputValue,
  inputLabel,
  handleInputChange,
}: Props) {
  return (
    <TextField
      autoFocus
      margin="dense"
      label={inputLabel}
      fullWidth
      color='primary'
      value={inputValue}
      onChange={handleInputChange}
    />
  )
}

export default TextInput;