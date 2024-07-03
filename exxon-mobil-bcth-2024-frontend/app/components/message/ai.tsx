import TypingAnimation from "../magicui/typing-animation";

export default function MessageAI({
  text,
  is_lastest = true,
}: {
  text: string;
  is_lastest: boolean;
}) {
  return (
    <div className="flex justify-between items-center w-full p-4 rounded-2xl bg-white mb-4">
      <div className="flex gap-4 items-center">
        <img src="/ai_star.svg" />
        <div>{is_lastest ? <TypingAnimation text={text} /> : text}</div>
      </div>
      <div>COPY</div>
    </div>
  );
}
