'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function CapturePage() {
  const searchParams = useSearchParams();
  const linkId = searchParams.get('id');
  const [status, setStatus] = useState<'waiting' | 'success' | 'error'>('waiting');
  const [message, setMessage] = useState('Demande de localisation...');

  useEffect(() => {
    if (!linkId) {
      setStatus('error');
      setMessage('Lien invalide');
      return;
    }

    // Vérifier si déjà capturé
    const checkExisting = async () => {
      const res = await fetch('/api/locations');
      if (res.ok) {
        const locations = await res.json();
        if (locations.some((loc: any) => loc.link_id === linkId)) {
          setStatus('success');
          setMessage('Position déjà enregistrée');
          return;
        }
      }
      // Sinon, demander la localisation
      requestLocation();
    };

    const requestLocation = () => {
      if (!navigator.geolocation) {
        setStatus('error');
        setMessage('Geolocalisation non supportée');
        return;
      }

      setStatus('waiting');
      setMessage('Veuillez autoriser la géolocalisation');

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          const coordsStr = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          try {
            const res = await fetch('/api/locations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                linkId,
                lat: latitude,
                lng: longitude,
                accuracy,
                coords: coordsStr,
                userAgent: navigator.userAgent,
              }),
            });
            if (res.ok) {
              setStatus('success');
              setMessage(`Position enregistrée : ${coordsStr}`);
            } else {
              setStatus('error');
              setMessage('Erreur lors de la sauvegarde');
            }
          } catch {
            setStatus('error');
            setMessage('Erreur réseau');
          }
        },
        (err) => {
          let msg = 'Erreur de géolocalisation';
          if (err.code === 1) msg = 'Accès refusé. Activez la géolocalisation dans les paramètres.';
          else if (err.code === 2) msg = 'Position indisponible. Vérifiez votre GPS.';
          else if (err.code === 3) msg = 'Délai d\'attente dépassé.';
          setStatus('error');
          setMessage(msg);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
      );
    };

    checkExisting();
  }, [linkId]);

  const getIcon = () => {
    if (status === 'waiting') return 'fas fa-spinner fa-pulse';
    if (status === 'success') return 'fas fa-check-circle';
    return 'fas fa-exclamation-triangle';
  };

  const getColor = () => {
    if (status === 'waiting') return '#ffc107';
    if (status === 'success') return '#28a745';
    return '#dc3545';
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'transparent',
      margin: 0,
      padding: 20,
    }}>
      <div style={{
        background: 'rgba(0,0,0,0.85)',
        color: '#fff',
        padding: '24px 30px',
        borderRadius: 20,
        maxWidth: 380,
        textAlign: 'center',
        backdropFilter: 'blur(6px)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
      }}>
        <i className={getIcon()} style={{ fontSize: 48, color: getColor(), marginBottom: 12 }}></i>
        <h3 style={{ fontSize: 20, marginBottom: 6 }}>{status === 'waiting' ? 'En attente...' : status === 'success' ? '✅ Succès' : '❌ Erreur'}</h3>
        <p style={{ fontSize: 15, opacity: 0.85 }}>{message}</p>
        {status !== 'waiting' && (
          <button
            onClick={() => window.close()}
            style={{ marginTop: 14, background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: 30, cursor: 'pointer' }}
          >
            Fermer
          </button>
        )}
      </div>
    </div>
  );
}