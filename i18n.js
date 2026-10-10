// UI language. Labels are stored as option codes, so switching language never changes saved or exported answers.
const STORE = 'video-comparison:lang';
const param = new URLSearchParams(location.search).get('lang');
let saved = null; try { saved = localStorage.getItem(STORE); } catch {}
export let lang = ['zh', 'en'].includes(param) ? param : ['zh', 'en'].includes(saved) ? saved : (navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en';
export function setLang(l) { lang = l; try { localStorage.setItem(STORE, l); } catch {} }

const text = {
 zh: {
  pageTitle:'生成视频多维标注台', brandSub:'生成视频多维标注台', rater:'标注者', raterPh:'姓名或匿名编号', help:'怎么标', switchLang:'English',
  h1:'逐段观看，记录运动与画面变化。', intro:'每组 A/B/C 分别标注，三个都可以或都不可以。选择“说不准”也可以；细节标签可多选。', labeled:'已标视频',
  rail:'对比组', railAria:'选择对比组', privacyStrong:'随机展示', privacy:' · 每组视频顺序固定保存。结果仅保存在当前浏览器，请导出给研究者。',
  tabsAria:'本组视频', replay:'从头播放', speedSlow:'0.5× 慢放', speedNormal:'1× 原速', promptLabel:'PROMPT / 提示词', previous:'← 上一段', following:'下一段 →',
  completeH:'全部视频已标注 ✓', completeP:'请下载或复制结果，交给研究者。点击左侧列表可修改。', sheetTip:'逐题选择 · 数字键 1–5 回答当前题',
  detailsSummary:'细节标签和备注（可选）', issueTime:'异常时间段（秒）', issueTimePh:'例如 2.5–4.0；或全程', note:'备注', notePh:'例如：第 3 秒桌腿形变，背景向右漂移',
  saveNext:'保存并下一段 →', saveLast:'保存本段标签 ✓', json:'下载 JSON', csv:'下载 CSV', copy:'复制全部结果（JSON）', legacy:'导出旧版三选一结果', reset:'重新开始',
  guideTitle:'怎么标', guide1:'每段视频回答七道问题，三段视频独立判断。看近远处相对位移和遮挡变化，区分真实移动与原地转动/变焦。',
  guide2:'自然运动（人走动、风吹植物等）与生成异常可以同时存在，请分别勾选。刚体整体位移不等于非刚性形变，但会影响静态场景适用性。',
  guide3:'数字键 1–5 回答高亮题；← → 切换视频。所有编辑自动暂存，七题填写后计入完成。保存按钮确认并进入下一段。',
  guide4:'像素分辨率自动读取；清晰度需要人工判断。局部形变、漂移、畸变可以在细节里标记并记录时间段。结果不会自动上传。', closeGuide:'知道了',
  saved:'✓ 标签已保存在本机', saveFail:'无法本地保存，请保持页面打开并导出', qDone:'✓ 七题已填写，可继续添加细节或保存下一段', qDraft:'已暂存，请填写剩余问题（可选说不准）',
  groupBtn:'对比组 {n} · {k}/3', videoTab:'视频 {x}', groupTitle:'对比组 {n}', labelTitle:'视频 {x} · 独立标注', readingMeta:'读取分辨率…', meta:'{w} × {h} · {d} 秒',
  mediaError:'视频无法加载：{src}。请修复文件后再标注。', mediaNone:'媒体未加载', labeledEdit:'✓ 本段已标注，可修改', fillSeven:'请填写七道问题，拿不准可选说不准',
  mustComplete:'请完成七道题；拿不准时选择说不准。', studyName:'{title} · 标签格式 v{v}', playFail:'播放失败，请检查视频文件。',
  exportedAll:'已导出全部视频标签，请交给研究者。', exportedPartial:'已导出当前进度，未填写的标签保留为空。', copiedAll:'全部标签已复制。', copiedPartial:'当前标签已复制（尚未全部完成）。',
  copyFail:'无法复制，请下载 JSON。', legacyDone:'已导出旧版三选一记录；新标签独立保存。', legacyNone:'此浏览器没有旧版三选一记录。',
  resetConfirm:'请先导出需要保留的新标签。重新开始仅重置新版标注，旧版记录保留。是否继续？',
 },
 en: {
  pageTitle:'Generated Video Annotation', brandSub:'Generated video annotation', rater:'Rater', raterPh:'Name or anonymous ID', help:'How to label', switchLang:'中文',
  h1:'Watch each clip and record camera motion and visual changes.', intro:'Label videos A, B and C of each group separately; all three may pass or all may fail. “Unsure” is a valid answer, and detail tags allow several choices.', labeled:'videos labeled',
  rail:'Groups', railAria:'Choose a group', privacyStrong:'Random order', privacy:' · The video order in each group is saved. Results stay in this browser only; please export them for the researcher.',
  tabsAria:'Videos in this group', replay:'Replay from start', speedSlow:'0.5× slow', speedNormal:'1× normal', promptLabel:'PROMPT', previous:'← Previous', following:'Next →',
  completeH:'All videos labeled ✓', completeP:'Please download or copy the results and send them to the researcher. Click a group on the left to make changes.', sheetTip:'Answer each question · number keys 1–5 answer the highlighted one',
  detailsSummary:'Detail tags and notes (optional)', issueTime:'Problem time range (seconds)', issueTimePh:'e.g. 2.5–4.0, or “whole clip”', note:'Note', notePh:'e.g. table leg deforms at 3 s, background drifts right',
  saveNext:'Save and next →', saveLast:'Save this label ✓', json:'Download JSON', csv:'Download CSV', copy:'Copy all results (JSON)', legacy:'Export legacy pick-one results', reset:'Start over',
  guideTitle:'How to label', guide1:'Answer seven questions for each clip and judge the three clips independently. Watch how near and far objects shift relative to each other and how occlusions change, to tell real camera movement from rotating in place or zooming.',
  guide2:'Natural motion (people walking, plants in the wind, etc.) and generation errors can occur together; mark them separately. An object moving as a rigid whole is not a non-rigid deformation, but it still affects whether the clip works as a static scene.',
  guide3:'Number keys 1–5 answer the highlighted question; ← → switch clips. Every edit is saved automatically, and a clip counts as done once all seven questions are answered. The save button confirms and moves to the next clip.',
  guide4:'Pixel resolution is read automatically; clarity needs your judgement. Local deformation, drift and distortion can be tagged in the details, with a time range. Results are not uploaded automatically.', closeGuide:'Got it',
  saved:'✓ Labels saved in this browser', saveFail:'Cannot save locally; keep this page open and export', qDone:'✓ All seven answered; add details or save and continue', qDraft:'Draft saved; please answer the remaining questions (“Unsure” is allowed)',
  groupBtn:'Group {n} · {k}/3', videoTab:'Video {x}', groupTitle:'Group {n}', labelTitle:'Video {x} · label independently', readingMeta:'Reading resolution…', meta:'{w} × {h} · {d} s',
  mediaError:'Video failed to load: {src}. Please fix the file before labeling.', mediaNone:'Media not loaded', labeledEdit:'✓ This clip is labeled; you can still edit it', fillSeven:'Please answer all seven questions; choose “Unsure” if in doubt',
  mustComplete:'Please complete all seven questions; choose “Unsure” if in doubt.', studyName:'{title} · label format v{v}', playFail:'Playback failed; please check the video file.',
  exportedAll:'All video labels exported; please send them to the researcher.', exportedPartial:'Current progress exported; unanswered labels are left empty.', copiedAll:'All labels copied.', copiedPartial:'Current labels copied (not all complete yet).',
  copyFail:'Cannot copy; please download the JSON.', legacyDone:'Legacy pick-one records exported; new labels are stored separately.', legacyNone:'This browser has no legacy pick-one records.',
  resetConfirm:'Please export any labels you want to keep first. Starting over resets only the new labels; legacy records are kept. Continue?',
 },
};
export function t(key, vars = {}) { return (text[lang][key] ?? text.zh[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? ''); }

// English for schema.js, keyed by question key / option value / tag code (schema.js stays the source of the codes).
const schemaEn = {
 camera:['Does the camera really move?','Look at how near and far things move relative to each other, and at occlusions.',{static:'Barely moves (only things in the scene move)',noparallax:'Rotates in place or zooms (near and far move together)',parallax:'Really moves (near things move faster than far ones)'}],
 scene:['How does the scene content change?','',{none:'Nothing changes',plausible:'Plausible motion (people, animals, water, fire, wind)',inconsistent:'Implausible changes (deformation, things appearing or disappearing, inconsistent over time)',both:'Both plausible motion and implausible changes'}],
 static3d:['Could this serve as a capture of one static 3D scene?','',{yes:'Yes',mostly:'Mostly, with local problems',no:'No'}],
 clarity:['Image clarity','Judge the visible detail; the actual resolution is read by the player.',{clear:'Sharp, details distinguishable',soft:'Slightly blurry or lacking detail',blurry:'Clearly blurry'}],
 camera_match:['Does the camera motion match the prompt?','',{yes:'Matches',partial:'Partly matches',no:'Does not match'}],
 rigidity:['Do object shapes and scene structure stay rigid?','An object moving as a whole is not deformation; record natural motion separately in the detail tags.',{rigid:'Shapes and structure stay rigid',local:'Local non-rigid change or deformation',global:'Large-scale non-rigid change or deformation'}],
 severity:['Severity of implausible changes / distortion','',{none:'Not observed',mild:'Mild',obvious:'Noticeable',severe:'Severe'}],
};
const detailTitlesEn = ['Camera details','Plausible dynamics (multiple allowed)','Content and geometry details','Image details'];
const tagsEn = {A8:'Motion direction does not match the prompt',A9:'Very small motion',A10:'Cut or shot change mid-clip',A6:'Shaking, back-and-forth or jumps',
 D1:'People walking or moving',D2:'Animal motion',D3:'Plants, clothing etc. moving in the wind',D4:'Water, smoke, fire or other natural dynamics',
 B2:'Object moves or rotates as a whole (rigid)',B3:'Non-rigid deformation of an object',B4:'Object appears or disappears out of nowhere',B5:'Structure or count inconsistent over time',
 B6:'Background or layout changes',B7:'Texture, colour or lighting flicker',B8:'Does not match after turning away and back',B9:'Object position drifts',B10:'Background warping / geometric distortion',
 C1:'Blurry',C2:'Visible artifacts',C3:'Very rich detail',C4:'Simple image, almost no texture',C5:'Reflective, transparent, glass or water surfaces',C6:'Text, watermark or subtitles',C7:'Content does not match the prompt'};
export const qTitle = q => lang === 'en' ? schemaEn[q.key]?.[0] || q.title : q.title;
export const qHint = q => lang === 'en' ? (schemaEn[q.key] ? schemaEn[q.key][1] : q.hint) : q.hint;
export const optText = (q, value, zh) => lang === 'en' ? (value === 'unsure' ? 'Unsure' : schemaEn[q.key]?.[2][value] || zh) : zh;
export const detailTitle = (i, zh) => lang === 'en' ? detailTitlesEn[i] || zh : zh;
export const tagText = (code, zh) => lang === 'en' ? tagsEn[code] || zh : zh;
export const studyTitle = config => lang === 'en' && config.title_en ? config.title_en : config.title;

// Static page text: elements carry data-i18n (textContent), data-i18n-ph (placeholder) or data-i18n-aria (aria-label).
export function applyStatic() {
 document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN'; document.title = t('pageTitle');
 document.querySelectorAll('[data-i18n]').forEach(el => el.textContent = t(el.dataset.i18n));
 document.querySelectorAll('[data-i18n-ph]').forEach(el => el.placeholder = t(el.dataset.i18nPh));
 document.querySelectorAll('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
}
