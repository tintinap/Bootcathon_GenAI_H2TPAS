import React from "react";
import TypingAnimation from "../magicui/typing-animation";

export default function MessageAI({
  text,
  is_lastest = true,
}: {
  text: string;
  is_lastest: boolean;
}) {
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("ก๊อปปี้ข้อความในคลิปบอร์ดสำเร็จ !");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  const linkifyText = (text: string) => {
    const urlPattern =
      /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    const wwwPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    return text
      .replace(
        urlPattern,
        '<a href="$1" className="underline" target="_blank" rel="noopener noreferrer">$1</a>'
      )
      .replace(
        wwwPattern,
        '$1<a href="http://$2" className="underline" target="_blank" rel="noopener noreferrer">$2</a>'
      );
  };

  return (
    <div className="flex gap-4 justify-between items-start w-full p-4 rounded-2xl bg-white mb-4">
      <div className="flex gap-4 items-start">
        <img src="/ai_star.svg" />
        <div>
          {is_lastest ? (
            <TypingAnimation text={linkifyText(text)} />
          ) : (
            text.split("\n").map((line, index) => (
              <React.Fragment key={index}>
                <span
                  dangerouslySetInnerHTML={{ __html: linkifyText(line) }}
                ></span>
                <br />
              </React.Fragment>
            ))
          )}
        </div>
      </div>
      <div
        className="cursor-pointer flex justify-start items-start"
        onClick={() => copyToClipboard()}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M9 18C8.45 18 7.97917 17.8042 7.5875 17.4125C7.19583 17.0208 7 16.55 7 16V4C7 3.45 7.19583 2.97917 7.5875 2.5875C7.97917 2.19583 8.45 2 9 2H18C18.55 2 19.0208 2.19583 19.4125 2.5875C19.8042 2.97917 20 3.45 20 4V16C20 16.55 19.8042 17.0208 19.4125 17.4125C19.0208 17.8042 18.55 18 18 18H9ZM9 16H18V4H9V16ZM5 22C4.45 22 3.97917 21.8042 3.5875 21.4125C3.19583 21.0208 3 20.55 3 20V6H5V20H16V22H5Z"
            fill="#737373"
          />
        </svg>
      </div>
    </div>
  );
}
