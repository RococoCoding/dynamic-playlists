import { Card, CardContent, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const PlaylistCard = styled(Card)({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '20px',
  cursor: 'pointer',
  backgroundColor: '#616161',
  color: 'white'
});

type Props = {
  title: string,
}

function PlaylistItem({ title }: Props) {
  return (
    <PlaylistCard>
      <CardContent>
        <Typography variant="subtitle1" fontWeight="bold">
          {title}
        </Typography>
      </CardContent>
    </PlaylistCard>
  );
}

export default PlaylistItem;