"use client";

import { Menu, MessageSquare, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/lib/utils";
import { useDeviceType } from "@/hooks/useMediaQuery";

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
  selectedConversationId?: string;
}

// SidebarContent as reusable subcomponent
const SidebarContent: React.FC<SidebarContentProps> = ({
  allSavedConversation,
  handleSelectSavedConversation,
  handleDeleteConversation,
  startNewChat,
  selectedConversationId,
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await handleDeleteConversation(id);
    setDeletingId(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <Button
          onClick={startNewChat}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1 px-2 py-3">
        <div className="space-y-1">
          {allSavedConversation.length === 0 ? (
            <div className="text-center text-muted-foreground text-lg py-8 px-4">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No saved conversations yet.</p>
              <p className="text-xs mt-1">Start a new chat to begin!</p>
            </div>
          ) : (
            allSavedConversation.map((conv) => {
              const isSelected = selectedConversationId === conv._id;
              const isDeleting = deletingId === conv._id;

              return (
                <div
                  key={conv._id}
                  className={cn(
                    "group relative flex items-center gap-2 rounded-lg transition-all duration-200 justify-between",
                    isSelected && "bg-accent/50",
                    isDeleting && "opacity-50 pointer-events-none"
                  )}
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      "text-left h-auto py-3 px-3 hover:bg-accent/70",
                      isSelected &&
                        "bg-accent text-accent-foreground font-medium"
                    )}
                    onClick={() =>
                      handleSelectSavedConversation(
                        JSON.parse(conv.history),
                        conv._id
                      )
                    }
                  >
                    <MessageSquare className="w-4 h-4 mr-2 flex-shrink-0" />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-lg truncate">
                        {conv.title || "Untitled Chat"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {new Date(conv.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </Button>

                  <Button
                    variant="destructive"
                    size="icon"
                    className={cn("h-8 w-8")}
                    onClick={() => handleDelete(conv._id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

interface ConversationsSidebarProps extends SidebarContentProps {
  renderMobileToggle?: (toggleFn: () => void) => React.ReactNode;
}

export const ConversationsSidebar = ({
  allSavedConversation,
  handleSelectSavedConversation,
  handleDeleteConversation,
  startNewChat,
  selectedConversationId,
}: ConversationsSidebarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isMobile } = useDeviceType();
  const [internalSelectedId, setInternalSelectedId] = useState<
    string | undefined
  >(selectedConversationId);

  const handleSelectConversation = (history: any[], id: string) => {
    setInternalSelectedId(id);
    handleSelectSavedConversation(history, id);
    setMobileOpen(false); // Close mobile sidebar after selection
  };

  const handleNewChat = () => {
    setInternalSelectedId(undefined);
    startNewChat();
    setMobileOpen(false);
  };

  const toggleMobileSidebar = () => setMobileOpen(!mobileOpen);

  return (
    <>
      {/* Desktop Sidebar - Always visible on large screens */}
      {!isMobile && (
        <aside className="hidden lg:flex h-screen bg-card border-r border-border shadow-lg z-20">
          <SidebarContent
            allSavedConversation={allSavedConversation}
            handleSelectSavedConversation={handleSelectConversation}
            handleDeleteConversation={handleDeleteConversation}
            startNewChat={handleNewChat}
            selectedConversationId={internalSelectedId}
          />
        </aside>
      )}

      {/* Mobile Toggle - Rendered via render prop if provided */}
      {isMobile && (
        <Button
          onClick={toggleMobileSidebar}
          variant="outline"
          size="sm"
          aria-label="Toggle conversations"
        >
          <MessageSquare className="h-4 w-4 mr-1.5 sm:mr-2" />
          <span className="text-xs sm:text-lg">Chats</span>
        </Button>
      )}

      {/* Mobile/Tablet Sidebar Drawer */}
      {mobileOpen && isMobile && (
        <>
          {/* Drawer */}
          <aside
            className={cn(
              "lg:hidden fixed top-0 left-0 bg-card w-full shadow-2xl z-50",
              "transform transition-transform duration-300 ease-in-out",
              mobileOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Conversations
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Sidebar Content */}
            <div className="h-[calc(100%-73px)]">
              <SidebarContent
                allSavedConversation={allSavedConversation}
                handleSelectSavedConversation={handleSelectConversation}
                handleDeleteConversation={handleDeleteConversation}
                startNewChat={handleNewChat}
                selectedConversationId={internalSelectedId}
              />
            </div>
          </aside>
        </>
      )}
    </>
  );
};

// Mobile Toggle Button Component - to be used in the header
export const ConversationsSidebarToggle = ({
  onToggle,
}: {
  onToggle: () => void;
}) => {
  return (
    <Button
      onClick={onToggle}
      variant="outline"
      size="sm"
      className="lg:hidden"
      aria-label="Toggle conversations"
    >
      <Menu className="h-4 w-4 mr-2" />
      <span className="text-lg">Chats</span>
    </Button>
  );
};
