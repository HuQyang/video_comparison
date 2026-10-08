import { config } from './study-config.js';
import { validateConfig, createSession, validSession, results, toCsv } from './model.js';
const $ = id => document.getElementById(id);
try { validateConfig(config); } catch (e) { $('cards').textContent = e.message; throw e; }
const key = `video-comparison:${config.id}:${config.version}`;
let session;
try { const saved = JSON.parse(localStorage.getItem(key)); if (validSession(saved, config)) session = saved; } catch { /* Memory fallback. */ }
session ||= createSession(config);
let startedAt = Date.now(), draft = '', dirty = false;
function persist() {
  try { localStorage.setItem(key, JSON.stringify(session)); $('save-status').textContent = '✓ 进度已保存在本机'; $('save-status').classList.remove('error'); }
  catch { $('save-status').textContent = '无法本地保存，请保持页面打开并导出结果'; $('save-status').classList.add('error'); }
}
function group() { return config.groups.find(g => g.id === session.order[session.cursor]); }
function saveAnswer() {
  if (!draft) return;
  session.answers[group().id] = { winner: draft, note: $('note').value, at: new Date().toISOString(), elapsed: Date.now() - startedAt };
  dirty = false; persist();
}
function render() {
  startedAt = Date.now(); dirty = false;
  const g = group(), answer = session.answers[g.id]; draft = answer?.winner || '';
  const completed = config.groups.filter(g => session.answers[g.id]).length;
  $('count').textContent = `${completed} / ${config.groups.length}`;
  $('group-count').textContent = config.groups.length;
  $('progress').style.width = `${completed / config.groups.length * 100}%`;
  $('position').textContent = `COMPARISON ${String(session.cursor + 1).padStart(2, '0')} / ${session.order.length}`;
  const displayNumber = String(session.cursor + 1).padStart(2, '0');
  const detail = (g.title || '').replace(/^对比组\s*\d+\s*(?:[·:：-]\s*)?/, '').trim();
  $('group-title').textContent = `对比组 ${displayNumber}${detail ? ` · ${detail}` : ''}`;
  $('study-name').textContent = `${config.title} · v${config.version}`;
  $('complete').hidden = completed !== config.groups.length;
  $('groups').replaceChildren(...session.order.map((id, i) => {
    const b = document.createElement('button'); b.textContent = `对比组 ${String(i + 1).padStart(2, '0')}`;
    b.className = `${i === session.cursor ? 'current' : ''} ${session.answers[id] ? 'answered' : ''}`;
    if (i === session.cursor) b.setAttribute('aria-current', 'step');
    b.onclick = () => navigate(i); return b;
  }));
  $('cards').replaceChildren(...session.videoOrder[g.id].map((id, i) => {
    const item = g.videos.find(v => v.id === id), card = document.createElement('article'); card.className = 'card';
    card.innerHTML = `<div class="card-head">视频 ${'ABC'[i]} <span>OPTION ${'ABC'[i]}</span></div><div class="screen"><video controls playsinline muted loop preload="metadata"></video><div class="media-error" hidden></div></div><div class="prompt"><span>PROMPT / 提示词</span><p></p></div><label class="pick"><input type="radio" name="winner">选择视频 ${'ABC'[i]}</label>`;
    card.querySelector('p').textContent = item.prompt;
    const video = card.querySelector('video'); video.src = item.src; video.setAttribute('aria-label', `视频 ${'ABC'[i]}`);
    video.onerror = () => { const err = card.querySelector('.media-error'); err.textContent = `视频无法加载，请检查文件：${item.src}`; err.hidden = false; };
    const radio = card.querySelector('input'); radio.value = id; radio.checked = draft === id;
    return card;
  }));
  document.querySelector('input[value="tie"]').checked = draft === 'tie';
  $('note').value = answer?.note || ''; $('media-status').textContent = ''; $('previous').disabled = session.cursor === 0;
  $('next').textContent = session.cursor === session.order.length - 1 ? '保存本组答案 ✓' : '保存并继续 →';
  updateChoice();
}
function updateChoice() {
  $('next').disabled = !draft;
  document.querySelectorAll('.card').forEach(c => c.classList.toggle('selected', c.querySelector('input').checked));
  $('answer-status').textContent = dirty ? '选择已暂存，请确认保存' : session.answers[group().id] ? '✓ 本组已保存，可修改' : '请选择最佳视频';
}
// Save an unfinished selection separately so refresh cannot silently lose it.
function stashDraft() { session.drafts ||= {}; session.drafts[group().id] = { winner: draft, note: $('note').value }; persist(); }
function restoreDraft() { const d = session.drafts?.[group().id]; if (d && ['', 'tie', ...group().videos.map(v => v.id)].includes(d.winner)) { draft = d.winner; $('note').value = typeof d.note === 'string' ? d.note : ''; document.querySelectorAll('input[name=winner]').forEach(r => r.checked = r.value === draft); dirty = true; updateChoice(); } }
function navigate(i) { if (dirty) stashDraft(); session.cursor = i; persist(); render(); restoreDraft(); }
document.addEventListener('change', e => { if (e.target.name === 'winner') { draft = e.target.value; dirty = true; stashDraft(); updateChoice(); } });
$('note').oninput = () => { dirty = true; stashDraft(); updateChoice(); };
$('rater').value = session.rater; $('rater').oninput = () => { session.rater = $('rater').value.trim(); persist(); };
$('previous').onclick = () => navigate(session.cursor - 1);
$('next').onclick = () => { saveAnswer(); if (session.drafts) delete session.drafts[group().id]; persist(); if (session.cursor < session.order.length - 1) navigate(session.cursor + 1); else render(); };
$('pause-all').onclick = () => document.querySelectorAll('video').forEach(v => v.pause());
$('play-all').onclick = async () => {
  const videos = [...document.querySelectorAll('video')];
  const outcome = await Promise.allSettled(videos.map(v => { v.currentTime = 0; return v.play(); }));
  $('media-status').textContent = outcome.some(r => r.status === 'rejected') ? '部分视频无法播放，请检查文件或使用播放器单独播放。' : '已请求同时播放；加载速度可能造成轻微时间差。';
};
function exportData() { if (dirty && draft) { saveAnswer(); if (session.drafts) delete session.drafts[group().id]; persist(); render(); } return results(session, config); }
function download(extension) {
  const data = exportData(), blob = new Blob([extension === 'json' ? JSON.stringify(data, null, 2) : toCsv(data)], { type: extension === 'json' ? 'application/json;charset=utf-8' : 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob), link = document.createElement('a'); link.href = url; link.download = `${config.id}-${session.id}.${extension}`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  $('export-status').textContent = data.complete ? '已导出全部答案，请将文件交给研究者。' : '已导出当前进度（尚有未完成的对比组）。';
}
$('json').onclick = () => download('json'); $('csv').onclick = () => download('csv');
$('copy').onclick = async () => { const data = exportData(); try { await navigator.clipboard.writeText(JSON.stringify(data, null, 2)); $('export-status').textContent = data.complete ? '全部结果已复制，请发送给研究者。' : '当前进度已复制（尚未全部完成）。'; } catch { $('export-status').textContent = '无法访问剪贴板，请使用下载 JSON。'; } };
$('reset').onclick = () => { if (confirm('重新开始会清除本机当前进度。请先导出需要保留的结果。是否继续？')) { session = createSession(config); $('rater').value = ''; persist(); render(); $('export-status').textContent = ''; } };
persist(); render(); restoreDraft();
