/* 
    Display system for any errors to be shown to the user.
*/

import React from "react";
import { useError } from "./errorContext";

const ErrorDisplay = (currentPage) => {
    const { errors, clearErrors } = useError()
    const isKVSPage = ['mfy1', 'mfy2', 'mfy3', 'mfy4', 'fc1', 'fc2', 'drinks1', 'grill1'].includes(currentPage.currentPage);
    if (isKVSPage || errors.length === 0) {
        return null;
    }
    
    return (
        <div className="error-display">
          {errors.map((error, index) => (
            <div key={index} className="error-message">
              {error}
              <span class="error-message-button" onClick={clearErrors}>&times;</span> 
            </div>
          ))}
        </div>
      );
}

export default ErrorDisplay