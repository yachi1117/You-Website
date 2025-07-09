import React from 'react';
import './CV.css';

function CV() {
  return (
    <div className="cv-container">
      <div className="cv-content">
        <div className="pdf-container">
          <iframe
            src="/CV.pdf"
            title="CV"
            className="pdf-viewer"
            style={{
              width: '100%',
              height: '100%',
              border: 'none'
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default CV; 