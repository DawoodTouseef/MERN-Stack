import { Helmet } from "react-helmet-async";

const PageTitle = ({ title, children }) => {
  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      {children}
    </>
  );
};

export default PageTitle;