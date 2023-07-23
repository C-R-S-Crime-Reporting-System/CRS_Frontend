import React, { useState, useEffect } from 'react';
import { Load, ReportForm } from './components';
import { Routes, Route } from 'react-router-dom';



function App() {
 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // set the time for the loading animation to show, in milliseconds

    return () => clearTimeout(timer);
  }, []);

  // useEffect(() => {
  //   if (!isLoading) {
  //     navigate('/', { replace: true });
  //   }
  // }, [isLoading, navigate]);

  return (
    <div>
      {isLoading ? (
        <div>
          <Load />
        </div>
      ) : (
        <Routes>
          <Route path="/" element={<ReportForm />} />
          
          
          
        </Routes>
      )}
    </div>
  );
}

export default App;
