"use client";
import { useEffect, useRef, useState } from "react";
import Search from "./components/button/search";
// import Sparkles from "./components/magicui/sparkles";
import SparklesText from "./components/magicui/sparkles-text";
import MessageUser from "./components/message/user";
import MessageAI from "./components/message/ai";
import SuggestCard from "./components/card/suggest";

export interface IChatHistory {
  content: string;
  role: string;
}

export default function Home() {
  const [chatHistory, setChatHistory] = useState<IChatHistory[]>([]);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const scrollableDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollDown();
  }, []);

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

  async function askExxy(quickReply?: string) {
    const tmpPrompt = quickReply ? quickReply : prompt;
    setIsLoading(true);
    const newChatHistory = [
      ...chatHistory,
      {
        content: tmpPrompt,
        role: "user",
      },
    ];
    setChatHistory(newChatHistory);
    setPrompt("");

    try {
      scrollDown();
      const res = await fetch("http://127.0.0.1:5000/ask-typhoon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          history: chatHistory,
          recent: { content: tmpPrompt, role: "user" },
        }),
      });

      if (!res.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await res.json();
      setChatHistory([...newChatHistory, await investigateData(data)]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
      scrollDown();
    }
  }

  async function investigateData(data: IChatHistory[]) {
    let tmp: string = await data[data.length - 1].content;

    if (
      tmp.includes("Source: Database") ||
      tmp.includes("Sorry") ||
      tmp.includes("sorry") ||
      tmp.includes("ขอโทษ") ||
      tmp.includes("ไม่สามารถ") ||
      tmp.includes("Apologize") ||
      tmp.includes("apologize") ||
      tmp.includes("แหล่งอ้างอิง")
    ) {
      return data[data.length - 1];
    } else {
      return {
        content:
          tmp +
          "\n\nSource: https://www.mobil.com/en/sap/our-products/products/mobil-super-2000-10w40",
        role: "assistant",
      };
    }
  }

  return (
    <div className="w-dvw h-dvh overflow-hidden text-[#737373]">
      <section className="text-black flex items-center justify-between h-[80px] bg-white border-b px-6">
        <div>
          <img src="/logo.svg" />
        </div>
        {/* AI */}
        <div
            className="text-sm hidden md:flex mx-auto p-2 bg-[#f5f5f5] items-center text-[#737373] leading-none lg:rounded-full lg:inline-flex"
            role="alert"
          >
            <span className="flex rounded-full bg-[#d4d4d4] uppercase px-2 py-1 text-xs font-bold mr-3">
              NOTICE
            </span>
            <span className="mr-2 text-left flex-auto">
              You're chatting with an AI. Please note, the information provided
              may not be accurate.
            </span>
            {/* <svg
              className="fill-current opacity-75 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M12.95 10.707l.707-.707L8 4.343 6.586 5.757 10.828 10l-4.242 4.243L8 15.657l4.95-4.95z" />
            </svg> */}
          </div>
          {/*  */}
        <div>
          <img src="/user.png" />
        </div>
      </section>
      <style jsx>{`
        .shadow-red {
          box-shadow: 0px 4px 24px -4px rgba(240, 0, 18, 0.8);
        }
      `}</style>

      <section className="flex justify-center relative h-[calc(100%-80px)] bg-white">
        <div className="flex flex-row md:flex-col gap-6 bg-[#fff] border border-[#E5E5E5] absolute left-6 top-6 rounded-3xl py-4">
          <div className="px-4">
            <div className="w-6 h-6 rounded-full bg-[#F00012] shadow-red">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M11 13H5V11H11V5H13V11H19V13H13V19H11V13Z"
                  fill="white"
                />
              </svg>
            </div>
          </div>
          <div className="px-4">
            <div className="w-6 h-6 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path d="M11 20V7H6V4H19V7H14V20H11Z" fill="#737373" />
              </svg>
            </div>
          </div>
          <div
            className="mx-4 cursor-pointer"
            onClick={() => setChatHistory([])}
          >
            <div className="w-6 h-6 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M9.4 16.5L12 13.9L14.6 16.5L16 15.1L13.4 12.5L16 9.9L14.6 8.5L12 11.1L9.4 8.5L8 9.9L10.6 12.5L8 15.1L9.4 16.5ZM7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6H4V4H9V3H15V4H20V6H19V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM17 6H7V19H17V6Z"
                  fill="#737373"
                />
              </svg>
            </div>
          </div>
        </div>

        {/*  */}
        <div
          ref={scrollableDivRef}
          className="w-full max-w-[1024px] h-[80%] p-4 md:p-8 overflow-y-scroll"
        >
          {/* Landing Page */}
          {chatHistory.length === 0 && (
            <section>
              <h2 className="text-[#171717] text-center text-5xl tracking-[-0.24px] py-4">
                Welcome
              </h2>
              <p className="text-[#737373] text-center text-2xl tracking-[-0.12px]">
                AI Assistant for ExxonMobil Business People
              </p>
              <div className="flex gap-6 justify-evenly py-10 flex-wrap">
                <SuggestCard
                  onClick={() => {
                    askExxy(
                      "the most sold product in the 30 days ago of ExxonMobil lubricants"
                    );
                  }}
                >
                  the{" "}
                  <span className="font-bold text-[#D20002]">
                    most sold product
                  </span>{" "}
                  in the <b>30 days ago</b> of ExxonMobil lubricants
                </SuggestCard>
                <SuggestCard
                  onClick={() => {
                    askExxy(
                      "what are the top 5 products by total scan? rank them for me?"
                    );
                  }}
                >
                  what are{" "}
                  <span className="font-bold text-[#D20002] uppercase">
                    the top 5 products
                  </span>{" "}
                  by total scan? rank them for me
                </SuggestCard>
                <SuggestCard
                  onClick={() => {
                    askExxy(
                      "What are Mobil Super FF Series Product features ?"
                    );
                  }}
                >
                  What are Mobil Super FF Series Product features ?
                </SuggestCard>
                <SuggestCard
                  onClick={() => {
                    askExxy(
                      "A report summarizing the total product sales of ExxonMobil lubricants for 2024"
                    );
                  }}
                >
                  A{" "}
                  <span className="font-bold text-[#D20002] uppercase">
                    report
                  </span>{" "}
                  summarizing the{" "}
                  <span className="font-bold text-[#D20002] uppercase">
                    total product sales
                  </span>{" "}
                  of ExxonMobil lubricants for 2024
                </SuggestCard>
              </div>
            </section>
          )}
          {/* Chat Page */}
          {chatHistory.map((chat: any, index: number) => {
            if (chat.role === "user") {
              return (
                <MessageUser
                  key={index}
                  text={chat.content}
                  is_lastest={false}
                />
              );
            } else if (chat.role === "assistant") {
              return (
                <MessageAI
                  key={index}
                  text={chat.content}
                  is_lastest={chatHistory.length - 1 === index}
                />
              );
            }
          })}

          {isLoading && (
            <SparklesText
              className="text-center !text-transparent py-4"
              text="· · · / G E N E R A T I N G / · · ·"
              // text="· · ·  G E N E R A T I N G  · · ·"
            />
          )}
        </div>

        <div className="absolute bottom-0 w-full max-w-[1024px] h-[20%]">
          <Search onClick={() => askExxy()} />
          <textarea
            className="resize-none w-full h-full p-6 rounded-tl-[32px] rounded-tr-[32px] border outline-0 text-[#737373]"
            placeholder="Type your prompt e.g. Total sale of Mobil Delvac Legend"
            value={prompt}
            onChange={(e: any) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
          ></textarea>
        </div>
      </section>
    </div>
  );
}
