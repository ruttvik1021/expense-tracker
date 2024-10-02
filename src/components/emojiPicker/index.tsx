import EmojiPicker, {
  EmojiClickData,
  EmojiStyle,
  Theme,
} from "emoji-picker-react";
import { useAuthContext } from "../wrapper/ContextWrapper";
import { Modes } from "../common/Toggles/ThemeToggle";

const Emoji = ({ onClick }: { onClick: (value: EmojiClickData) => void }) => {
  const { activeTheme } = useAuthContext();
  return (
    <EmojiPicker
      onEmojiClick={onClick}
      emojiStyle={EmojiStyle.NATIVE}
      className="w-full"
      theme={activeTheme === Modes.DARK ? Theme.DARK : Theme.LIGHT}
    />
  );
};

export default Emoji;
