import React from 'react';
import { Box, Container, Typography, Card, CardContent, Button, Fade, Alert } from '@mui/material';
import { CheckCircle, AccessTime, Home } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useGetVerificationStatusQuery } from '../../redux/api/organizationApiSlice';
import { useEffect } from 'react';
import Loader from '../../components/Loader';

const VerificationPending = () => {
    const navigate = useNavigate();
    const { data: statusData, isLoading, refetch } = useGetVerificationStatusQuery(undefined, {
        pollingInterval: 5000,
        refetchOnMountOrArgChange: true
    });

    useEffect(() => {
        if (statusData?.isVerified) {
            navigate('/vendor/dashboard');
        }
    }, [statusData, navigate]);

    const isRejected = statusData?.status === 'rejected' || statusData?.status === 'suspended';

    if (isLoading) return <Loader />;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Container maxWidth="sm">
                <Fade in timeout={800}>
                    <Card sx={{ borderRadius: 4, boxShadow: '0 10px 40px rgba(0,0,0,0.05)', textAlign: 'center', overflow: 'hidden' }}>
                        <Box sx={{ bgcolor: isRejected ? '#fee2e2' : '#ecfdf5', py: 4, display: 'flex', justifyContent: 'center' }}>
                            {isRejected ? (
                                <Home sx={{ fontSize: 80, color: '#ef4444' }} /> // Should use ErrorIcon but Home was imported. 
                            ) : (
                                <AccessTime sx={{ fontSize: 80, color: '#10b981' }} />
                            )}
                        </Box>
                        <CardContent sx={{ p: 5 }}>
                            <Typography variant="h4" fontWeight={800} gutterBottom sx={{ color: '#1e293b' }}>
                                {isRejected ? 'Verification Failed' : 'Verification Pending'}
                            </Typography>

                            <Typography variant="body1" sx={{ color: '#64748b', mb: 3 }}>
                                {isRejected
                                    ? 'Unfortunately, your organization verification was unsuccessful.'
                                    : 'Thank you for submitting your documents. Your organization verification is currently in progress.'}
                            </Typography>

                            <Alert severity={isRejected ? "error" : "info"} sx={{ mb: 4, textAlign: 'left' }}>
                                {isRejected
                                    ? `Reason: ${statusData?.remarks || 'Documents details mismatch or invalid.'} Please review and resubmit.`
                                    : 'Our team will review your details and documents. This process usually takes 1-2 business days. You will receive an email once your account is verified.'}
                            </Alert>

                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/')}
                                    sx={{ borderRadius: 2, textTransform: 'none' }}
                                >
                                    Home
                                </Button>

                                {isRejected && (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => navigate('/vendor/create-organization')}
                                        sx={{ borderRadius: 2, textTransform: 'none' }}
                                    >
                                        Retry Submission
                                    </Button>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Fade>
            </Container>
        </Box>
    );
};

export default VerificationPending;
