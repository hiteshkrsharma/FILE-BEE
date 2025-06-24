import React, { useState } from 'react';
import './index.css';
import logo from './logo.svg';

function App() {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [expiresAt, setExpiresAt] = useState(null);
  const [error, setError] = useState('');
  const [testResult, setTestResult] = useState('');

  const handleFile = e => {
    setFile(e.target.files[0]);
    setError('');
  };

  const uploadFile = async e => {
    e.preventDefault();
    if (!file) return setError('Select a file');
    if (file.size > 100 * 1024 * 1024) return setError('Max size 100MB');
    const formData = new FormData();
    formData.append('file', file);
    setProgress(0);
    setError('');
    try {
      const res = await fetch(process.env.REACT_APP_API + '/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setDownloadUrl(data.downloadUrl);
      setExpiresAt(data.expiresAt);
    } catch (err) {
      setError('Upload failed');
    }
  };

  // Test backend connection
  const testBackend = async () => {
    setTestResult('Testing...');
    try {
      const res = await fetch(process.env.REACT_APP_API + '/fileinfo/test');
      if (res.ok) {
        setTestResult('Backend reachable (responded, even if 404)');
      } else {
        setTestResult('Backend responded: ' + res.status);
      }
    } catch (e) {
      setTestResult('Cannot connect to backend: ' + e.message);
    }
  };

  return (
    <div className="container fade-in">
      <img src={logo} alt="FileBee Logo" className="app-logo" />
      <h1 className="gradient-text">FileBee</h1>
      <form onSubmit={uploadFile}>
        <input type="file" onChange={handleFile} />
        {file && <div>{file.name} ({(file.size/1024/1024).toFixed(2)} MB)</div>}
        <button type="submit">Upload</button>
      </form>
      {progress > 0 && <progress value={progress} max="100" />}
      {downloadUrl && (
        <div>
          <p>Shareable Link:</p>
          <input value={downloadUrl} readOnly style={{width:'80%'}} />
          <button onClick={() => {navigator.clipboard.writeText(downloadUrl)}}>Copy</button>
          <p>Expires in: {Math.round((expiresAt-Date.now())/1000/60/60)} hours</p>
        </div>
      )}
      {error && <div style={{color:'red'}}>{error}</div>}
      <button onClick={testBackend} style={{marginTop:'1em'}}>Test Backend Connection</button>
      {testResult && <div style={{marginTop:'0.5em',color:testResult.startsWith('Backend')? 'green':'red'}}>{testResult}</div>}
      <footer>Developed by Hitesh Krishan Sharma</footer>
    </div>
  );
}

export default App;
