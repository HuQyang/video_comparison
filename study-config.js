// 将视频放入 videos/，或使用可直接访问的 HTTPS 视频链接。
// 每组必须有 3 个视频；id 必须唯一且稳定。内容变化后递增 version。
export const config = {
  id: 'three-video-quality', version: '1', title: '三视频质量评估',
  groups: [
    { id: 'scene-001', title: '对比组 01', videos: [
      { id: 'scene-001-a', src: 'videos/scene-001-a.mp4', prompt: 'A slow camera orbit around a wooden chair in a sunlit room.', method: 'Model 1' },
      { id: 'scene-001-b', src: 'videos/scene-001-b.mp4', prompt: 'The camera slowly moves around a chair, with sunlight streaming through the window.', method: 'Model 2' },
      { id: 'scene-001-c', src: 'videos/scene-001-c.mp4', prompt: 'A wooden chair in a bright room, captured by a smooth circular camera movement.', method: 'Model 3' },
    ] },
    { id: 'scene-002', title: '对比组 02', videos: [
      { id: 'scene-002-a', src: 'videos/scene-002-a.mp4', prompt: 'A camera moves forward along a quiet forest path in soft morning light.', method: 'Model 1' },
      { id: 'scene-002-b', src: 'videos/scene-002-b.mp4', prompt: 'A smooth dolly shot through a forest trail surrounded by tall trees.', method: 'Model 2' },
      { id: 'scene-002-c', src: 'videos/scene-002-c.mp4', prompt: 'Morning light falls on a woodland path as the camera gently advances.', method: 'Model 3' },
    ] },
  ],
};
