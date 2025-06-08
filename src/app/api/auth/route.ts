import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server"; 
import { supabase } from "@/lib/db";

export async function POST(req: Request) {
  console.log("Syncing user with Supabase");
  try {
    const user = await currentUser(); // ✅ gets user on the server

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("userTable")
      .select("*")
      .eq("clerkID", user.id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Fetch Error:", fetchError.message);
      return NextResponse.json({ error: "Failed to check user" }, { status: 500 });
    }

    // 2. Insert if not found
    if (!existingUser) {
      const { data: insertedUser, error: insertError } = await supabase
        .from("userTable")
        .insert({
          clerkID: user.id,
          emailAddress: user.emailAddresses[0]?.emailAddress ?? null,
          fullName: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
          imageUrl: user.imageUrl,
        })
        .select();

      if (insertError) {
        console.error("Insert Error:", insertError.message);
        return NextResponse.json({ error: "Failed to insert user" }, { status: 500 });
      }

      return NextResponse.json({ message: "User inserted", user: insertedUser }, { status: 201 });
    }

    // 3. Already exists
    return NextResponse.json({ message: "User already exists", user: existingUser }, { status: 200 });

  } catch (err) {
    console.error("Unexpected Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
