export default function SuggestCard({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: any;
}) {
  return (
    <div
      className="flex-1 text-center flex justify-center items-center px-4 py-6 bg-white min-h-[200px] hover:bg-[#FEF2F2] capitalize rounded-2xl border border-[#E5E5E5] cursor-pointer"
      onClick={onClick}
    >
      <div>{children}</div>
    </div>
  );
}
