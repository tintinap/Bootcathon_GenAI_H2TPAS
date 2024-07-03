import TypingAnimation from "../magicui/typing-animation";

export default function MessageUser({
  text,
  is_lastest,
}: {
  text: string;
  is_lastest: boolean;
}) {
  return (
    <div className="flex justify-between items-center w-full p-4 rounded-2xl bg-[#F5F5F5] mb-4">
      <div className="flex gap-4 items-center">
        <img src="/user.png" />
        <div>{is_lastest ? <TypingAnimation text={text} /> : text}</div>
      </div>
      <div>COPY</div>
    </div>
  );
}
