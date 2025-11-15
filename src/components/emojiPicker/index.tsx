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
      theme={activeTheme === Modes.DARK ? Theme.DARK : Theme.LIGHT}
      style={{
        width: "100%",
      }}
    />
  );
};

export default Emoji;
