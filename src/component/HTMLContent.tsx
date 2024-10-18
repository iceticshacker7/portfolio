import React, { useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Expand } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

const HTMLContent: React.FC<{ content: string; category: boolean }> = ({ content, category }) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Function to update iframe height based on the message from the iframe content
  const handleIframeMessage = (event: MessageEvent) => {
    if (event.data && event.data.height && iframeRef.current) {
      iframeRef.current.style.height = event.data.height + 'px';
    }
  };

  useEffect(() => {
    window.addEventListener('message', handleIframeMessage);

    return () => {
      window.removeEventListener('message', handleIframeMessage);
    };
  }, []);

  return (
    <div className="w-full">
      {category && (
        <Dialog>
          <DialogTrigger asChild>
            <Button className="mb-2">
              <Expand className="h-4 w-4 mr-2" />
              Expand
            </Button>
          </DialogTrigger>
          <DialogContent className="w-full max-w-7xl h-[90vh]">
            <iframe
              ref={iframeRef}
              src={content}
              title="HTML Content"
              className="w-full rounded-lg"
              style={{ border: 'none', height: '100vh' }}
            />
          </DialogContent>
        </Dialog>
      )}
      <iframe
        ref={iframeRef}
        src={content}
        title="HTML Content"
        className="w-full rounded-lg"
        style={{ border: 'none', height: '100vh' }}
      />
    </div>
  );
};

export default HTMLContent;
