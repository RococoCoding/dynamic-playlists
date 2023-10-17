import React from 'react';

interface ErrorPageProps {
  message: string;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ message }) => {
  return (
    <div className="error-page">
      <h1>Hmm something went wrong 😔. Please try again.</h1>
      <p>{message}</p>
    </div>
  );
};

export default ErrorPage;