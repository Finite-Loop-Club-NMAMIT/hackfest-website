import React from 'react';

import { MessageCircle } from 'lucide-react';
import { Button } from '~/components/ui/button';

export default function ChatButton() {

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button 
        onClick={() => {
            if(typeof window !== "undefined"){
                window.location.href = "/chat";
            }
        }}
        size="icon"
        className="h-14 w-14 rounded-full bg-blue-600 shadow-lg hover:bg-blue-700"
        aria-label="Open chat"
      >
        <MessageCircle className="h-7 w-7" />
      </Button>
    </div>
  );
}
