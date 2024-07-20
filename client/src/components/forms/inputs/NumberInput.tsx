import { InputLabel } from '@mui/material';
import Input from '@mui/material/Input';

type Props = {
  inputValue: number,
  inputLabel: string,
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
}

function NumberInput({
  inputValue,
  inputLabel,
  handleInputChange,
}: Props) {
  return (
    <>
      <InputLabel>{inputLabel}</InputLabel>
      <Input
        autoFocus
        margin="dense"
        color='primary'
        type="number"
        value={inputValue}
        onChange={handleInputChange}
      />
    </>
  )
}

export default NumberInput;