import { Card, CardContent, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const ListItemCard = styled(Card)({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '20px',
  cursor: 'pointer',
  backgroundColor: '#616161',
  color: 'white'
});

type Props = {
  id: string;
  innerContent?: JSX.Element;
  onClick?: (id: string) => void;
}

function ListItem({
  id,
  innerContent,
  onClick
}: Props) {
  return (
    <ListItemCard>
      <CardContent>
        <Typography onClick={() => onClick && onClick(id)} variant="subtitle1" fontWeight="bold">
          {innerContent}
        </Typography>
      </CardContent>
    </ListItemCard>
  );
}

export default ListItem;