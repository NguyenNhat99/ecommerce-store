import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { DotLoader } from "react-spinners";

const Loading = () => (
    <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
    >
        <DotLoader color="#3f51b5" size={60} />
        <Typography variant="h6" mt={3}>
            Chờ xíu nha tình eooo...
        </Typography>
    </Box>
);

export default Loading;
