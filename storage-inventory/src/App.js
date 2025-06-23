import React, { useState } from 'react';
import Quagga from 'quagga';
import PhotoCapture from './PhotoCapture';

function App() {
  const [productInfo, setProductInfo] = useState(null);
  const [error, setError] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handlePhoto = async (base64) => {
    setError(null);
    setProductInfo(null);
    setAnalyzing(true);

    console.log('📸 Photo taken');

    const barcode = await detectBarcode(base64);

    if (barcode) {
      console.log('📦 Barcode detected:', barcode);
      fetchProduct(barcode);
    } else {
      console.log('🤖 No barcode found. Analyzing with AI...');
      analyzeWithAI(base64);
    }
  };

  const detectBarcode = (base64) => {
    console.log("🔍 Starting barcode detection...");
    
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        console.log("🖼️ Image loaded for barcode detection");
  
        Quagga.decodeSingle({
          src: base64,
          numOfWorkers: 0,
          inputStream: {
            size: 800, // optional resizing
          },
          decoder: {
            readers: ['upc_reader', 'ean_reader', 'code_128_reader'],
          },
          locate: true,
        }, (result) => {
          if (result) {
            if (result.codeResult && result.codeResult.code) {
              console.log("✅ Barcode detected:", result.codeResult.code);
              resolve(result.codeResult.code);
            } else {
              console.log("❌ No barcode found in result object:", result);
              resolve(null);
            }
          } else {
            console.log("❌ decodeSingle returned null");
            resolve(null);
          }
        });
      };
  
      img.onerror = (err) => {
        console.error("🛑 Failed to load image for barcode detection:", err);
        resolve(null);
      };
  
      img.src = base64;
    });
  };
  

  const fetchProduct = async (barcode) => {
    try {
      const res = await fetch('http://localhost:5050/api/product-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode }),
      });
      const data = await res.json();
      if (data.product) {
        setProductInfo(data.product);
      } else {
        setError(data.error || 'Product not found.');
      }
    } catch (e) {
      console.error(e);
      setError('Barcode lookup failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  const analyzeWithAI = async (base64) => {
    try {
      const blob = await (await fetch(base64)).blob();
      const formData = new FormData();
      formData.append('image', blob, 'photo.jpg');

      const res = await fetch('http://localhost:5050/api/analyze-image', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.description) {
        setProductInfo({ description: data.description });
      } else {
        setError('No description returned by AI.');
      }
    } catch (e) {
      console.error(e);
      setError('AI analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Smart Inventory Scanner</h1>

      <PhotoCapture onCapture={handlePhoto} />

      {analyzing && <p>🔄 Analyzing photo...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {productInfo && (
        <div style={{ marginTop: '1rem' }}>
          {productInfo.title && <h2>{productInfo.title}</h2>}
          {productInfo.brand && <p><strong>Brand:</strong> {productInfo.brand}</p>}
          <p>{productInfo.description || 'No description provided.'}</p>
        </div>
      )}
    </div>
  );
}

export default App;
