import { Box, Card } from '@mui/material';
import { styled } from '@mui/material/styles';

const ListItemCard = styled(Card)({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '5px',
  cursor: 'pointer',
  backgroundColor: '#616161',
  color: 'white',
  height: '60px'
});

const StyledCardContent = styled('div')({
  display: 'flex',
  padding: '5px',
});

const StyledIconBox = styled(Box)({
  width: '50px',
  margin: 'auto'
});

type Props = {
  id: string;
  icon?: JSX.Element;
  innerContent: JSX.Element;
  onClick?: (id: string) => void;
}

function ListItem({
  id,
  icon,
  innerContent,
  onClick
}: Props) {
  return (
    <ListItemCard>
      <StyledCardContent>
        {icon &&
          <StyledIconBox>
            {icon}
          </StyledIconBox>
        }
        <div onClick={() => onClick && onClick(id)}>
          {innerContent}
        </div>
      </StyledCardContent>
    </ListItemCard>
  );
}

export default ListItem;