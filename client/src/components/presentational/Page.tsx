import styled from "@emotion/styled";
import { Container, Paper } from "@mui/material";

const MainContainer = styled(Container)({
  padding: '20px 0px 30px 0px'
});

const StyledPaper = styled(Paper)({
  padding: '20px',
  background: 'transparent'
});


type PageProps = {
  children: React.ReactNode;
};

const Page = ({ children }: PageProps) => (
  <MainContainer>
    <StyledPaper>
      {children}
    </StyledPaper>
  </MainContainer>
);

export default Page;