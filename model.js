import { schemaVersion, questions, details, tagCodes, completeLabel } from './schema.js';
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
 return { schemaVersion, snapshot:JSON.stringify(config), id:crypto.randomUUID(), rater:'', createdAt:new Date().toISOString(), cursor:0, active:0,
 order:shuffle(config.groups.map(g=>g.id)), videoOrder:Object.fromEntries(config.groups.map(g=>[g.id,shuffle(g.videos.map(v=>v.id))])), labels:{}, metadata:{} };
}
export const labelKey = (groupId,videoId) => JSON.stringify([groupId,videoId]);
// Carry a session over to a newer config (groups added as generation progresses): labels, rater, submission id and
// the order of groups already seen are kept; new groups are appended in random order after them.
export function mergeSession(s,config) {
 if (!s || s.schemaVersion!==schemaVersion || typeof s.id!=='string' || !s.labels || !Array.isArray(s.order)) return null;
 const byId=new Map(config.groups.map(g=>[g.id,g]));
 const kept=s.order.filter((id,i)=>byId.has(id) && s.order.indexOf(id)===i);
 const order=[...kept,...shuffle(config.groups.map(g=>g.id).filter(id=>!kept.includes(id)))];
 const videoOrder=Object.fromEntries(config.groups.map(g=>{const old=s.videoOrder?.[g.id], ids=g.videos.map(v=>v.id);
   return [g.id, Array.isArray(old) && old.length===3 && ids.every(v=>old.includes(v)) ? old : shuffle(ids)];}));
 const current=s.order[s.cursor], cursor=Math.max(0,order.indexOf(current));
 return {...s, snapshot:JSON.stringify(config), rater:typeof s.rater==='string'?s.rater:'', order, videoOrder, cursor,
   active:Number.isInteger(s.active)&&s.active>=0&&s.active<=2?s.active:0, metadata:s.metadata||{}};
}
export function validSession(s,config) {
 if (!s || s.schemaVersion!==schemaVersion || s.snapshot!==JSON.stringify(config) || typeof s.id!=='string' || typeof s.rater!=='string' || !Number.isInteger(s.cursor) || s.cursor<0 || s.cursor>=config.groups.length || !Number.isInteger(s.active) || s.active<0 || s.active>2 || !s.labels || !s.metadata || !Array.isArray(s.order) || s.order.length!==config.groups.length || new Set(s.order).size!==config.groups.length) return false;
 return config.groups.every(g=>s.order.includes(g.id) && Array.isArray(s.videoOrder?.[g.id]) && s.videoOrder[g.id].length===3 && new Set(s.videoOrder[g.id]).size===3 && g.videos.every(v=>{
   if (!s.videoOrder[g.id].includes(v.id)) return false;
   const a=s.labels[labelKey(g.id,v.id)];
   return !a || (typeof a==='object' && questions.every(q=>!a[q.key] || q.options.some(([value])=>value===a[q.key])) && Array.isArray(a.tags) && a.tags.every(t=>tagCodes.includes(t)) && typeof a.note==='string');
 }));
}
export function results(s,config) {
 const responses=s.order.flatMap((id,i)=>{const g=config.groups.find(g=>g.id===id);return s.videoOrder[id].map((vid,n)=>{
 const v=g.videos.find(v=>v.id===vid), key=labelKey(id,vid), a=s.labels[key];
 return {group_id:id,display_position:i+1,option:'ABC'[n],video_id:v.id,method:v.method||null,src:v.src,prompt:v.prompt,complete:completeLabel(a),labels:Object.fromEntries(questions.map(q=>[q.key,a?.[q.key]||null])),tags:a?.tags||[],note:a?.note||'',issue_time:a?.issue_time||'',answered_at:a?.at||null,response_time_ms:a?.elapsed??null,metadata:s.metadata[key]||null};
 });});
 return {study_id:config.id,study_version:config.version,schema_version:schemaVersion,submission_id:s.id,rater:s.rater,created_at:s.createdAt,exported_at:new Date().toISOString(),complete:responses.every(r=>r.complete),label_schema:{questions,details},responses};
}
const cell=value=>'"'+String(value??'').replace(/^[=+@\-\t\r]/,"'$&").replaceAll('"','""')+'"';
export function toCsv(data) {
 const head=['study_id','study_version','schema_version','submission_id','rater','group_id','display_position','option','video_id','method','src','prompt','complete',...questions.map(q=>q.key),...tagCodes,'note','issue_time','answered_at','response_time_ms','width','height','duration_seconds'];
 const rows=data.responses.map(r=>[data.study_id,data.study_version,data.schema_version,data.submission_id,data.rater,r.group_id,r.display_position,r.option,r.video_id,r.method,r.src,r.prompt,r.complete,...questions.map(q=>r.labels[q.key]),...tagCodes.map(t=>r.tags.includes(t)),r.note,r.issue_time,r.answered_at,r.response_time_ms,r.metadata?.width,r.metadata?.height,r.metadata?.duration_seconds]);
 return '\uFEFF'+[head,...rows].map(row=>row.map(cell).join(',')).join('\r\n');
}
