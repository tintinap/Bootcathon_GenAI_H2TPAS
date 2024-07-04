"use client";
export default function search({ ...rest }) {
  return (
    <>
      <style jsx>{`
        .shadow-red {
          box-shadow: 0px 4px 8px -1px rgba(0, 0, 0, 0.16), 0px 8px 40px -8px rgba(240, 0, 18, 0.80);
        }
      `}</style>
      <div className="cursor-pointer absolute right-5 top-5 w-fit bg-[#F00012] pt-[5.61px] pl-[9.61px] pr-[5.61px] pb-[9.61px] rounded-[100px] shadow-red" {...rest}>
        <img src="/send.svg" />
      </div>
    </>
  );
}
