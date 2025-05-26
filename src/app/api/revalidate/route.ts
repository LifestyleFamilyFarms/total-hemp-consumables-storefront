import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function GET(req: NextRequest) {
  // Verify revalidation secret  return Response.json({ message: "-GET- Revalidation endpoint -GET-" }, { status: 200 })
  const searchParams = req.nextUrl.searchParams
  const secret = searchParams.get("secret")
  const tags = searchParams.get("tags") as string

  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Invalid revalidation secret" }, { status: 401 })
  }

  if (!tags) {
    return NextResponse.json({ error: "No tags provided" }, { status: 400 })
  }

  const tagsArray = tags.split(",")
  await Promise.all(
    tagsArray.map(async (tag) => {
      switch (tag) {
        case "products":
          // Revalidate main products page
          revalidatePath("/us/store/products")
          // Revalidate individual product pages
          revalidatePath("/[countryCode]/(main)/products/[handle]", "page")
          break
        case "collections":
          revalidatePath("/us/store/collections")
          revalidatePath("/[countryCode]/(main)/collections/[handle]", "page")
          break
        case "categories":
          revalidatePath("/us/store/categories")
          revalidatePath("/[countryCode]/(main)/categories/[handle]", "page")
          break
        case "regions":
          revalidatePath("/", "page")
          break
        default:
          console.warn(`Unknown revalidation tag: ${tag}`)
      }
    })
  )

  return NextResponse.json({ 
    message: "Revalidated successfully",
    revalidatedTags: tagsArray 
  }, { status: 200 })
}
