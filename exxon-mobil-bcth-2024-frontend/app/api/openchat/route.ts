// app/api/submit/route.ts

import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

interface PostData {
  name: string;
  message: string;
}

// Function to handle the POST request
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Parse the JSON body
    const data: PostData = await req.json();

    // Process the data (this is where your logic goes)
    console.log("Received data:", data);

    // Send a response
    return NextResponse.json({ message: "Data received successfully", data });
  } catch (error: any) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { message: "Error processing request", error: error.message },
      { status: 500 }
    );
  }
}
