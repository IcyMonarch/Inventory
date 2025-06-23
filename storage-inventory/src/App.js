import React, { useState } from 'react';
import BarcodeScanner from './BarcodeScanner';

function App() {
  const [product, setProduct] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);

  const handleBarcodeDetected = async (barcode) => {
    setScanning(false);
    try {
      const response = await fetch('http://localhost:5050/api/product-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode }),
      });

      const data = await response.json();

      if (data.product) {
        setProduct(data.product);
        setError(null);
      } else {
        setProduct(null);
        setError(data.error || 'No product found');
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to contact server');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Scan a Barcode</h1>

      {!scanning && (
        <button onClick={() => { setProduct(null); setError(null); setScanning(true); }}>
          Start Scanner
        </button>
      )}

      {scanning && (
        <BarcodeScanner onDetected={handleBarcodeDetected} />
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {product && (
        <div style={{ marginTop: '1rem' }}>
          <h2>{product.title}</h2>
          <p><strong>Brand:</strong> {product.brand}</p>
          <p><strong>Description:</strong> {product.description}</p>
        </div>
      )}
    </div>
  );
}

export default App;
