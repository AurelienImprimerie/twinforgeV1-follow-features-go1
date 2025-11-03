import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
  containerId?: string;
}

const Portal: React.FC<PortalProps> = ({ children, containerId = 'portal-root' }) => {
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let container = document.getElementById(containerId);

    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      document.body.appendChild(container);
    }

    containerRef.current = container;

    return () => {
      if (containerRef.current && containerRef.current.childNodes.length === 0) {
        containerRef.current.remove();
      }
    };
  }, [containerId]);

  if (!containerRef.current) {
    return null;
  }

  return createPortal(children, containerRef.current);
};

export default Portal;
