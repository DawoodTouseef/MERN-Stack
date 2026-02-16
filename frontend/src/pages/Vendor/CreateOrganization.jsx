import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Stepper,
    Step,
    StepLabel,
    Button,
    Card,
    CardContent,
    Grid,
    TextField,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormControl,
    FormLabel,
    MenuItem,
    Select,
    InputLabel,
    Divider,
    Alert,
    Fade,
    Stack,
    CircularProgress,
    Paper
} from '@mui/material';
import {
    Business,
    FactCheck,
    AccountBalance,
    Description,
    CheckCircle,
    ArrowBack,
    ArrowForward,
    Save
} from '@mui/icons-material';
import FileUpload from '../../components/FileUpload';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    useCreateOrganizationMutation,
    useSubmitVerificationDocumentsMutation,
    useUploadFileMutation,
    useGetCurrentOrganizationQuery
} from '../../redux/api/organizationApiSlice';
import { APP_NAME } from '../../redux/constants';

const CreateOrganization = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [skipCreation, setSkipCreation] = useState(false);

    const [createOrganization, { isLoading: isCreating }] = useCreateOrganizationMutation();
    const [submitVerification, { isLoading: isSubmitting }] = useSubmitVerificationDocumentsMutation();
    const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();

    // Check if user already has an organization
    const { data: existingOrg, isLoading: isLoadingOrg } = useGetCurrentOrganizationQuery();

    useEffect(() => {
        if (existingOrg) {
            if (existingOrg.isVerified) {
                toast.info("Your organization is already verified!");
                navigate('/vendor/dashboard');
            } else if (existingOrg.verificationStatus === 'submitted') {
                toast.info("Verification already submitted.");
                navigate('/vendor/verification-pending');
            } else {
                setSkipCreation(true);
            }
        }
    }, [existingOrg, navigate]);

    const [formData, setFormData] = useState({
        // Step 1: Basic Info
        businessType: 'Proprietorship',
        orgName: '',
        address: { street: '', city: '', state: '', country: 'India', zipCode: '' },
        contactPerson: { name: '', email: '', phone: '' },

        // Step 2: Registration Docs (Files)
        registrationDoc: null,
        panCard: null,
        gstCertificate: null,
        partnershipDeed: null,
        incorporationCert: null,
        moa: null,
        aoa: null,

        // Step 3: Tax & Compliance
        panNumber: '',
        gstNumber: '',
        productCategory: '',
        complianceCert: null,

        // Step 4: Bank & Signatory
        bankDetails: { accountName: '', accountNumber: '', bankName: '', ifsc: '', branch: '' },
        cancelledCheque: null,
        signatoryName: '',
        signatoryDesignation: '',
        signatoryIdProof: null,
        boardResolution: null
    });

    const steps = [
        { label: 'Business Info', icon: <Business /> },
        { label: 'Registration Docs', icon: <Description /> },
        { label: 'Tax & Compliance', icon: <FactCheck /> },
        { label: 'Bank & Signatory', icon: <AccountBalance /> },
        { label: 'Review', icon: <CheckCircle /> }
    ];

    const handleNext = () => setActiveStep((prev) => prev + 1);
    const handleBack = () => setActiveStep((prev) => prev - 1);

    const handleFileUpload = async (file) => {
        if (!file) return null;
        const formData = new FormData();
        formData.append('image', file);
        try {
            const res = await uploadFile(formData).unwrap();
            // The upload endpoint returns { images: [url] }
            return res.images[0];
        } catch (err) {
            console.error("Upload failed", err);
            toast.error(`Failed to upload ${file.name}`);
            throw err;
        }
    };

    const handleSubmit = async () => {
        try {
            // 1. Create Organization (if not exists)
            if (!skipCreation) {
                // Generate slug
                const slug = formData.orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);

                await createOrganization({
                    name: formData.orgName,
                    slug: slug,
                    type: 'vendor',
                    businessType: formData.businessType,
                    address: formData.address,
                    contactPerson: formData.contactPerson,
                    description: `Organization for ${formData.orgName}`
                }).unwrap();
            }

            // 2. Upload all files
            const fileFields = [
                'registrationDoc', 'panCard', 'gstCertificate', 'partnershipDeed',
                'incorporationCert', 'moa', 'aoa', 'complianceCert',
                'cancelledCheque', 'signatoryIdProof', 'boardResolution'
            ];

            const uploadedDocs = [];
            const loadingToast = toast.loading("Uploading documents...");

            for (const field of fileFields) {
                if (formData[field]) {
                    if (formData[field] instanceof File) {
                        const url = await handleFileUpload(formData[field]);
                        if (url) {
                            uploadedDocs.push({
                                docType: field.replace(/([A-Z])/g, ' $1').trim(),
                                url: url
                            });
                        }
                    }
                }
            }

            toast.dismiss(loadingToast);

            // 3. Submit Verification Data
            const verificationPayload = {
                ...formData,
                documents: uploadedDocs,
                orgName: formData.orgName,
            };

            await submitVerification(verificationPayload).unwrap();

            toast.success("Organization details submitted for verification!");
            navigate('/vendor/verification-pending');

        } catch (err) {
            console.error(err);
            toast.error(err?.data?.message || "Submission failed. Please try again.");
        }
    };

    const updateFormData = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updateNestedData = (parent, field, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: { ...prev[parent], [field]: value }
        }));
    };

    // Render Steps
    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Fade in>
                        <Box>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#1e293b' }}>
                                Business Details
                            </Typography>

                            <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
                                <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>Business Type</FormLabel>
                                <RadioGroup
                                    row
                                    value={formData.businessType}
                                    onChange={(e) => updateFormData('businessType', e.target.value)}
                                >
                                    <FormControlLabel value="Proprietorship" control={<Radio />} label="Proprietorship" />
                                    <FormControlLabel value="Partnership" control={<Radio />} label="Partnership" />
                                    <FormControlLabel value="LLP" control={<Radio />} label="LLP" />
                                    <FormControlLabel value="Private Limited" control={<Radio />} label="Pvt. Ltd." />
                                </RadioGroup>
                            </FormControl>

                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Organization / Company Name"
                                        value={formData.orgName}
                                        onChange={(e) => updateFormData('orgName', e.target.value)}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Contact Person Name"
                                        value={formData.contactPerson.name}
                                        onChange={(e) => updateNestedData('contactPerson', 'name', e.target.value)}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Contact Phone"
                                        value={formData.contactPerson.phone}
                                        onChange={(e) => updateNestedData('contactPerson', 'phone', e.target.value)}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Street Address"
                                        value={formData.address.street}
                                        onChange={(e) => updateNestedData('address', 'street', e.target.value)}
                                        required
                                        multiline
                                        rows={2}
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        label="City"
                                        value={formData.address.city}
                                        onChange={(e) => updateNestedData('address', 'city', e.target.value)}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        label="State"
                                        value={formData.address.state}
                                        onChange={(e) => updateNestedData('address', 'state', e.target.value)}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        label="ZIP / Postal Code"
                                        value={formData.address.zipCode}
                                        onChange={(e) => updateNestedData('address', 'zipCode', e.target.value)}
                                        required
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </Fade>
                );

            case 1:
                return (
                    <Fade in>
                        <Box>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#1e293b' }}>
                                Registration Documents
                            </Typography>
                            <Alert severity="info" sx={{ mb: 3 }}>
                                Please upload clear scanned copies of your documents. Accepted formats: PDF, JPG, PNG (Max 5MB).
                            </Alert>

                            {/* Conditional Docs based on Business Type */}
                            {formData.businessType === 'Proprietorship' && (
                                <>
                                    <FileUpload
                                        label="Shop & Establishment License OR Udyam Registration"
                                        onFileSelect={(file) => updateFormData('registrationDoc', file)}
                                        existingFile={formData.registrationDoc}
                                    />
                                    <FileUpload
                                        label="PAN Card of Proprietor"
                                        onFileSelect={(file) => updateFormData('panCard', file)}
                                        existingFile={formData.panCard}
                                    />
                                </>
                            )}

                            {formData.businessType === 'Partnership' && (
                                <>
                                    <FileUpload
                                        label="Partnership Deed"
                                        onFileSelect={(file) => updateFormData('partnershipDeed', file)}
                                        existingFile={formData.partnershipDeed}
                                    />
                                    <FileUpload
                                        label="PAN Card of Firm"
                                        onFileSelect={(file) => updateFormData('panCard', file)}
                                        existingFile={formData.panCard}
                                    />
                                </>
                            )}

                            {(formData.businessType === 'Private Limited' || formData.businessType === 'Public Limited' || formData.businessType === 'LLP') && (
                                <>
                                    <FileUpload
                                        label="Certificate of Incorporation"
                                        onFileSelect={(file) => updateFormData('incorporationCert', file)}
                                        existingFile={formData.incorporationCert}
                                    />
                                    {formData.businessType !== 'LLP' ? (
                                        <>
                                            <FileUpload
                                                label="Memorandum of Association (MOA)"
                                                onFileSelect={(file) => updateFormData('moa', file)}
                                                existingFile={formData.moa}
                                            />
                                            <FileUpload
                                                label="Articles of Association (AOA)"
                                                onFileSelect={(file) => updateFormData('aoa', file)}
                                                existingFile={formData.aoa}
                                            />
                                        </>
                                    ) : (
                                        <FileUpload
                                            label="LLP Agreement"
                                            onFileSelect={(file) => updateFormData('partnershipDeed', file)} // Reusing field
                                            existingFile={formData.partnershipDeed}
                                        />
                                    )}
                                </>
                            )}
                        </Box>
                    </Fade>
                );

            case 2:
                return (
                    <Fade in>
                        <Box>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#1e293b' }}>
                                Tax & Compliance
                            </Typography>

                            <Grid container spacing={3} sx={{ mb: 4 }}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="PAN Number"
                                        value={formData.panNumber}
                                        onChange={(e) => updateFormData('panNumber', e.target.value.toUpperCase())}
                                        placeholder="ABCDE1234F"
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="GSTIN Number"
                                        value={formData.gstNumber}
                                        onChange={(e) => updateFormData('gstNumber', e.target.value.toUpperCase())}
                                        placeholder="22AAAAA0000A1Z5"
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FileUpload
                                        label="GST Registration Certificate"
                                        onFileSelect={(file) => updateFormData('gstCertificate', file)}
                                        existingFile={formData.gstCertificate}
                                    />
                                </Grid>
                            </Grid>

                            <Divider sx={{ mb: 3 }} />

                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>Product Category Compliance</Typography>
                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <InputLabel>Primary Product Category</InputLabel>
                                <Select
                                    value={formData.productCategory}
                                    label="Primary Product Category"
                                    onChange={(e) => updateFormData('productCategory', e.target.value)}
                                >
                                    <MenuItem value="Electronics">Electronics</MenuItem>
                                    <MenuItem value="Food & Beverage">Food & Beverage</MenuItem>
                                    <MenuItem value="Cosmetics">Cosmetics</MenuItem>
                                    <MenuItem value="Clothing">Clothing & Textiles</MenuItem>
                                    <MenuItem value="Medical">Medical Devices</MenuItem>
                                    <MenuItem value="Other">Other</MenuItem>
                                </Select>
                            </FormControl>

                            {formData.productCategory === 'Food & Beverage' && (
                                <FileUpload
                                    label="FSSAI License"
                                    onFileSelect={(file) => updateFormData('complianceCert', file)}
                                    existingFile={formData.complianceCert}
                                />
                            )}
                            {formData.productCategory === 'Medical' && (
                                <FileUpload
                                    label="Drug License / Medical Device Certificate"
                                    onFileSelect={(file) => updateFormData('complianceCert', file)}
                                    existingFile={formData.complianceCert}
                                />
                            )}
                        </Box>
                    </Fade>
                );

            case 3:
                return (
                    <Fade in>
                        <Box>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#1e293b' }}>
                                Bank & Signatory Details
                            </Typography>

                            <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 2 }}>
                                Bank account must belong to the registered business entity.
                            </Typography>

                            <Grid container spacing={3} sx={{ mb: 4 }}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Account Holder Name"
                                        value={formData.bankDetails.accountName}
                                        onChange={(e) => updateNestedData('bankDetails', 'accountName', e.target.value)}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Account Number"
                                        value={formData.bankDetails.accountNumber}
                                        onChange={(e) => updateNestedData('bankDetails', 'accountNumber', e.target.value)}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        label="Bank Name"
                                        value={formData.bankDetails.bankName}
                                        onChange={(e) => updateNestedData('bankDetails', 'bankName', e.target.value)}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        label="IFSC Code"
                                        value={formData.bankDetails.ifsc}
                                        onChange={(e) => updateNestedData('bankDetails', 'ifsc', e.target.value)}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        label="Branch Name"
                                        value={formData.bankDetails.branch}
                                        onChange={(e) => updateNestedData('bankDetails', 'branch', e.target.value)}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FileUpload
                                        label="Cancelled Cheque OR Bank Statement"
                                        onFileSelect={(file) => updateFormData('cancelledCheque', file)}
                                        existingFile={formData.cancelledCheque}
                                    />
                                </Grid>
                            </Grid>

                            <Divider sx={{ mb: 3 }} />

                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>Authorized Signatory</Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Signatory Name"
                                        value={formData.signatoryName}
                                        onChange={(e) => updateFormData('signatoryName', e.target.value)}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Designation"
                                        value={formData.signatoryDesignation}
                                        onChange={(e) => updateFormData('signatoryDesignation', e.target.value)}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FileUpload
                                        label="Signatory ID Proof (Aadhaar / Passport)"
                                        onFileSelect={(file) => updateFormData('signatoryIdProof', file)}
                                        existingFile={formData.signatoryIdProof}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </Fade>
                );

            case 4:
                return (
                    <Fade in>
                        <Box>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#1e293b' }}>
                                Review & Submit
                            </Typography>

                            <Alert severity="warning" sx={{ mb: 3 }}>
                                Please review all information carefully. Once submitted, you cannot edit these details during verification.
                            </Alert>

                            <Stack spacing={3}>
                                <Paper variant="outlined" sx={{ p: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Organization</Typography>
                                    <Typography variant="body1" fontWeight={600}>{formData.orgName}</Typography>
                                    <Typography variant="body2">{formData.businessType}</Typography>
                                    <Typography variant="body2">{formData.address.city}, {formData.address.state}</Typography>
                                </Paper>

                                <Paper variant="outlined" sx={{ p: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Contact Info</Typography>
                                    <Typography variant="body1">{formData.contactPerson.name}</Typography>
                                    <Typography variant="body2">{formData.contactPerson.email}</Typography>
                                    <Typography variant="body2">{formData.contactPerson.phone}</Typography>
                                </Paper>

                                <Paper variant="outlined" sx={{ p: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Tax Info</Typography>
                                    <Typography variant="body1">PAN: {formData.panNumber}</Typography>
                                    <Typography variant="body1">GSTIN: {formData.gstNumber}</Typography>
                                </Paper>

                                <Paper variant="outlined" sx={{ p: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Uploaded Documents</Typography>
                                    <Grid container spacing={1} sx={{ mt: 1 }}>
                                        {Object.entries(formData).map(([key, value]) => {
                                            if (value instanceof File) {
                                                return (
                                                    <Grid item xs={12} key={key}>
                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            <CheckCircle fontSize="small" color="success" />
                                                            <Typography variant="body2">{key.replace(/([A-Z])/g, ' $1').trim()}: {value.name}</Typography>
                                                        </Stack>
                                                    </Grid>
                                                );
                                            }
                                            return null;
                                        })}
                                    </Grid>
                                </Paper>
                            </Stack>

                            <FormControlLabel
                                control={<Radio />}
                                label={`I declare that all the information provided is true and correct. I authorize ${APP_NAME} to verify these details.`}
                                sx={{ mt: 3 }}
                            />
                        </Box>
                    </Fade>
                );

            default:
                return 'Unknown step';
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f1f5f9', py: 4 }}>
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    {/* Left Side - Stepper */}
                    <Grid item xs={12} md={4} lg={3}>
                        <Card sx={{ borderRadius: 4, height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                            <CardContent sx={{ p: 4 }}>
                                <Typography variant="h5" fontWeight={800} sx={{ color: '#1e293b', mb: 1 }}>
                                    Setup Organization
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#64748b', mb: 4 }}>
                                    Complete these steps to verify your business and start selling.
                                </Typography>

                                <Stepper activeStep={activeStep} orientation="vertical" sx={{
                                    '& .MuiStepLabel-label': { fontWeight: 600 },
                                    '& .MuiStepIcon-root.Mui-active': { color: '#6366f1' },
                                    '& .MuiStepIcon-root.Mui-completed': { color: '#10b981' },
                                }}>
                                    {steps.map((step) => (
                                        <Step key={step.label}>
                                            <StepLabel icon={step.icon}>{step.label}</StepLabel>
                                        </Step>
                                    ))}
                                </Stepper>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Right Side - Form Content */}
                    <Grid item xs={12} md={8} lg={9}>
                        <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', minHeight: 600, display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ p: 4, flex: 1 }}>

                                {renderStepContent(activeStep)}

                            </CardContent>

                            <Divider />

                            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', bgcolor: '#f8fafc' }}>
                                <Button
                                    disabled={activeStep === 0}
                                    onClick={handleBack}
                                    startIcon={<ArrowBack />}
                                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                                >
                                    Back
                                </Button>

                                {activeStep === steps.length - 1 ? (
                                    <Button
                                        variant="contained"
                                        onClick={handleSubmit}
                                        startIcon={(isCreating || isSubmitting || isUploading) ? <CircularProgress size={20} color="inherit" /> : <Save />}
                                        sx={{ borderRadius: 2, px: 4, bgcolor: '#6366f1', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#4f46e5' } }}
                                        disabled={isCreating || isSubmitting || isUploading}
                                    >
                                        {(isCreating || isSubmitting || isUploading) ? 'Submitting...' : 'Submit for Verification'}
                                    </Button>
                                ) : (
                                    <Button
                                        variant="contained"
                                        onClick={handleNext}
                                        endIcon={<ArrowForward />}
                                        sx={{ borderRadius: 2, px: 4, bgcolor: '#6366f1', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#4f46e5' } }}
                                    >
                                        Next Step
                                    </Button>
                                )}
                            </Box>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default CreateOrganization;
