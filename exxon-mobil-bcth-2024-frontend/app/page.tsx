"use client";
import { useEffect, useRef, useState } from "react";
import Search from "./components/button/search";
import SparklesText from "./components/magicui/sparkles";
import MessageUser from "./components/message/user";
import MessageAI from "./components/message/ai";

export default function Home() {
  const [chatHistory, setChatHistory] = useState([
    {
      content: "hi",
      role: "user",
    },
    {
      content: "Hello! How can I help you today?",
      role: "assistant",
    },
  ]);
  const [prompt, setPrompt] = useState("");

  const scrollableDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollDown();
  }, []);


  useEffect(() => {
    if (chatHistory[chatHistory.length - 1].role === "user") {
      setTimeout(() => {
        exxyReply();
      }, 1000);
    }
  }, [chatHistory]);

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      askExxy();
    }
  };

  function scrollDown() {
    const scrollableDiv = scrollableDivRef.current;
    if (scrollableDiv) {
      scrollableDiv.scrollTop = scrollableDiv.scrollHeight;
    }
  }

  async function askExxy() {
    // call API
    let tmp = [...chatHistory];
    tmp.push({ content: prompt, role: "user" });

    setChatHistory(tmp);
    setPrompt("");
  }

  function exxyReply() {
    let tmp = [...chatHistory];
    if (chatHistory[chatHistory.length - 1].content === "ริว") {
      tmp.push({
        content: "ไอ้ริว ​ฮ่า ๆๆ",
        role: "assistant",
      });
    } else {
      tmp.push({
        content: "ฉันไม่เข้าใจว่าคุณกำลังพูดถึงอะไร โปรดถามอีกครั้งได้ไหม ?",
        role: "assistant",
      });
    }
    setChatHistory(tmp);
    scrollDown();
  }

  return (
    <div className="w-dvw h-dvh overflow-hidden text-[#737373]">
      <section className="text-black flex items-center justify-between h-[80px] bg-white border-b px-6">
        <div>
          <SparklesText text="Magic UI" />
        </div>
        <div>PROFILE</div>
      </section>
      <section className="flex justify-center relative h-[calc(100%-80px)] bg-white">
        <div
          ref={scrollableDivRef}
          className="w-full max-w-[1024px] h-[80%] p-8 overflow-y-scroll"
        >
          {chatHistory.map((chat: any, index: number) => {
            if (chat.role === "user") {
              return (
                <MessageUser
                  key={index}
                  text={chat.content}
                  is_lastest={false}
                />
              );
            } else {
              return (
                <MessageAI
                  key={index}
                  text={chat.content}
                  is_lastest={chatHistory.length - 1 === index}
                />
              );
            }
          })}
        </div>
        <div className="absolute bottom-0 w-full max-w-[1024px] h-[20%]">
          <Search onClick={() => askExxy()} />
          <textarea
            className="w-full h-full p-6 rounded-tl-[32px] rounded-tr-[32px] border outline-0 text-[#737373]"
            placeholder="Type your prompt e.g. Total sale last month"
            value={prompt}
            onChange={(e: any) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
          ></textarea>
        </div>
      </section>
    </div>
  );
}
