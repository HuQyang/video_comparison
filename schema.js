export const schemaVersion = '2';
export const questions = [
 {key:'camera',title:'镜头是否真的移动？',hint:'观察近处和远处的相对运动及遮挡关系。',options:[['static','几乎不动（只有场景里的东西在动）'],['noparallax','原地转动或变焦（近远处一起动）'],['parallax','真的在移动（近处比远处动得快）'],['unsure','说不准']]},
 {key:'scene',title:'场景内容如何变化？',options:[['none','没有东西变化'],['plausible','有合理运动（人、动物、水、火、风）'],['inconsistent','有不合理变化（形变、出现消失、前后不一致）'],['both','合理运动和不合理变化同时存在'],['unsure','说不准']]},
 {key:'static3d',title:'能当一个静态三维场景的拍摄吗？',options:[['yes','能'],['mostly','大体能，有局部问题'],['no','不能'],['unsure','说不准']]},
 {key:'clarity',title:'画面清晰度',hint:'判断可见细节；实际分辨率由播放器自动读取。',options:[['clear','清晰、细节可辨'],['soft','轻微模糊或细节不足'],['blurry','明显模糊'],['unsure','说不准']]},
 {key:'camera_match',title:'运镜是否符合提示词？',options:[['yes','符合'],['partial','部分符合'],['no','不符合'],['unsure','说不准']]},
 {key:'rigidity',title:'物体形状与场景结构是否保持刚性？',hint:'刚体整体移动不等于形变；自然动态在细节标签中单独记录。',options:[['rigid','形状与结构保持刚性'],['local','局部非刚性或形变'],['global','大范围非刚性或形变'],['unsure','说不准']]},
 {key:'severity',title:'不合理变化 / 畸变的严重程度',options:[['none','未观察到'],['mild','轻微'],['obvious','明显'],['severe','严重'],['unsure','说不准']]},
];
export const details = [
 {title:'镜头细节',options:[['A8','运动方向与提示词不符'],['A9','运动幅度很小'],['A10','中途剪辑或镜头切换'],['A6','抖动、来回或跳变']]},
 {title:'合理动态（可多选）',options:[['D1','人物走动或动作'],['D2','动物运动'],['D3','风吹植物、衣物等'],['D4','水、烟、火等自然动态']]},
 {title:'内容与几何细节',options:[['B2','物体整体移动或转动（刚体）'],['B3','物体非刚性形变'],['B4','物体凭空出现或消失'],['B5','结构或数量前后不一致'],['B6','背景或布局变化'],['B7','纹理、颜色或光照闪烁'],['B8','转过去再转回来对不上'],['B9','物体位置漂移'],['B10','背景扭曲 / 几何畸变']]},
 {title:'画面细节',options:[['C1','模糊'],['C2','明显伪影'],['C3','细节非常丰富'],['C4','画面简单、几乎没有纹理'],['C5','反光、透明、玻璃或水面'],['C6','文字、水印或字幕'],['C7','内容与提示词不符']]},
];
export const tagCodes = details.flatMap(g => g.options.map(o => o[0]));
export function completeLabel(a) { return !!a && questions.every(q => q.options.some(([v]) => a[q.key] === v)); }
