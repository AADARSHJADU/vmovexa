import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { CreativeAssetsGallery } from './CreativeAssetsGallery';
import { IconFolder, IconImage, IconVideo, IconDocument, IconLink } from '../ui/CampaignIcons';
import { uploadFile, uploadVideo, resolveFileUrl } from '../../api/services/upload.service';
import { extractYouTubeId } from '../../utils/mediaUtils';

export function readEmergencyMedia(data) {
  let saved = data.media;
  if (typeof saved === 'string') { try { saved = JSON.parse(saved); } catch { saved = []; } }
  const legacyUrl = data.media_url || data.mediaUrl;
  const media = Array.isArray(saved) && saved.length ? saved : legacyUrl ? [{ mediaUrl: legacyUrl, mediaType: data.media_type || data.mediaType }] : [];
  return media.map((m, i) => ({ id: `saved-${i}`, url: m.mediaUrl, previewUrl: resolveFileUrl(m.mediaUrl) || m.mediaUrl,
    type: ({ image: 'Image', video: 'Video', pdf: 'PDF', url: 'URL' })[m.mediaType] || 'Image',
    name: m.name || `Creative ${i + 1}`, displayDurationSec: m.displayDurationSec || 15, durationSec: m.displayDurationSec || 15 }));
}

export async function uploadEmergencyMedia(items) {
  const media = [];
  for (const item of items) {
    // Retain successful uploads if another file fails and the user retries.
    if (!item.url) {
      const result = item.type === 'Video' ? await uploadVideo(item.file) : await uploadFile(item.file, 'emergency');
      const url = result?.url || result?.data?.url;
      if (!url) throw new Error(`Upload did not return a URL for ${item.name}`);
      item.url = resolveFileUrl(url) || url;
    }
    media.push({ mediaUrl: item.url, mediaType: item.type.toLowerCase(), name: item.name,
      displayDurationSec: Math.max(1, Math.min(300, Number(item.displayDurationSec) || item.durationSec || 15)) });
  }
  return media;
}

export function EmergencyMediaPreview({ items, emergencyNumber = '', selectedIndex = 0 }) {
  const [index, setIndex] = useState(selectedIndex);
  useEffect(() => { setIndex(selectedIndex); }, [selectedIndex]);
  const active = items[index] || items[0];
  useEffect(() => {
    if (items.length < 2) return;
    const timer = setTimeout(() => setIndex(i => (i + 1) % items.length), (Number(active?.displayDurationSec) || 15) * 1000);
    return () => clearTimeout(timer);
  }, [active, items, index]);
  const src = active?.previewUrl || active?.url || undefined;
  const youtube = extractYouTubeId(src || '');
  return <div className="space-y-2">
    <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">Transit Screen Media Preview {active ? `• ${Math.min(index + 1, items.length)} / ${items.length}` : ''}</p>
    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-300 dark:border-zinc-700 flex items-center justify-center">
      {!active ? <p className="text-xs text-zinc-400">Attach an image, video, PDF or URL to preview.</p> :
        youtube ? <iframe key={src} title={active.name} src={`https://www.youtube.com/embed/${youtube}?autoplay=1&mute=1`} allow="autoplay" className="w-full h-full border-0" /> :
        active.type === 'Video' ? <video key={src} src={src} autoPlay loop muted playsInline className="w-full h-full object-contain" /> :
        ['PDF', 'URL'].includes(active.type) ? <iframe key={src} title={active.name} src={src} className="w-full h-full border-0 bg-white" /> :
        <img src={src} alt={active.name} className="w-full h-full object-contain" />}
      {emergencyNumber.trim() && <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-md bg-red-600 text-white px-4 py-2 text-sm font-black">EMERGENCY: {emergencyNumber}</div>}
    </div>
  </div>;
}

export function EmergencyCreativeEditor({ items, onChange, emergencyNumber, disabled = false }) {
  const fileInputRef = useRef(null);
  const objectUrls = useRef(new Set());
  const [type, setType] = useState('All');
  const [url, setUrl] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  useEffect(() => {
    const urls = objectUrls.current;
    return () => urls.forEach(value => URL.revokeObjectURL(value));
  }, []);
  const attach = files => {
    const added = [];
    for (const file of Array.from(files || [])) {
      const fileType = file.type.startsWith('video/') ? 'Video' : file.type === 'application/pdf' ? 'PDF' : file.type.startsWith('image/') ? 'Image' : null;
      if (!fileType) { toast.error(`Unsupported file: ${file.name}`); continue; }
      if (file.size > (fileType === 'Video' ? 500 : 50) * 1024 * 1024) { toast.error(`File too large: ${file.name}`); continue; }
      const previewUrl = URL.createObjectURL?.(file) || '';
      if (previewUrl) objectUrls.current.add(previewUrl);
      const item = { id: `${Date.now()}-${Math.random()}`, name: file.name, type: fileType, file, previewUrl,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`, durationSec: 15, displayDurationSec: 15 };
      added.push(item);
      if (previewUrl && fileType === 'Video') {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          const duration = Number.isFinite(video.duration) ? Math.max(1, Math.round(video.duration)) : 15;
          onChange(prev => prev.map(i => i.id === item.id ? { ...i, resolution: `${video.videoWidth} ? ${video.videoHeight}`, duration: `${duration} sec`, durationSec: duration,
            displayDurationSec: i.durationEdited ? i.displayDurationSec : Math.min(300, duration) } : i));
          video.removeAttribute('src'); video.load();
        };
        video.src = previewUrl;
      }
      if (previewUrl && fileType === 'Image') {
        const image = new Image();
        image.onload = () => onChange(prev => prev.map(i => i.id === item.id ? { ...i, resolution: `${image.naturalWidth} ? ${image.naturalHeight}` } : i));
        image.src = previewUrl;
      }
    }
    onChange(prev => [...prev, ...added]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const remove = id => {
    const item = items.find(i => i.id === id);
    if (objectUrls.current.has(item?.previewUrl)) { URL.revokeObjectURL(item.previewUrl); objectUrls.current.delete(item.previewUrl); }
    onChange(prev => prev.filter(i => i.id !== id));
    setSelectedIndex(0);
  };
  const addUrl = () => {
    let parsed;
    try { parsed = new URL(url.trim()); } catch { toast.error('Enter a valid HTTP or HTTPS media URL.'); return; }
    if (!['https:', 'http:'].includes(parsed.protocol)) { toast.error('Use an HTTP or HTTPS media URL.'); return; }
    if (items.some(i => i.url === parsed.href)) { toast.error('This URL is already attached.'); return; }
    const mediaType = /\.(mp4|webm|mov)$/i.test(parsed.pathname) ? 'Video' : /\.pdf$/i.test(parsed.pathname) ? 'PDF' : /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(parsed.pathname) ? 'Image' : 'URL';
    onChange(prev => [...prev, { id: `${Date.now()}-${Math.random()}`, url: parsed.href, previewUrl: parsed.href, type: mediaType,
      name: mediaType === 'Video' ? 'Motion Video Feed' : parsed.pathname.split('/').pop() || 'Online Media', displayDurationSec: 15, durationSec: 15 }]);
    setUrl('');
  };
  return <fieldset disabled={disabled} className="min-w-0 space-y-6 disabled:opacity-60">
    <div><h2 className="text-lg font-black text-slate-900 dark:text-white">Upload Creative Assets or Video URL</h2>
      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Attach multiple creatives. Files upload on submit; each plays in sequence for its configured duration (1–300 seconds).</p></div>
    <div className="flex gap-2 overflow-x-auto border-b border-slate-200 dark:border-zinc-800 pb-3">
      {[['All', 'All Creatives', IconFolder], ['Image', 'Image', IconImage], ['Video', 'Video', IconVideo], ['PDF', 'PDF Document', IconDocument], ['URL', 'URL (YouTube / Web)', IconLink]].map(([value, label, Icon]) =>
        <button type="button" key={value} onClick={() => setType(value)} className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 flex gap-2 items-center ${type === value ? 'bg-slate-900 dark:bg-blue-600 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300'}`}><Icon className="w-4 h-4" />{label}</button>)}
    </div>
    <input ref={fileInputRef} type="file" multiple accept={type === 'Image' ? 'image/*' : type === 'Video' ? 'video/*' : type === 'PDF' ? 'application/pdf' : 'image/*,video/*,application/pdf'} onChange={e => attach(e.target.files)} className="hidden" />
    {type === 'URL' ? <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800 space-y-3">
      <label htmlFor="emergency-media-url" className="text-xs font-bold text-slate-700 dark:text-zinc-200">YouTube / Web Media URL</label>
      <input id="emergency-media-url" type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="Paste HTTPS image, video, PDF or YouTube URL" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white text-sm" />
      <button type="button" onClick={addUrl} disabled={!url.trim()} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold disabled:opacity-50">Add to Creatives List</button>
    </div> : <button type="button" onClick={() => fileInputRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (!disabled) attach(e.dataTransfer.files); }} className="w-full border-2 border-dashed border-slate-300 dark:border-zinc-700 rounded-2xl p-8 text-center bg-slate-50/60 dark:bg-zinc-800/40 hover:bg-slate-100 dark:hover:bg-zinc-800">
      <IconFolder className="w-10 h-10 mx-auto mb-3 text-slate-500" /><span className="block text-sm font-black text-slate-900 dark:text-white">Upload Creative Assets (Select Multiple Files)</span>
      <span className="block text-xs text-slate-500 mt-2">Drag & drop files here, or click to browse</span>
      <span className="block text-xs text-slate-500 mt-3">Images / PDFs up to 50 MB • Videos up to 500 MB • Uploads on submit</span>
    </button>}
    <CreativeAssetsGallery creativeItems={items} selectedPreviewIndex={selectedIndex} fileInputRef={fileInputRef}
      handleRemoveMedia={() => { items.forEach(i => { if (objectUrls.current.has(i.previewUrl)) URL.revokeObjectURL(i.previewUrl); }); objectUrls.current.clear(); onChange([]); setSelectedIndex(0); }}
      handleCreativeDurationChange={(id, raw) => onChange(prev => prev.map(i => i.id === id ? { ...i, durationEdited: true, displayDurationSec: raw === '' ? '' : Math.max(1, Math.min(300, Number(raw) || 15)) } : i))}
      handleSelectPreviewItem={setSelectedIndex} handleRemoveCreativeItem={remove} />
    <EmergencyMediaPreview items={items} selectedIndex={selectedIndex} emergencyNumber={emergencyNumber} />
  </fieldset>;
}

export function EmergencyPlaylistViewer({ broadcast }) {
  const items = React.useMemo(() => readEmergencyMedia(broadcast), [broadcast]);
  const [selected, setSelected] = useState(0);
  return <div className="space-y-4">
    <p className="text-sm font-bold text-slate-800 dark:text-white">Creative Assets ({items.length})</p>
    <EmergencyMediaPreview items={items} selectedIndex={selected} emergencyNumber={broadcast.emergency_number || broadcast.emergencyNumber || ''} />
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {items.map((item, i) => <button type="button" key={item.id} onClick={() => setSelected(i)} className="p-3 rounded-xl border border-slate-200 dark:border-zinc-700 text-left text-xs text-slate-700 dark:text-zinc-200">
        <span className="font-bold">{i + 1}. {item.name}</span> · {item.type} · {item.displayDurationSec} sec
      </button>)}
    </div>
  </div>;
}
