"use client";
export default function search({ ...rest }) {
  return (
    <>
      <style jsx>{`
        .shadow-red {
          box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.08),
            0px 16px 40px -16px rgba(240, 0, 18, 0.5);
        }
      `}</style>
      <div className="cursor-pointer absolute right-5 top-5 w-fit bg-[#F00012] pt-[14px] pl-[14px] pr-[10px] pb-[10px] rounded-[100px] shadow-red" {...rest}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
        >
          <path
            d="M32.6667 35L22.1667 24.5C21.3333 25.1667 20.375 25.6944 19.2917 26.0833C18.2083 26.4722 17.0556 26.6667 15.8333 26.6667C12.8056 26.6667 10.2431 25.6181 8.14583 23.5208C6.04861 21.4236 5 18.8611 5 15.8333C5 12.8056 6.04861 10.2431 8.14583 8.14583C10.2431 6.04861 12.8056 5 15.8333 5C18.8611 5 21.4236 6.04861 23.5208 8.14583C25.6181 10.2431 26.6667 12.8056 26.6667 15.8333C26.6667 17.0556 26.4722 18.2083 26.0833 19.2917C25.6944 20.375 25.1667 21.3333 24.5 22.1667L35 32.6667L32.6667 35ZM15.8333 23.3333C17.9167 23.3333 19.6875 22.6042 21.1458 21.1458C22.6042 19.6875 23.3333 17.9167 23.3333 15.8333C23.3333 13.75 22.6042 11.9792 21.1458 10.5208C19.6875 9.0625 17.9167 8.33333 15.8333 8.33333C13.75 8.33333 11.9792 9.0625 10.5208 10.5208C9.0625 11.9792 8.33333 13.75 8.33333 15.8333C8.33333 17.9167 9.0625 19.6875 10.5208 21.1458C11.9792 22.6042 13.75 23.3333 15.8333 23.3333Z"
            fill="white"
          />
        </svg>
      </div>
    </>
  );
}
