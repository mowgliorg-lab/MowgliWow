/*
  ✨ CHAOS ENGINE
  There are no comments.
  There is no explanation.
  It simply exists.
*/

(() => {
  const TAU = Math.PI * 2;
  let t = 0;
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  document.body.appendChild(canvas);
  
  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  const points = Array.from({ length: 111 }, () => ({
    x: Math.random(),
    y: Math.random(),
    a: Math.random() * TAU,
    s: 0.0001 + Math.random() * 0.0009,
    r: 0.001 + Math.random() * 0.004,
    f: Math.random() * 12
  }));

  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 512;
  analyser.smoothingTimeConstant = 0.94;
  const freq = new Uint8Array(analyser.frequencyBinCount);
  
  const unlock = () => {
    audioCtx.resume();
    const audio = document.getElementById('hypnosound');
    if(audio) {
      const src = audioCtx.createMediaElementSource(audio);
      src.connect(analyser);
      analyser.connect(audioCtx.destination);
      audio.play().catch(() => {});
    }
    document.removeEventListener('click', unlock);
  };
  document.addEventListener('click', unlock);

  function loop() {
    requestAnimationFrame(loop);
    t += 0.016;
    
    analyser.getByteFrequencyData(freq);
    const bass = freq.slice(0, 18).reduce((a,b) => a+b, 0) / (18 * 255);
    
    ctx.fillStyle = `rgba(0,0,0,${0.07 + bass * 0.11})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    points.forEach(p => {
      p.a += p.s + bass * 0.0007;
      p.x += Math.cos(p.a) * p.r;
      p.y += Math.sin(p.a) * p.r;
      
      if(p.x < -0.1) p.x = 1.1;
      if(p.x > 1.1) p.x = -0.1;
      if(p.y < -0.1) p.y = 1.1;
      if(p.y > 1.1) p.y = -0.1;
      
      const g = ctx.createRadialGradient(
        p.x * canvas.width, p.y * canvas.height, 0,
        p.x * canvas.width, p.y * canvas.height, 4 + bass * 17
      );
      
      const hue = (t * 12 + p.f) % 360;
      g.addColorStop(0, `hsla(${hue}, 100%, 70%, ${0.4 + bass * 0.5})`);
      g.addColorStop(1, 'transparent');
      
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x * canvas.width, p.y * canvas.height, 2 + bass * 12, 0, TAU);
      ctx.fill();
    });
    
    ctx.globalCompositeOperation = 'lighter';
    for(let i = 0; i < points.length; i++) {
      for(let j = i + 1; j < points.length; j++) {
        const dx = points[i].x - points[j].x;
        const dy = points[i].y - points[j].y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if(d < 0.07 + bass * 0.035) {
          ctx.strokeStyle = `rgba(80,180,255,${(0.07 - d) * 9 + bass * 0.4})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(points[i].x * canvas.width, points[i].y * canvas.height);
          ctx.lineTo(points[j].x * canvas.width, points[j].y * canvas.height);
          ctx.stroke();
        }
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  }
  
  loop();
})();
