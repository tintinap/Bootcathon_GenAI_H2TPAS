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
  // const [chatHistory, setChatHistory] = useState([
  //   {
  //     content: "hi",
  //     role: "user",
  //   },
  //   {
  //     content:
  //       "Based on the provided context, the top 10 albums by sales are:\n\n1. Minha Historia - TotalSales: 27\n2. Greatest Hits - TotalSales: 26\n3. Unplugged - TotalSales: 25\n4. Acústico - TotalSales: 22\n5. Greatest Kiss - TotalSales: 20\n6. Prenda Minha - TotalSales: 19\n7. Chronicle, Vol. 2 - TotalSales: 19\n8. My Generation - The Very Best Of The Who - TotalSales: 19\n9. International Superhits - TotalSales: 18\n10. Chronicle, Vol. 1 - TotalSales: 18",
  //     role: "assistant",
  //   },
  // ]);
  const [chatHistory, setChatHistory] = useState<IChatHistory[]>([]);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const scrollableDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollDown();
  }, []);

  // useEffect(() => {
  //   if (
  //     chatHistory.length > 0 &&
  //     chatHistory[chatHistory.length - 1].role === "user"
  //   ) {
  //     setTimeout(() => {
  //       exxyReply();
  //     }, 3000);
  //   }
  // }, [chatHistory]);

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
    setIsLoading(true);
    setChatHistory([
      ...chatHistory,
      {
        content: prompt,
        role: "user",
      },
    ]);

    const res = await fetch("http://127.0.0.1:5000/ask-typhoon", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        history: chatHistory,
        recent: { content: quickReply ? quickReply : prompt, role: "user" },
      }),
    });

    const data = await res.json();
    setChatHistory([...chatHistory, data[data.length - 1]]);
    setPrompt("");
    scrollDown();
  }

  // function exxyReply() {
  //   let tmp = [...chatHistory];
  //   if (chatHistory[chatHistory.length - 1].content === "ริว") {
  //     tmp.push({
  //       content: "ไอ้ริว ​ฮ่า ๆๆ",
  //       role: "assistant",
  //     });
  //   } else {
  //     tmp.push({
  //       content: "ฉันไม่เข้าใจว่าคุณกำลังพูดถึงอะไร โปรดถามอีกครั้งได้ไหม ?",
  //       role: "assistant",
  //     });
  //   }
  //   setChatHistory(tmp);
  //   setIsLoading(false);

  //   scrollDown();
  // }

  return (
    <div className="w-dvw h-dvh overflow-hidden text-[#737373]">
      <section className="text-black flex items-center justify-between h-[80px] bg-white border-b px-6">
        <div>
          <img src="/logo.svg" />
        </div>
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
                GenAI for ExxonMobil Business People
              </p>
              <div className="flex gap-6 justify-evenly py-10 flex-wrap">
                <SuggestCard
                  onClick={() => {
                    askExxy(
                      "the most sold product in the last month of ExxonMobil lubricants"
                    );
                  }}
                >
                  the{" "}
                  <span className="font-bold text-[#D20002]">
                    most sold product
                  </span>{" "}
                  in the <b>last month</b> of ExxonMobil lubricants
                </SuggestCard>
                <SuggestCard
                  onClick={() => {
                    askExxy(
                      "Which Distributor had the highest sales in the past half year?"
                    );
                  }}
                >
                  Which{" "}
                  <span className="font-bold text-[#D20002] uppercase">
                    Distributor
                  </span>{" "}
                  had the{" "}
                  <span className="font-bold text-[#D20002] uppercase">
                    highest sales
                  </span>{" "}
                  in the <b>past half</b> year?
                </SuggestCard>
                <SuggestCard
                  onClick={() => {
                    askExxy(
                      "The less sold product in the last year of ExxonMobil lubricants"
                    );
                  }}
                >
                  The{" "}
                  <span className="font-bold text-[#D20002] uppercase">
                    less sold product
                  </span>{" "}
                  in the <b>last year</b> of ExxonMobil lubricants
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
              text="......."
              // text="· · ·  G E N E R A T I N G  · · ·"
            />
          )}
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
