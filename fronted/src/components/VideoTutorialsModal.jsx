import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { extractYouTubeId, isValidWebUrl } from '../utils/mediaUtils';
import { getSkillLevelBadgeClass, getCategoryBadgeClass } from '../constants/videoConstants';

export const VideoTutorialsModal = ({ isOpen, onClose, academyData = null }) => {
  // Purely dynamic academy data with zero static mock fallback
  const activeAcademy = useMemo(() => {
    const rawVideos = Array.isArray(academyData?.videos) ? academyData.videos : [];
    return {
      badge: academyData?.badge || 'Video Academy',
      title: academyData?.title || 'Interactive Video Tutorials & SOPs',
      description: academyData?.description || 'Operational runbooks, practical video lessons, and system walkthroughs.',
      videos: rawVideos.map((v, i) => ({
        id: v.id || `vid-${i + 1}`,
        title: v.title || `Tutorial Lesson ${i + 1}`,
        duration: v.duration ? String(v.duration).trim() : '',
        level: v.level || 'Beginner',
        category: v.category || 'Getting Started',
        desc: v.desc || v.description || '',
        url: v.url || v.video_url || '',
        chapters: Array.isArray(v.chapters)
          ? v.chapters.filter(Boolean)
          : typeof v.chapters === 'string' && v.chapters.trim()
            ? v.chapters.split(',').map((c) => c.trim()).filter(Boolean)
            : [],
      })),
    };
  }, [academyData]);

  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected video derived directly to prevent cascading renders
  const selectedVideo = useMemo(() => {
    if (!activeAcademy.videos || activeAcademy.videos.length === 0) return null;
    return activeAcademy.videos.find((v) => v.id === selectedVideoId) || activeAcademy.videos[0];
  }, [activeAcademy.videos, selectedVideoId]);

  const categories = useMemo(() => {
    if (!activeAcademy?.videos || activeAcademy.videos.length === 0) return ['All'];
    const cats = new Set(activeAcademy.videos.map((v) => v.category).filter(Boolean));
    return ['All', ...Array.from(cats)];
  }, [activeAcademy]);

  const filteredVideos = useMemo(() => {
    if (!activeAcademy?.videos) return [];
    return activeAcademy.videos.filter((v) => {
      const matchCat = selectedCategory === 'All' || v.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (v.title && v.title.toLowerCase().includes(q)) ||
        (v.desc && v.desc.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [activeAcademy, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  // Media player type checks
  const ytVideoId = selectedVideo?.url ? extractYouTubeId(selectedVideo.url) : null;
  const isDirectVideoUrl =
    Boolean(selectedVideo?.url &&
    isValidWebUrl(selectedVideo.url) &&
    /\.(mp4|webm|ogg|mov)$/i.test(selectedVideo.url));
  const isGenericWebUrl =
    Boolean(selectedVideo?.url &&
    isValidWebUrl(selectedVideo.url) &&
    !ytVideoId &&
    !isDirectVideoUrl);

  const hasVideos = activeAcademy.videos && activeAcademy.videos.length > 0;

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 md:p-6 md:pl-64 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl lg:max-w-5xl max-h-[88vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 text-xl shrink-0">
              🎥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-700">
                  {activeAcademy.badge}
                </span>
                <span className="text-[11px] font-bold text-slate-400">Interactive Walkthroughs</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                {activeAcademy.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        {!hasVideos ? (
          /* Empty state when no dynamic videos are configured */
          <div className="flex-1 flex flex-col items-center justify-center p-12 sm:p-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center text-3xl shadow-xs text-blue-600">
              🎥
            </div>
            <div className="max-w-md space-y-1.5">
              <h3 className="text-base font-black text-slate-900">
                No Video Tutorials Configured
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                There are currently no video walkthroughs published for this portal. Operational videos added in Content Manager will appear here automatically.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Close Window
            </button>
          </div>
        ) : (
          /* Dual Column Layout with Dynamic Videos */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Video Screen (7 Columns) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Real Player vs Pure Structural Frame (Zero Dummy Data) */}
              {ytVideoId ? (
                /* 1. Real YouTube Player */
                <div className="relative aspect-video rounded-2xl bg-slate-950 overflow-hidden border border-slate-800 shadow-xl">
                  <iframe
                    title={selectedVideo?.title}
                    src={`https://www.youtube-nocookie.com/embed/${ytVideoId}?autoplay=1&rel=0`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : isDirectVideoUrl ? (
                /* 2. Real Direct HTML5 Video Player */
                <div className="relative aspect-video rounded-2xl bg-slate-950 overflow-hidden border border-slate-800 shadow-xl flex items-center justify-center">
                  <video
                    key={selectedVideo.url}
                    src={selectedVideo.url}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : isGenericWebUrl ? (
                /* 3. Real External Video Stream Link */
                <div className="relative aspect-video rounded-2xl bg-slate-900 overflow-hidden border border-slate-800 shadow-xl flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-2xl mb-3 shadow-inner">
                    🔗
                  </div>
                  <h4 className="text-white text-base font-bold line-clamp-1 max-w-md">
                    {selectedVideo?.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    External streaming endpoint linked. Click below to view in a secure browser tab.
                  </p>
                  <a
                    href={selectedVideo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shadow-md"
                  >
                    <span>Launch Video Stream</span>
                    <span>↗</span>
                  </a>
                </div>
              ) : (
                /* 4. Pure Media Structural Frame (No Dummy Simulator, No Fake 02:14 Timer) */
                <div className="relative aspect-video rounded-2xl bg-slate-950 border border-slate-800/90 shadow-xl flex flex-col justify-between p-5 overflow-hidden">
                  {/* Subtle ambient pattern */}
                  <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

                  {/* Top Bar inside structural frame */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-500" />
                      <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                        Media Frame
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      No Media Stream URL Linked
                    </span>
                  </div>

                  {/* Center Structure Icon & Clean Notice */}
                  <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto py-2">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center text-2xl shadow-inner mb-3">
                      🎥
                    </div>
                    <h3 className="text-white text-base font-black px-4 line-clamp-1 max-w-md">
                      {selectedVideo?.title || 'Tutorial Overview'}
                    </h3>
                    <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed font-normal">
                      No media stream URL linked to this tutorial lesson. Provide a YouTube link or upload a video file in Content Manager to enable playback.
                    </p>
                  </div>

                  {/* Bottom Structural Bar: Category, Skill Level & Duration */}
                  <div className="relative z-10 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getCategoryBadgeClass(selectedVideo?.category)}`}>
                        {selectedVideo?.category || 'Getting Started'}
                      </span>
                      <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${getSkillLevelBadgeClass(selectedVideo?.level)}`}>
                        {selectedVideo?.level || 'Beginner'}
                      </span>
                    </div>
                    {selectedVideo?.duration ? (
                      <span className="text-[11px] font-mono text-slate-400">
                        Duration: {selectedVideo.duration}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500">
                        Structure Ready
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Video Details Card */}
              {selectedVideo && (
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-extrabold text-slate-900">
                      {selectedVideo.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getCategoryBadgeClass(selectedVideo.category)}`}>
                        {selectedVideo.category}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getSkillLevelBadgeClass(selectedVideo.level)}`}>
                        {selectedVideo.level}
                      </span>
                      {selectedVideo.duration && (
                        <span className="text-[11px] font-mono font-medium text-slate-600 bg-white border border-slate-200 px-2.5 py-0.5 rounded-md">
                          ⏱ {selectedVideo.duration}
                        </span>
                      )}
                    </div>
                  </div>

                  {selectedVideo.desc && (
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {selectedVideo.desc}
                    </p>
                  )}

                  {/* Chapters / Timestamps (Only rendered if present) */}
                  {selectedVideo.chapters && selectedVideo.chapters.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/70">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Lesson Chapters:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedVideo.chapters.map((ch, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-mono font-medium text-slate-700 shadow-2xs"
                          >
                            {ch}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Playlist & Search (5 Columns) */}
            <div className="lg:col-span-5 flex flex-col space-y-3">
              {/* Search Input */}
              <div className="relative">
                <svg
                  className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search tutorials by topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Playlist Header */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider pt-1">
                <span>Tutorial Playlist ({filteredVideos.length})</span>
                <span>Select Lesson</span>
              </div>

              {/* Playlist Items */}
              <div className="space-y-2 overflow-y-auto max-h-[420px] pr-1">
                {filteredVideos.map((vid) => {
                  const isCurrent = selectedVideo?.id === vid.id;
                  const vidYtId = vid.url ? extractYouTubeId(vid.url) : null;

                  return (
                    <div
                      key={vid.id}
                      onClick={() => setSelectedVideoId(vid.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex gap-3 group ${
                        isCurrent
                          ? 'bg-blue-50/70 border-blue-400 shadow-sm ring-1 ring-blue-400'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {/* Thumbnail box */}
                      <div className="w-16 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 relative overflow-hidden group-hover:shadow transition-shadow">
                        {vidYtId ? (
                          <img
                            src={`https://img.youtube.com/vi/${vidYtId}/mqdefault.jpg`}
                            alt={vid.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-sm">🎥</span>
                        )}
                        {vid.duration && (
                          <span className="absolute bottom-0.5 right-0.5 text-[8px] font-mono bg-black/80 px-1 rounded text-white">
                            {vid.duration}
                          </span>
                        )}
                      </div>

                      {/* Text Details with Unified Category & Skill Level Badges */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getCategoryBadgeClass(vid.category)}`}>
                            {vid.category}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getSkillLevelBadgeClass(vid.level)}`}>
                            {vid.level}
                          </span>
                        </div>
                        <h4
                          className={`text-xs font-bold leading-tight line-clamp-1 mt-1.5 ${
                            isCurrent ? 'text-blue-950 font-black' : 'text-slate-900 group-hover:text-blue-600'
                          }`}
                        >
                          {vid.title}
                        </h4>
                        {vid.desc && (
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {vid.desc}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}

                {filteredVideos.length === 0 && (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-2xl">🔍</span>
                    <p className="text-xs font-bold text-slate-700 mt-2">No tutorials match your search</p>
                    <p className="text-[11px] text-slate-400 mt-1">Try clearing filters or search query</p>
                  </div>
                )}
              </div>

              {/* Clean Academy Count & Close Footer */}
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-between mt-auto">
                <span className="text-xs text-slate-500 font-medium">
                  {activeAcademy.videos.length} {activeAcademy.videos.length === 1 ? 'tutorial' : 'tutorials'} configured
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export default VideoTutorialsModal;
