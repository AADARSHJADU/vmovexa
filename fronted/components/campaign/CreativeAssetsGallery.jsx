import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { IconPlus, IconVideo, IconDocument, IconLink, IconCheckCircle } from '../ui/CampaignIcons';

export function CreativeAssetsGallery({ creativeItems, selectedPreviewIndex, fileInputRef, handleRemoveMedia, handleCreativeDurationChange, handleSelectPreviewItem, handleRemoveCreativeItem }) {
 const { t } = useTranslation();
 return <>
            {/* Attached Creative Assets Gallery */}
            {creativeItems.length > 0 && (
              <div className="space-y-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      {t('campaign_create.attached_creative_assets', 'Attached Creative Assets')} ({creativeItems.length})
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
                      {t('campaign_create.preview_ready_badge', 'Preview Ready (Uploads on Submit)')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-200 transition-colors shadow-2xs flex items-center gap-1.5"
                    >
                      <IconPlus className="w-3.5 h-3.5" /> <span>{t('campaign_create.add_more_files', 'Add More Files')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveMedia}
                      className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-bold text-rose-700 dark:text-rose-400 transition-colors shadow-2xs"
                    >
                      {t('common.clear_all', 'Clear All')}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {creativeItems.map((item, idx) => {
                    const isSelected = selectedPreviewIndex === idx;
                    return (
                      <div
                        key={item.id || idx}
                        className={`flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                            : 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/50 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Thumbnail */}
                          {item.type === 'Image' ? (
                            <img
                              src={item.previewUrl || undefined}
                              alt={item.name}
                              className="w-14 h-12 rounded-lg object-cover border border-slate-200 shrink-0 bg-white"
                            />
                          ) : item.type === 'Video' ? (
                            <div className="w-14 h-12 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex flex-col items-center justify-center shrink-0">
                              <IconVideo className="w-5 h-5 text-indigo-600" />
                              <span className="text-[9px] font-black uppercase mt-1">{t('common.video', 'Video')}</span>
                            </div>
                          ) : item.type === 'PDF' ? (
                            <div className="w-14 h-12 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex flex-col items-center justify-center shrink-0">
                              <IconDocument className="w-5 h-5 text-rose-600" />
                              <span className="text-[9px] font-black uppercase mt-1">{t('common.pdf', 'PDF')}</span>
                            </div>
                          ) : (
                            <div className="w-14 h-12 rounded-lg bg-red-50 border border-red-200 text-red-700 flex flex-col items-center justify-center shrink-0">
                              <IconLink className="w-5 h-5 text-red-600" />
                              <span className="text-[9px] font-black uppercase mt-1">{t('common.url', 'URL')}</span>
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate" title={item.name}>
                              {item.name}
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                              <span className="font-semibold text-slate-700 dark:text-zinc-300">{item.type}</span> · {item.size} · {item.resolution}
                              {item.duration ? ` · ${item.duration}` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-1" title={t('advertiser.create.play_duration_hint')}>
                            <span className="text-[10px] font-bold text-slate-500 uppercase">{t('ag.advertiser.createcampaignpage.seq', 'Seq')} {idx + 1}</span>
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={item.displayDurationSec !== undefined ? item.displayDurationSec : (item.durationSec || 15)}
                              onChange={(e) => {
                                const digitsOnly = e.target.value.replace(/\D/g, '');
                                handleCreativeDurationChange(item.id, digitsOnly);
                              }}
                              onBlur={() => {
                                if (!item.displayDurationSec) {
                                  handleCreativeDurationChange(item.id, '15');
                                }
                              }}
                              className="w-14 px-1.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-xs font-bold text-slate-800 dark:text-white text-center"
                              aria-label={`Display seconds for ${item.name}`}
                            />
                            <span className="text-[10px] font-bold text-slate-500">{t('advertiser.create.sec')}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSelectPreviewItem(idx)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {isSelected && <IconCheckCircle className="w-3 h-3 text-white" />}
                            <span>{isSelected ? 'Viewing' : 'Preview'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveCreativeItem(item.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title={t('common.remove_asset', 'Remove asset')}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

</>;
}
