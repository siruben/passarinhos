const { Constraint, World, Body, Vector } = Matter;

export function createSlingshot({ engine, render, anchor, body }) {
  const world = engine.world;
  const maxPull = 120;
  const power = 0.045;
  let dragging = false;
  let released = false;

  const constraint = Constraint.create({
    pointA: { x: anchor.x, y: anchor.y },
    bodyB: body,
    stiffness: 0.02,
    damping: 0.02,
    render: { strokeStyle: '#5fd3ff', lineWidth: 4 }
  });
  World.add(world, constraint);
  Body.setInertia(body, Infinity);

  const el = render.canvas;

  function getCanvasPos(e) {
    const rect = el.getBoundingClientRect();
    const scaleX = el.width / rect.width;
    const scaleY = el.height / rect.height;
    const src = (e.touches && e.touches.length > 0) ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top) * scaleY
    };
  }

  function isNear(p) {
    const dx = p.x - body.position.x;
    const dy = p.y - body.position.y;
    const r = body.circleRadius || 20;
    return (dx * dx + dy * dy) <= (r * r);
  }

  function clampPull(p) {
    const dir = Vector.sub(p, anchor);
    const mag = Vector.magnitude(dir);
    if (mag <= maxPull) return p;
    const nd = Vector.mult(Vector.normalise(dir), maxPull);
    return Vector.add(anchor, nd);
  }

  const onMouseDown = (e) => {
    if (released) return;
    if (!isNear(getCanvasPos(e))) return;
    dragging = true;
  };

  const onMouseMove = (e) => {
    if (!dragging || released) return;
    const p = clampPull(getCanvasPos(e));
    Body.setPosition(body, p);
    Body.setVelocity(body, { x: 0, y: 0 });
  };

  const onMouseUp = () => {
    if (!dragging || released) return;
    dragging = false;
    released = true;
    const pull = Vector.sub(anchor, body.position);
    const impulse = Vector.mult(pull, power);
    Body.setInertia(body, body.mass * (body.circleRadius ** 2));
    Body.setVelocity(body, impulse);
    constraint.bodyB = null;
  };

  const onTouchStart = (e) => { e.preventDefault(); onMouseDown(e); };
  const onTouchMove = (e) => { if (dragging && !released) e.preventDefault(); onMouseMove(e); };
  const onTouchEnd = () => { onMouseUp(); };

  el.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
  el.addEventListener('touchstart', onTouchStart, { passive: false });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('touchend', onTouchEnd);

  body.plugin = body.plugin || {};
  body.plugin.slingReleased = () => released;

  return {
    update() {},
    detach() {
      try { World.remove(world, constraint); } catch {}
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    }
  };
}