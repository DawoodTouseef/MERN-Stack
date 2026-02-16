import { apiSlice } from "./apiSlice";
import { ORGANIZATION_URL, UPLOAD_URL } from "../constants";

export const organizationApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Create a new organization
        createOrganization: builder.mutation({
            query: (data) => ({
                url: `${ORGANIZATION_URL}`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Organization", "User"],
        }),

        // Get current user's organization
        getCurrentOrganization: builder.query({
            query: () => ({
                url: `${ORGANIZATION_URL}/me`,
            }),
            providesTags: ["Organization"],
            keepUnusedDataFor: 5,
        }),

        // Submit verification documents (KYB)
        submitVerificationDocuments: builder.mutation({
            query: (data) => ({
                url: `${ORGANIZATION_URL}/verify`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Organization"],
        }),

        // Upload a file (generic upload endpoint)
        uploadFile: builder.mutation({
            query: (formData) => ({
                url: `${UPLOAD_URL}?type=document`,
                method: "POST",
                body: formData,
            }),
        }),
        // Get verification status
        getVerificationStatus: builder.query({
            query: () => ({
                url: `${ORGANIZATION_URL}/verification-status`,
            }),
            providesTags: ["Organization"],
            keepUnusedDataFor: 0, // Don't cache long to get real-time status
        }),
    }),
});

export const {
    useCreateOrganizationMutation,
    useGetCurrentOrganizationQuery,
    useSubmitVerificationDocumentsMutation,
    useUploadFileMutation,
    useGetVerificationStatusQuery,
} = organizationApiSlice;
