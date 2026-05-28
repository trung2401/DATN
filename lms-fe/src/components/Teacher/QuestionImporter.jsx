import React, { useState, useRef, useCallback } from 'react';
import ModalWrapper from '../ModalWrapper';
import Button from '../Button';
import { importXlsx } from '../../service/examService';

const PARTS = {
  1: { label: 'Part 1 – Photographs', type: 'single', subtype: 'typeOne' },
  2: { label: 'Part 2 – Q&Response', type: 'single', subtype: 'typeOne' },
  5: { label: 'Part 5 – Sentences', type: 'single', subtype: 'typeTwo' },
  3: { label: 'Part 3 – Conversations', type: 'group', subtype: 'typeTwo', maxPerGroup: 3 },
  4: { label: 'Part 4 – Talks', type: 'group', subtype: 'typeTwo', maxPerGroup: 3 },
  6: { label: 'Part 6 – Text Completion', type: 'group', subtype: 'typeTwo', maxPerGroup: 4 },
  7: { label: 'Part 7 – Reading', type: 'group', subtype: 'typeTwo', maxPerGroup: 5 },
};

// frontend now uploads the XLSX to backend import endpoint

export default function QuestionImporter({ show, onClose, testId, partId, onDone }) {
  const [file, setFile] = useState(null);
  const [responseMsg, setResponseMsg] = useState('');
  const [importing, setImporting] = useState(false);
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const fileRef = useRef();

  const addLog = useCallback((msg, type = 'info') => {
    setLogs(prev => [...prev, { msg, type, ts: new Date().toLocaleTimeString() }]);
  }, []);

  const handleFile = useCallback((f) => {
    setFile(f);
    setResponseMsg('');
    setLogs([]);
  }, []);

  const handleImport = async () => {
    if (!file || !testId) return;
    setImporting(true);
    setLogs([]);
    setResponseMsg('');
    try {
      addLog(`Uploading file ${file.name} to test ${testId} – part ${partId}`);
      const res = await importXlsx({ testId, partId, file });
      const payload = res?.data || res;
      addLog('Import finished on server', 'ok');
      setResponseMsg(payload?.message || JSON.stringify(payload));
      if (payload?.success) {
        if (typeof onDone === 'function') onDone();
      }
    } catch (e) {
      addLog('Error: ' + (e?.message || e), 'err');
      setResponseMsg(e?.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <ModalWrapper show={show} onClose={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl py-6 px-5 w-full max-w-3xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Import XLSX — Part {partId}</h2>
          <button onClick={onClose} className="text-gray-600">Đóng</button>
        </div>

        <div className="space-y-3">
          <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={(e) => { if (e.target.files[0]) handleFile(e.target.files[0]); }} />

          {file && <div className="text-sm text-gray-700">Selected: {file.name}</div>}
          {responseMsg && <div className="text-sm mt-2">{responseMsg}</div>}

          <div className="flex gap-2">
            <Button text={importing ? 'Importing...' : 'Start Import'} variant="primary" size="sm" onClick={handleImport} disabled={importing || !file} />
            <Button text="Close" variant="default" size="sm" onClick={onClose} />
          </div>

          <div className="mt-3">
            <div>Progress: {progress.done}/{progress.total}</div>
            <div style={{ maxHeight: 180, overflow: 'auto', background: '#f8f8f8', padding: 8 }}>
              {logs.map((l, i) => (
                <div key={i} style={{ color: l.type === 'err' ? 'red' : l.type === 'ok' ? 'green' : '#333' }}>[{l.ts}] {l.msg}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}
