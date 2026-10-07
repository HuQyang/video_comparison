export function validateConfig(config) {
  if (!config.id || !config.version || !Array.isArray(config.groups) || !config.groups.length) throw new Error('请配置至少一组对比视频。');
  const ids = new Set();
  for (const group of config.groups) {
    if (!group.id || ids.has(group.id) || group.videos?.length !== 3) throw new Error('每组必须有唯一 id 和三个视频。');
    ids.add(group.id);
    const vids = new Set();
    for (const v of group.videos) {
      if (!v.id || vids.has(v.id) || !v.src || !v.prompt || !/^(https?:\/\/|\.?\.?\/|[\w-])/.test(v.src) || /^(javascript|data):/i.test(v.src)) throw new Error('视频需要唯一 id、有效路径和 prompt。');
      vids.add(v.id);
    }
  }
}
export function shuffle(items) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}
export function createSession(config) {
  return { snapshot: JSON.stringify(config), id: crypto.randomUUID(), rater: '', createdAt: new Date().toISOString(), cursor: 0,
    order: shuffle(config.groups.map(g => g.id)), videoOrder: Object.fromEntries(config.groups.map(g => [g.id, shuffle(g.videos.map(v => v.id))])), answers: {} };
}
export function validSession(s, config) {
  if (!s || s.snapshot !== JSON.stringify(config) || typeof s.id !== 'string' || typeof s.rater !== 'string' || !Number.isInteger(s.cursor) || s.cursor < 0 || s.cursor >= config.groups.length || !Array.isArray(s.order) || s.order.length !== config.groups.length || new Set(s.order).size !== config.groups.length || !s.answers || typeof s.answers !== 'object') return false;
  return config.groups.every(g => s.order.includes(g.id) && Array.isArray(s.videoOrder?.[g.id]) && s.videoOrder[g.id].length === 3 && new Set(s.videoOrder[g.id]).size === 3 && g.videos.every(v => s.videoOrder[g.id].includes(v.id)) && (!s.answers[g.id] || (['tie', ...g.videos.map(v => v.id)].includes(s.answers[g.id].winner) && typeof s.answers[g.id].note === 'string')));
}
export function results(s, config) {
  return { study_id: config.id, study_version: config.version, submission_id: s.id, rater: s.rater, created_at: s.createdAt, exported_at: new Date().toISOString(), complete: config.groups.every(g => s.answers[g.id]),
    responses: s.order.map((id, i) => { const g = config.groups.find(g => g.id === id), a = s.answers[id]; return { group_id: id, display_position: i + 1, winner_video_id: a?.winner || null, winner_method: a?.winner === 'tie' ? 'Tie' : g.videos.find(v => v.id === a?.winner)?.method || null, note: a?.note || '', answered_at: a?.at || null, response_time_ms: a?.elapsed ?? null, displayed_videos: s.videoOrder[id].map((vid, n) => ({ option: 'ABC'[n], ...g.videos.find(v => v.id === vid) })) }; }) };
}
const cell = value => '"' + String(value ?? '').replace(/^[=+@\-\t\r]/, "'$&").replaceAll('"', '""') + '"';
export function toCsv(data) {
  const head = ['study_id','study_version','submission_id','rater','complete','group_id','display_position','option','video_id','method','src','prompt','winner_video_id','winner_method','selected','note','answered_at','response_time_ms'];
  return '\uFEFF' + [head, ...data.responses.flatMap(r => r.displayed_videos.map(v => [data.study_id,data.study_version,data.submission_id,data.rater,data.complete,r.group_id,r.display_position,v.option,v.id,v.method,v.src,v.prompt,r.winner_video_id,r.winner_method,r.winner_video_id === v.id,r.note,r.answered_at,r.response_time_ms]))].map(row => row.map(cell).join(',')).join('\r\n');
}
