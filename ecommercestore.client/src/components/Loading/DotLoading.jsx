import { DotLoader } from 'react-spinners';

const DotLoading = () => (
    <div
        sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            zIndex: 9999,
        }}
    >
        <DotLoader color="#3f51b5" size={60} />
    </div>
);

export default DotLoading;
