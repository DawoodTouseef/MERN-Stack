
// Mock service for third-party verification
// In a real application, this would integrate with services like Stripe Identity, Veriff, or Jumio.

class VerificationService {
    constructor() {
        this.apiKey = process.env.VERIFICATION_API_KEY || 'mock-key';
        this.requiredDocuments = ['Business License', 'Tax ID', 'ID Proof'];
    }

    async verifyDocument(documentUrl, docType, metadata) {
        // Simulate API delay (OCR + Check)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock verification logic for MVP
        const isInvalidDoc = !documentUrl || documentUrl.toLowerCase().includes('invalid');
        const isUntrustedOrg = metadata?.orgName?.toLowerCase().includes('scam');

        if (isInvalidDoc || isUntrustedOrg) {
            return {
                verified: false,
                status: 'rejected',
                reason: isUntrustedOrg ? 'Organization flagged as untrusted' : 'Document quality or format is invalid',
                confidence: 0.2,
                transactionId: `ver_${Date.now()}`
            };
        }

        // Simulate successful OCR/Verification
        return {
            verified: true,
            status: 'approved',
            reason: null,
            kybConfidence: 0.95,
            kybVerificationId: `ver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            kybProvider: 'MockVerify-v1',
            extractedData: {
                docType: docType,
                verifiedAt: new Date(),
                orgName: metadata.orgName,
                taxId: metadata.taxId || 'MOCK-TAX-ID',
            }
        };
    }

    getRequiredDocs() {
        return this.requiredDocuments;
    }
}

export default new VerificationService();
