import { useQuery } from "@tanstack/react-query";
import React from "react";
import Picker from "@emoji-mart/react";
import axios from "axios";

const EmojiPicker = ({ onClick }: { onClick: (value: any) => void }) => {
  const { data } = useQuery({
    queryKey: ["emoji"],
    queryFn: async () => {
      const response = await axios.get(
        "https://cdn.jsdelivr.net/npm/@emoji-mart/data"
      );
      return response.data.json();
    },
    staleTime: Infinity,
  });
  return (
    <Picker data={data} onEmojiSelect={(e: any) => onClick(e)} set="native" />
  );
};

export default EmojiPicker;
