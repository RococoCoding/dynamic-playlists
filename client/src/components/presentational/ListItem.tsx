import { Box, Card, CardActions } from '@mui/material';
import { styled } from '@mui/material/styles';

const ListItemCard = styled(Card)({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '5px',
  cursor: 'pointer',
  backgroundColor: '#616161',
  color: 'white',
  height: '60px',
});

const StyledCardContent = styled('div')({
  width: '100%',
  display: 'flex',
  padding: '5px',
});

const StyledIconBox = styled(Box)({
  marginLeft: '5px'
});

type Props = {
  actions?: Array<JSX.Element>;
  id: string;
  icon?: JSX.Element;
  innerContent: JSX.Element;
  onClick?: (id: string) => void;
}

function ListItem({
  actions,
  id,
  icon,
  innerContent,
  onClick
}: Props) {
  return (
    <ListItemCard>
      <StyledCardContent style={{ flexGrow: '1' }} onClick={() => onClick && onClick(id)}>
        {icon &&
          <StyledIconBox>
            {icon}
          </StyledIconBox>
        }
        {innerContent}
      </StyledCardContent>
      <CardActions>
        {actions}
      </CardActions>
    </ListItemCard >
  );
}

export default ListItem;