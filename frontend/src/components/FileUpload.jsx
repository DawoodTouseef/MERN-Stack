import React, { useCallback, useState } from 'react';
import { Box, Typography, Paper, IconButton, LinearProgress, Stack } from '@mui/material';
import { CloudUpload, Delete, InsertDriveFile, CheckCircle, Error } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

const FileUpload = ({ label, onFileSelect, acceptedFileTypes = { 'application/pdf': ['.pdf'], 'image/*': ['.jpeg', '.jpg', '.png'] }, maxSize = 5242880, existingFile = null, error = null }) => {
    const [file, setFile] = useState(existingFile);
    const [preview, setPreview] = useState(null);

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles?.length > 0) {
            const selectedFile = acceptedFiles[0];
            setFile(selectedFile);
            onFileSelect(selectedFile);

            if (selectedFile.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result);
                };
                reader.readAsDataURL(selectedFile);
            } else {
                setPreview(null);
            }
        }
    }, [onFileSelect]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: acceptedFileTypes,
        maxSize,
        multiple: false
    });

    const removeFile = (e) => {
        e.stopPropagation();
        setFile(null);
        setPreview(null);
        onFileSelect(null);
    };

    return (
        <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#334155' }}>
                {label}
            </Typography>

            {!file ? (
                <Paper
                    {...getRootProps()}
                    elevation={0}
                    sx={{
                        border: '2px dashed',
                        borderColor: isDragActive ? '#6366f1' : error ? '#ef4444' : '#cbd5e1',
                        borderRadius: 2,
                        bgcolor: isDragActive ? '#f5f3ff' : '#f8fafc',
                        p: 3,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                            borderColor: '#6366f1',
                            bgcolor: '#f5f3ff'
                        },
                        textAlign: 'center'
                    }}
                >
                    <input {...getInputProps()} />
                    <CloudUpload sx={{ fontSize: 40, color: '#94a3b8', mb: 1 }} />
                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                        {isDragActive ? "Drop the file here" : "Click to upload or drag and drop"}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 0.5 }}>
                        PDF, JPG, PNG (Max 5MB)
                    </Typography>
                </Paper>
            ) : (
                <Paper
                    elevation={0}
                    sx={{
                        border: '1px solid #e2e8f0',
                        borderRadius: 2,
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        bgcolor: '#fff'
                    }}
                >
                    {preview ? (
                        <Box
                            component="img"
                            src={preview}
                            sx={{ width: 48, height: 48, borderRadius: 1, objectFit: 'cover', mr: 2 }}
                        />
                    ) : (
                        <Box sx={{ width: 48, height: 48, borderRadius: 1, bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                            <InsertDriveFile sx={{ color: '#64748b' }} />
                        </Box>
                    )}

                    <Box sx={{ flex: 1, overflow: 'hidden' }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {file.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                    </Box>

                    <IconButton onClick={removeFile} size="small" sx={{ color: '#94a3b8', '&:hover': { color: '#ef4444' } }}>
                        <Delete />
                    </IconButton>
                </Paper>
            )}

            {error && (
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1 }}>
                    <Error sx={{ fontSize: 16, color: '#ef4444' }} />
                    <Typography variant="caption" sx={{ color: '#ef4444' }}>{error}</Typography>
                </Stack>
            )}
        </Box>
    );
};

export default FileUpload;
