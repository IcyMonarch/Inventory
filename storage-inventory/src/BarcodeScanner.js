import React, { useEffect, useRef } from 'react';
import Quagga from 'quagga';

const BarcodeScanner = ({ onDetected }) => {
  const scannerRef = useRef(null);

  useEffect(() => {
    Quagga.init({
      inputStream: {
        type: 'LiveStream',
        target: scannerRef.current,
        constraints: {
          facingMode: 'environment', // use rear camera if available
        },
      },
      decoder: {
        readers: ['upc_reader', 'ean_reader', 'code_128_reader'],
      },
    }, (err) => {
      if (err) {
        console.error('Quagga init error:', err);
        return;
      }
      Quagga.start();
    });

    Quagga.onDetected((result) => {
      const code = result?.codeResult?.code;
      if (code) {
        onDetected(code);
        Quagga.stop(); // Stop scanning after successful read
      }
    });

    return () => {
      Quagga.stop();
      Quagga.offDetected();
    };
  }, [onDetected]);

  return (
    <div>
      <div ref={scannerRef} style={{ width: '100%' }} />
    </div>
  );
};

export default BarcodeScanner;
