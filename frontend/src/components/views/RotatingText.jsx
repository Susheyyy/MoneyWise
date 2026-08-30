import { useState, useEffect, useRef } from 'react';

const CSS = `
  @keyframes rotateIn  { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0);     opacity: 1; } }
  @keyframes rotateOut { from { transform: translateY(0);    opacity: 1; } to { transform: translateY(-120%); opacity: 0; } }
  .rt-word-enter { animation: rotateIn  0.35s cubic-bezier(0.22,1,0.36,1) forwards; }
  .rt-word-exit  { animation: rotateOut 0.35s cubic-bezier(0.22,1,0.36,1) forwards; }
`;

function RotatingText({
  texts = [],
  rotationInterval = 2000,
  mainClassName = '',
  loop = true,
  auto = true,
}) {
  const [phase, setPhase]               = useState('visible'); 
  const [displayIndex, setDisplayIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!auto || texts.length < 2) return;

    timerRef.current = setInterval(() => {
      
      setPhase('exit');

      setTimeout(() => {
        
        setDisplayIndex(prev => {
          const next = prev === texts.length - 1 ? (loop ? 0 : prev) : prev + 1;
          return next;
        });
        setPhase('enter');

        setTimeout(() => setPhase('visible'), 360);
      }, 340);

    }, rotationInterval);

    return () => clearInterval(timerRef.current);
  }, [auto, rotationInterval, texts.length, loop]);

  const animClass =
    phase === 'exit'  ? 'rt-word-exit'  :
    phase === 'enter' ? 'rt-word-enter' : '';

  return (
    <>
      <style>{CSS}</style>
      <span
        className={`${mainClassName} ${animClass}`.trim()}
        style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'baseline' }}
      >
        {texts[displayIndex]}
      </span>
    </>
  );
}

export default RotatingText;