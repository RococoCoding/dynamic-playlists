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
  innerContent?: JSX.Element;
}

function ListItem({ innerContent }: Props) {
  return (
    <ListItemCard>
      <CardContent>
        <Typography variant="subtitle1" fontWeight="bold">
          {innerContent}
        </Typography>
      </CardContent>
    </ListItemCard>
  );
}

export default ListItem;