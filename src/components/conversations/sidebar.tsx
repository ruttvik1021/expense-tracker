"use client";

import { Menu, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

interface SidebarContentProps {
  allSavedConversation: {
    _id: string;
    title?: string;
    createdAt: string;
    history: string;
  }[];
  handleSelectSavedConversation: (history: any[], id: string) => void;
  handleDeleteConversation: (id: string) => void;
  startNewChat: () => void;
}

// SidebarContent as reusable subcomponent
const SidebarContent: React.FC<SidebarContentProps> = ({
  allSavedConversation,
  handleSelectSavedConversation,
  handleDeleteConversation,
  startNewChat,
}) => {
  return (
    <div className="space-y-2 p-2 w-full">
      <Button
        variant="ghost"
        className="w-full justify-start text-left overflow-hidden text-ellipsis whitespace-nowrap"
        onClick={startNewChat}
      >
        New Chat
      </Button>

      {allSavedConversation.map((conv) => (
        <div
          key={conv._id}
          className="flex items-center justify-between group gap-2"
        >
          <Button
            variant="ghost"
            className="w-full justify-start text-left overflow-hidden text-ellipsis whitespace-nowrap"
            onClick={() =>
              handleSelectSavedConversation(JSON.parse(conv.history), conv._id)
            }
          >
            {conv.title || new Date(conv.createdAt).toLocaleString()}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteConversation(conv._id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};

export const ConversationsSidebar = ({
  allSavedConversation,
  handleSelectSavedConversation,
  handleDeleteConversation,
  startNewChat,
}: SidebarContentProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  // ✅ Don't render the sidebar if there are no conversations
  if (!allSavedConversation.length) return <></>;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex h-screen bg-drawer text-primary border-r border-border shadow-md z-20">
        <SidebarContent
          allSavedConversation={allSavedConversation}
          handleSelectSavedConversation={handleSelectSavedConversation}
          handleDeleteConversation={handleDeleteConversation}
          startNewChat={startNewChat}
        />
      </aside>

      {/* Mobile: Top Bar with Hamburger */}
      <div className="md:hidden flex items-center justify-between bg-drawer border-b border-border shadow-md">
        <h2 className="text-3xl font-bold tracking-tight text-blue-700">
          Conversations
        </h2>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle sidebar"
        >
          {mobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Sidebar Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 flex">
          <div className="w-[260px] h-full bg-drawer text-black shadow-lg z-40">
            <SidebarContent
              allSavedConversation={allSavedConversation}
              handleSelectSavedConversation={handleSelectSavedConversation}
              handleDeleteConversation={handleDeleteConversation}
              startNewChat={startNewChat}
            />
          </div>
          <div
            className="flex-1 bg-black bg-opacity-40 z-30"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}
    </>
  );
};
