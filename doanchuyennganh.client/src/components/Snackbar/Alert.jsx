import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

export default function CustomizedSnackbars({ open, content, status, onClose }) {
    return (
        <Snackbar open={open} autoHideDuration={3000} onClose={onClose}>
            <Alert
                onClose={onClose}
                severity={status}
                variant="filled"
                sx={{ width: '100%' }}
            >
                {content}
            </Alert>
        </Snackbar>
    );
}
