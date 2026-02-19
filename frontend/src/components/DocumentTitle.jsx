import { useEffect } from 'react';

const DocumentTitle = ({ title, children }) => {
    useEffect(() => {
        if (title) {
            document.title = title;
        }
    }, [title]);

    return children || null;
};

export default DocumentTitle;
